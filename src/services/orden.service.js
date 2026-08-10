import { Op } from "sequelize";
import { Funcion, FuncionButaca, ItemOrden, Orden, Pelicula, Sala, sequelize, Combo, Ticket } from "../models/index.js";
import { aCentavos, aPesos, porcentaje } from "../utils/dinero.js";

const MINUTOS_PAGO = 15;

export async function crearOrden(datos) {
    const { funcionId, butacaIds, combos = [], comprador, sesionId, usuarioId = null } = datos;

    if (!sesionId) {
        const error = new Error("Falta el identificador de sesión")
        error.status = 400;
        throw error
    }

    const funcion = await Funcion.findByPk(funcionId, {
        include: [
            { model: Pelicula, as: "pelicula", attributes: ["titulo", "clasificacion"] },
            { model: Sala, as: "sala", attributes: ["nombre"] },
        ]
    })

    validarFuncionVendible(funcion);

    const transaccion = await sequelize.transaction();

    try {
        const butacas = await FuncionButaca.findAll({
            where: { id: { [Op.in]: butacaIds }, funcionId },
            lock: transaccion.LOCK.UPDATE,
            transaction: transaccion
        });

        verificarButacasDisponibles(butacas, butacaIds, sesionId);

        const combosData = await obtenerCombos(combos, transaccion);

        const { items, subtotalCent } = construirItems(funcion, butacas, combosData);

        const pct = Number(process.env.CARGO_SERVICIO_PORCENTAJE || 10);
        const cargoCent = porcentaje(subtotalCent, pct);
        const totalCent = subtotalCent + cargoCent;

        const ahora = new Date();
        const orden = await Orden.create(
            {
                numero: generarNumeroOrden(ahora),
                usuarioId,
                emailComprador: comprador.email,
                nombreComprador: comprador.nombre,
                subtotal: aPesos(subtotalCent),
                cargoServicio: aPesos(cargoCent),
                total: aPesos(totalCent),
                estado: "pendiente",
                expiraEn: new Date(ahora.getTime() + MINUTOS_PAGO * 60 * 1000),
            },
            { transaction: transaccion }
        );

        await ItemOrden.bulkCreate(
            items.map((item) => ({ ...item, ordenId: orden.id })),
            { transaction: transaccion }
        )

        await FuncionButaca.update(
            { estado: "vendida", ordenId: orden.id, bloqueadaPor: null, expiraEn: null },
            { where: { id: { [Op.in]: butacaIds } }, transaction: transaccion }
        );

        await transaccion.commit();

        return {
            id: orden.id,
            numero: orden.numero,
            subtotal: aPesos(subtotalCent),
            cargoServicio: aPesos(cargoCent),
            total: aPesos(totalCent),
            estado: orden.estado,
            expiraEn: orden.expiraEn,
            items: items.map((i) => ({
                tipo: i.tipo,
                descripcion: i.descripcion,
                cantidad: i.cantidad,
                precioUnitario: i.precioUnitario,
                subtotal: i.subtotal,
            })),
        };
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
}

function verificarButacasDisponibles(butacas, butacaIds, sesionId) {
    if (butacas.length !== butacaIds.length) {
        const error = new Error("Alguna butaca no pertenece a esta función");
        error.status = 404;
        throw error;
    }

    const ahora = new Date();
    const invalidas = butacas.filter((b) => {
        if (b.estado !== "bloqueada") return true;
        if (b.bloqueadaPor !== sesionId) return true;
        if (!b.expiraEn || new Date(b.expiraEn) <= ahora) return true;
        return false;
    });

    if (invalidas.length > 0) {
        const error = new Error("Tu reserva expiró o alguien tomó esas butacas");
        error.status = 409;
        error.detalles = invalidas.map((b) => `${b.fila}${b.numero}`);
        throw error;
    }
}

async function obtenerCombos(combos, transaccion) {
    if (combos.length === 0) return [];

    const ids = combos.map((c) => c.comboId);
    const encontrados = await Combo.findAll({
        where: { id: { [Op.in]: ids }, activo: true },
        transaction: transaccion,
    });

    if (encontrados.length !== ids.length) {
        const error = new Error("Alguno de los combos no está disponible");
        error.status = 404;
        throw error;
    }

    return combos.map((pedido) => ({
        combo: encontrados.find((c) => c.id === pedido.comboId),
        cantidad: pedido.cantidad,
    }));
}

function construirItems(funcion, butacas, combosData) {
    const items = [];
    let subtotalCent = 0;

    const fecha = new Date(funcion.inicia).toLocaleString("es-AR", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });

    for (const butaca of butacas) {
        const precioCent = aCentavos(funcion.precioBase);
        subtotalCent += precioCent;

        items.push({
            tipo: "entrada",
            funcionButacaId: butaca.id,
            comboId: null,
            descripcion: `${funcion.pelicula.titulo} · ${funcion.sala.nombre} · ${fecha} · ${funcion.formato} · Fila ${butaca.fila} Butaca ${butaca.numero}`,
            cantidad: 1,
            precioUnitario: aPesos(precioCent),
            subtotal: aPesos(precioCent),
        });
    }

    for (const { combo, cantidad } of combosData) {
        const precioCent = aCentavos(combo.precio);
        const subCent = precioCent * cantidad;
        subtotalCent += subCent;

        items.push({
            tipo: "combo",
            funcionButacaId: null,
            comboId: combo.id,
            descripcion: combo.nombre,
            cantidad,
            precioUnitario: aPesos(precioCent),
            subtotal: aPesos(subCent),
        });
    }

    return { items, subtotalCent };
}

function generarNumeroOrden(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    return `CA-${y}${m}${d}-${aleatorio}`;
}

function validarFuncionVendible(funcion) {
    if (!funcion) {
        const error = new Error("La función no existe");
        error.status = 404;
        throw error;
    }
    if (funcion.estado !== "en_venta") {
        const error = new Error("Esta función no está disponible");
        error.status = 409;
        throw error;
    }
    if (new Date(funcion.inicia) <= new Date()) {
        const error = new Error("Esta función ya comenzó");
        error.status = 409;
        throw error;
    }
}

export async function obtenerOrden(ordenId) {
    const orden = await Orden.findByPk(ordenId, {
        include: [
            { model: ItemOrden, as: "items" },
            { model: Ticket, as: "tickets" }
        ]
    });

    if (!orden) {
        const error = new Error("La orden no existe");
        error.status = 404;
        throw error;
    }

    return {
        id: orden.id,
        numero: orden.numero,
        estado: orden.estado,
        emailComprador: orden.emailComprador,
        nombreComprador: orden.nombreComprador,
        subtotal: aPesos(aCentavos(orden.subtotal)),
        cargoServicio: aPesos(aCentavos(orden.cargoServicio)),
        total: aPesos(aCentavos(orden.total)),
        expiraEn: orden.expiraEn,
        pagadaEn: orden.pagadaEn,
        motivoCancelacion: orden.motivoCancelacion,
        items: orden.items.map((i) => ({
            tipo: i.tipo,
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precioUnitario: aPesos(aCentavos(i.precioUnitario)),
            subtotal: aPesos(aCentavos(i.subtotal)),
        })),
        tickets: orden.tickets.map((t) => ({
            id: t.id,
            codigo: t.codigo,
            qrToken: t.qrToken,
            estado: t.estado,
            usadoEn: t.usadoEn,
            datos: t.datosSnapshot,
        })),
    };
}
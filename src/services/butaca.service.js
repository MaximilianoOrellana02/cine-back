import { Op } from "sequelize";
import { sequelize, Funcion, FuncionButaca, Pelicula, Sala } from "../models/index.js";
import { aCentavos, aPesos } from "../utils/dinero.js";
import { expirarOrdenesVencidas } from "./limpieza.service.js";

export async function obtenerMapa(funcionId, sesionId) {
    await expirarOrdenesVencidas();
    const funcion = await Funcion.findByPk(funcionId, {
        include: [
            {
                model: Pelicula,
                as: "pelicula",
                attributes: ["id", "titulo", "posterUrl", "duracionMinutos", "clasificacion"],
            },
            {
                model: Sala,
                as: "sala",
                attributes: ["id", "nombre", "cantidadFilas", "cantidadColumnas"],
            }
        ]
    });

    if (!funcion) {
        const error = new Error("La funcion no existe");
        error.status = 404;
        throw error;
    }

    if (funcion.estado !== "en_venta") {
        const error = new Error("Esta función no está disponible para la venta");
        error.status = 409;
        throw error;
    }

    if (new Date(funcion.inicia) <= new Date()) {
        const error = new Error("Esta función ya comenzó");
        error.status = 409;
        throw error;
    }

    const butacas = await FuncionButaca.findAll({
        where: { funcionId },
        attributes: [
            "id", "fila", "numero", "tipo", "posX", "posY",
            "estado", "bloqueadaPor", "expiraEn",
        ],
        order: [["posY", "ASC"], ["posX", "ASC"]],
    });

    const ahora = new Date();
    const butacasMapeadas = butacas.map((b) => ({
        id: b.id,
        fila: b.fila,
        numero: b.numero,
        tipo: b.tipo,
        posX: b.posX,
        posY: b.posY,
        estado: calcularEstadoVisual(b, sesionId, ahora),
    }));

    return {
        funcion: {
            id: funcion.id,
            inicia: funcion.inicia,
            formato: funcion.formato,
            idioma: funcion.idioma,
            precioBase: aPesos(aCentavos(funcion.precioBase)),
            pelicula: {
                id: funcion.pelicula.id,
                titulo: funcion.pelicula.titulo,
                posterUrl: funcion.pelicula.posterUrl,
                duracionMinutos: funcion.pelicula.duracionMinutos,
                clasificacion: funcion.pelicula.clasificacion,
            },
            sala: {
                nombre: funcion.sala.nombre,
                filas: funcion.sala.cantidadFilas,
                columnas: funcion.sala.cantidadColumnas,
            },
        },
        butacas: butacasMapeadas,
    };
}

function calcularEstadoVisual(butaca, sesionId, ahora) {
    if (butaca.estado === "vendida") return "ocupada";

    if (butaca.estado === "bloqueada") {
        const vencido = !butaca.expiraEn || new Date(butaca.expiraEn) <= ahora;
        if (vencido) return "disponible";
        return butaca.bloqueadaPor === sesionId ? "seleccionada" : "bloqueada";
    }

    return "disponible";
}

const MINUTOS_BLOQUEO = 10;
const MAX_BUTACAS_POR_COMPRA = 8;

export async function bloquearButacas(funcionId, butacaIds, sesionId) {
    if (!sesionId) {
        const error = new Error("Falta el identificador de sesión");
        error.status = 400;
        throw error;
    }

    if (butacaIds.length > MAX_BUTACAS_POR_COMPRA) {
        const error = new Error(`No podés seleccionar más de ${MAX_BUTACAS_POR_COMPRA} butacas`);
        error.status = 400;
        throw error;
    }

    const funcion = await Funcion.findByPk(funcionId);
    validarFuncionVendible(funcion);

    const transaccion = await sequelize.transaction();

    try {
        const butacas = await FuncionButaca.findAll({
            where: {
                id: { [Op.in]: butacaIds },
                funcionId,
            },
            lock: transaccion.LOCK.UPDATE,
            transaction: transaccion,
        });

        if (butacas.length !== butacaIds.length) {
            const error = new Error("Alguna de las butacas no pertenece a esta función");
            error.status = 404;
            throw error;
        }

        const ahora = new Date();
        const noDisponibles = butacas.filter(
            (b) => !estaDisponiblePara(b, sesionId, ahora)
        );

        if (noDisponibles.length > 0) {
            const error = new Error("Alguien tomó esas butacas antes que vos");
            error.status = 409;
            error.detalles = noDisponibles.map((b) => `${b.fila}${b.numero}`);
            throw error;
        }

        const expiraEn = new Date(ahora.getTime() + MINUTOS_BLOQUEO * 60 * 1000);

        await FuncionButaca.update(
            {
                estado: "bloqueada",
                bloqueadaPor: sesionId,
                expiraEn,
            },
            {
                where: { id: { [Op.in]: butacaIds } },
                transaction: transaccion,
            }
        );

        await transaccion.commit();

        return {
            bloqueadas: butacas.map((b) => ({
                id: b.id,
                fila: b.fila,
                numero: b.numero,
                tipo: b.tipo,
            })),
            expiraEn,
            segundosRestantes: MINUTOS_BLOQUEO * 60,
        };
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
}

export async function liberarButacas(funcionId, butacaIds, sesionId) {
    if (!sesionId) {
        const error = new Error("Falta el identificador de sesión");
        error.status = 400;
        throw error;
    }

    const [liberadas] = await FuncionButaca.update(
        {
            estado: "libre",
            bloqueadaPor: null,
            expiraEn: null,
        },
        {
            where: {
                id: { [Op.in]: butacaIds },
                funcionId,
                estado: "bloqueada",
                bloqueadaPor: sesionId,
            },
        }
    );

    return { liberadas };
}

function estaDisponiblePara(butaca, sesionId, ahora) {
    if (butaca.estado === "vendida") return false;
    if (butaca.estado === "libre") return true;

    const vencido = !butaca.expiraEn || new Date(butaca.expiraEn) <= ahora;
    return vencido || butaca.bloqueadaPor === sesionId;
}

function validarFuncionVendible(funcion) {
    if (!funcion) {
        const error = new Error("La función no existe");
        error.status = 404;
        throw error;
    }
    if (funcion.estado !== "en_venta") {
        const error = new Error("Esta función no está disponible para la venta");
        error.status = 409;
        throw error;
    }
    if (new Date(funcion.inicia) <= new Date()) {
        const error = new Error("Esta función ya comenzó");
        error.status = 409;
        throw error;
    }
}
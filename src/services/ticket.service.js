import jwt from "jsonwebtoken"
import {
    sequelize,
    Orden,
    ItemOrden,
    FuncionButaca,
    Funcion,
    Pelicula,
    Sala,
    Ticket,
} from "../models/index.js";

export async function emitirTickets(ordenId) {
    const orden = await Orden.findByPk(ordenId, {
        include: [{ model: ItemOrden, as: "items", where: { tipo: "entrada" }, required: false }],
    });

    if (!orden) {
        const error = new Error("La orden no existe");
        error.status = 404;
        throw error;
    }

    const existentes = await Ticket.findAll({ where: { ordenId } });
    if (existentes.length > 0) {
        return existentes.map(formatearTicket);
    }

    const butacas = await FuncionButaca.findAll({
        where: { ordenId, estado: "vendida" },
        include: [
            {
                model: Funcion,
                as: "funcion",
                include: [
                    { model: Pelicula, as: "pelicula" },
                    { model: Sala, as: "sala" },
                ],
            },
        ],
    });

    if (butacas.length === 0) {
        const error = new Error("La orden no tiene butacas asignadas");
        error.status = 409;
        throw error;
    }

    const transaccion = await sequelize.transaction();

    try {
        const creados = [];

        for (const butaca of butacas) {
            const funcion = butaca.funcion;

            const ticket = await Ticket.create(
                {
                    codigo: generarCodigoTicket(),
                    ordenId: orden.id,
                    funcionId: funcion.id,
                    funcionButacaId: butaca.id,
                    qrToken: "pendiente",
                    nombreAsistente: null,
                    estado: "valido",
                    datosSnapshot: {
                        pelicula: funcion.pelicula.titulo,
                        posterUrl: funcion.pelicula.posterUrl,
                        clasificacion: funcion.pelicula.clasificacion,
                        duracionMinutos: funcion.pelicula.duracionMinutos,
                        sala: funcion.sala.nombre,
                        inicia: funcion.inicia,
                        formato: funcion.formato,
                        idioma: funcion.idioma,
                        fila: butaca.fila,
                        numero: butaca.numero,
                        tipo: butaca.tipo,
                        comprador: orden.nombreComprador,
                        ordenNumero: orden.numero,
                    },
                },
                { transaction: transaccion }
            );

            const qrToken = firmarQR(ticket.id, funcion.id);
            await ticket.update({ qrToken }, { transaction: transaccion });

            creados.push(ticket);
        }

        await Orden.update(
            { estado: "pagada", pagadaEn: new Date() },
            { where: { id: orden.id }, transaction: transaccion }
        );

        await transaccion.commit();
        return creados.map(formatearTicket);
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
}

function firmarQR(ticketId, funcionId) {
    return jwt.sign(
        { tid: ticketId, fid: funcionId, tipo: "ticket" },
        process.env.JWT_SECRET
    );
}

function generarCodigoTicket() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    for (let i = 0; i < 10; i++) {
        codigo += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${codigo.slice(0, 5)}-${codigo.slice(5)}`;
}

function formatearTicket(ticket) {
    return {
        id: ticket.id,
        codigo: ticket.codigo,
        qrToken: ticket.qrToken,
        estado: ticket.estado,
        usadoEn: ticket.usadoEn,
        datos: ticket.datosSnapshot,
    };
}

const MINUTOS_ANTES = 45;
const MINUTOS_DESPUES = 30; //Reemplazar en .env

export async function validarTicket(qrToken, porteroId) {
    let payload;

    try {
        payload = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch {
        return { valido: false, motivo: "QR_INVALIDO", mensaje: "Código QR inválido o adulterado" };
    }

    if (payload.tipo !== "ticket") {
        return { valido: false, motivo: "QR_INVALIDO", mensaje: "Código QR inválido" };
    }

    const transaccion = await sequelize.transaction();

    try {
        const ticket = await Ticket.findByPk(payload.tid, {
            lock: transaccion.LOCK.UPDATE,
            transaction: transaccion,
        });

        if (!ticket) {
            await transaccion.rollback();
            return { valido: false, motivo: "NO_EXISTE", mensaje: "El ticket no existe" };
        }

        if (ticket.qrToken !== qrToken) {
            await transaccion.rollback();
            return { valido: false, motivo: "QR_INVALIDO", mensaje: "Código QR inválido" };
        }

        const datos = ticket.datosSnapshot;

        if (ticket.estado === "usado") {
            await transaccion.rollback();
            return {
                valido: false,
                motivo: "YA_USADO",
                mensaje: `Este ticket ya fue utilizado`,
                usadoEn: ticket.usadoEn,
                datos,
            };
        }

        if (ticket.estado === "anulado") {
            await transaccion.rollback();
            return { valido: false, motivo: "ANULADO", mensaje: "Este ticket fue anulado", datos };
        }

        const ahora = new Date();
        const inicio = new Date(datos.inicia);
        const desde = new Date(inicio.getTime() - MINUTOS_ANTES * 60 * 1000);
        const hasta = new Date(inicio.getTime() + MINUTOS_DESPUES * 60 * 1000);

        if (ahora < desde) {
            await transaccion.rollback();
            return {
                valido: false,
                motivo: "MUY_TEMPRANO",
                mensaje: "Todavía no se puede ingresar a esta función",
                datos,
            };
        }

        if (ahora > hasta) {
            await transaccion.rollback();
            return {
                valido: false,
                motivo: "FUERA_DE_HORARIO",
                mensaje: "La función ya comenzó hace demasiado tiempo",
                datos,
            };
        }

        await ticket.update(
            { estado: "usado", usadoEn: ahora, usadoPor: porteroId },
            { transaction: transaccion }
        );

        await transaccion.commit();

        return { valido: true, mensaje: "Ingreso autorizado", datos, usadoEn: ahora };
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
}

export async function obtenerPorCodigo(codigo) {
    const ticket = await Ticket.findOne({ where: { codigo } });

    if (!ticket) {
        const error = new Error("Ticket no encontrado");
        error.status = 404;
        throw error;
    }

    return formatearTicket(ticket);
}

export async function ticketsDeFuncion(funcionId) {
    const tickets = await Ticket.findAll({
        where: { funcionId, estado: "valido" },
        attributes: ["id", "codigo", "qrToken", "estado", "datosSnapshot"],
    });

    return tickets.map(formatearTicket);
}
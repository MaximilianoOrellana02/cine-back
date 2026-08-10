import * as ordenService from "../services/orden.service.js"
import * as ticketService from "../services/ticket.service.js";


export async function postOrden(req, res, next) {
    try {
        const sesionId = req.headers["x-sesion-id"] || null;

        const orden = await ordenService.crearOrden({
            ...req.body,
            sesionId,
            usuarioId: req.usuario?.id || null
        });
        res.status(201).json(orden);

    } catch (error) {
        next(error)
    }
}


export async function postConfirmarPago(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const tickets = await ticketService.emitirTickets(id);
        res.json({ mensaje: "Pago confirmado y tickets emitidos", tickets });
    } catch (error) {
        next(error);
    }
}

export async function getOrden(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const orden = await ordenService.obtenerOrden(id);
        res.json(orden)
    } catch (error) {
        next(error)
    }
}
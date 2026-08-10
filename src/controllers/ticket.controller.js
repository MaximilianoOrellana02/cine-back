import * as ticketService from "../services/ticket.service.js"

export async function postValidar(req, res, next) {
    try {
        const { qrToken } = req.body;
        const resultado = await ticketService.validarTicket(qrToken, req.usuario.id);
        res.json(resultado);
    } catch (error) {
        next(error)
    }
}

export async function getPorCodigo(req, res, next) {
    try {
        const { codigo } = req.paramsValidados;
        const ticket = await ticketService.obtenerPorCodigo(codigo);
        res.json({ ticket });
    } catch (error) {
        next(error);
    }
}

export async function getDeFuncion(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const tickets = await ticketService.ticketsDeFuncion(id);
        res.json({ funcionId: id, cantidad: tickets.length, tickets });
    } catch (error) {
        next(error);
    }
}
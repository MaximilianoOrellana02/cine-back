import * as butacaService from "../services/butaca.service.js"

export async function getMapa(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const sesionId = req.headers["x-sesion-id"] || null;

        const mapa = await butacaService.obtenerMapa(id, sesionId);
        res.json(mapa)
    } catch (error) {
        next(error);
    }
}

export async function postBloquear(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const { butacaIds } = req.body;
        const sesionId = req.headers["x-sesion-id"] || null;

        const resultado = await butacaService.bloquearButacas(id, butacaIds, sesionId);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
}

export async function deleteBloquear(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const { butacaIds } = req.body;
        const sesionId = req.headers["x-sesion-id"] || null;

        const resultado = await butacaService.liberarButacas(id, butacaIds, sesionId);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}
import * as service from "../services/admin-funcion.service.js"

export async function postPrevisualizar(req, res, next) {
    try {
        const resultado = await service.previsualizar(req.body);
        res.json(resultado);
    } catch (error) {
        next(error)
    }
}

export async function postFunciones(req, res, next) {
    try {
        const resultado = await service.crearEnLote(req.body);
        res.status(201).json(resultado)
    } catch (error) {
        next(error)
    }
}

export async function getFunciones(req, res, next) {
    try {
        const funciones = await service.listarFunciones(req.datosValidados ?? {})
        res.json({ funciones })
    } catch (error) {
        next(error)
    }
}

export async function postCancelar(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const { motivo } = req.body;
        const resultado = await service.cancelarFuncion(id, motivo)
        res.json(resultado)
    } catch (error) {
        next(error);
    }
}
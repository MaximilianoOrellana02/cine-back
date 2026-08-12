import * as service from "./../services/admin-general.service.js"

export async function getSalas(req, res, next) {
    try {
        const salas = await service.listarSalas()
        res.status(200).json(salas)
    } catch (error) {
        next(error)
    }
}

export async function getPrecios(req, res, next) {
    try {
        const precios = await service.listarPrecios()
        res.status(200).json(precios)
    } catch (error) {
        next(error)
    }
}
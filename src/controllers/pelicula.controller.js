import * as peliculaService from "../services/pelicula.service.js";

function fechaDeHoy() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

export async function getDetalle(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const fecha = req.datosValidados?.fecha || fechaDeHoy();

        const detalle = await peliculaService.obtenerDetalle(id, fecha)
        res.json(detalle);
    } catch (error) {
        next(error)
    }
}

export async function getCartelera(req, res, next) {
    try {
        const peliculas = await peliculaService.obtenerCartelera();
        res.json(peliculas);
    } catch (error) {
        next(error);
    }
}
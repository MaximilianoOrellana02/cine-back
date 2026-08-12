import * as tmdbService from "./../services/tmdb.service.js"
import * as adminService from "../services/admin-pelicula.service.js";

export async function getBuscarTmdb(req, res, next) {
    try {
        const { titulo } = req.datosValidados;
        const resultados = await tmdbService.buscarPeliculas(titulo)
        res.json({ resultados })
    } catch (error) {
        next(error)
    }
}

export async function getDetalleTmdb(req, res, next) {
    try {
        const { tmdbId } = req.paramsValidados;
        const detalle = await tmdbService.obtenerDetalle(tmdbId);
        res.json(detalle);
    } catch (error) {
        next(error)
    }
}

export async function postPelicula(req, res, next) {
    try {
        const pelicula = await adminService.crearPelicula(req.body);
        res.status(201).json({ pelicula });
    } catch (error) {
        next(error);
    }
}

export async function getPeliculas(req, res, next) {
    try {
        const peliculas = await adminService.listarPeliculas();
        res.json({ peliculas });
    } catch (error) {
        next(error);
    }
}

export async function patchPelicula(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        const pelicula = await adminService.actualizarPelicula(id, req.body);
        res.json({ pelicula });
    } catch (error) {
        next(error);
    }
}

export async function deletePelicula(req, res, next) {
    try {
        const { id } = req.paramsValidados;
        await adminService.desactivarPelicula(id);
        res.json({ mensaje: "Película desactivada" });
    } catch (error) {
        next(error);
    }
}
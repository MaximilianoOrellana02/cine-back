import { Op } from "sequelize";
import { Funcion, Pelicula, Sala } from "../models/index.js";
import { aCentavos, aPesos } from "../utils/dinero.js";

export async function obtenerDetalle(peliculaId, fecha) {
    const pelicula = await Pelicula.findOne({
        where: { id: peliculaId, activa: true },
    });

    if (!pelicula) {
        const error = new Error("La película no existe");
        error.status = 404;
        throw error;
    }

    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);
    const ahora = new Date();
    const desde = inicioDia > ahora ? inicioDia : ahora;

    let funciones = [];

    if (desde <= finDia) {
        funciones = await Funcion.findAll({
            where: {
                peliculaId,
                estado: "en_venta",
                inicia: { [Op.between]: [desde, finDia] },
            },
            include: [{ model: Sala, as: "sala", attributes: ["id", "nombre"] }],
            order: [["inicia", "ASC"]],
        });
    }

    return {
        id: pelicula.id,
        titulo: pelicula.titulo,
        tituloOriginal: pelicula.tituloOriginal,
        sinopsis: pelicula.sinopsis,
        duracionMinutos: pelicula.duracionMinutos,
        clasificacion: pelicula.clasificacion,
        genero: pelicula.genero,
        posterUrl: pelicula.posterUrl,
        backdropUrl: pelicula.backdropUrl,
        trailerUrl: pelicula.trailerUrl,
        fechaEstreno: pelicula.fechaEstreno,
        fecha,
        grupos: agruparPorFormatoIdioma(funciones),
    };
}

function agruparPorFormatoIdioma(funciones) {
    const mapa = new Map();

    for (const f of funciones) {
        const clave = `${f.formato}|${f.idioma}`;

        if (!mapa.has(clave)) {
            mapa.set(clave, {
                formato: f.formato,
                idioma: f.idioma,
                etiqueta: `${f.formato} · ${f.idioma === "doblada" ? "Doblada" : "Subtitulada"}`,
                funciones: [],
            });
        }

        mapa.get(clave).funciones.push({
            id: f.id,
            inicia: f.inicia,
            precioBase: aPesos(aCentavos(f.precioBase)),
            salaId: f.sala.id,
            sala: f.sala.nombre,
        });
    }

    return Array.from(mapa.values());
}

export async function obtenerCartelera() {
    return await Pelicula.findAll({
        where: { activa: true },
        order: [["fechaEstreno", "DESC"]],
    });
}
import { Pelicula, Funcion } from "../models/index.js";

export async function crearPelicula(datos) {
    if (datos.tmdbId) {
        const existente = await Pelicula.findOne({
            where: { tmdbId: datos.tmdbId }
        });
        if (existente) {
            const error = new Error(`"${existente.titulo}" ya está cargada`);
            error.status = 409;
            throw error;
        }
    }

    const pelicula = await Pelicula.create({
        titulo: datos.titulo,
        tituloOriginal: datos.tituloOriginal ?? null,
        sinopsis: datos.sinopsis ?? null,
        duracionMinutos: datos.duracionMinutos,
        clasificacion: datos.clasificacion,
        genero: datos.genero ?? null,
        posterUrl: datos.posterUrl ?? null,
        backdropUrl: datos.backdropUrl ?? null,
        trailerUrl: datos.trailerUrl ?? null,
        tmdbId: datos.tmdbId ?? null,
        fechaEstreno: datos.fechaEstreno ?? null,
        formatos: datos.formatos ?? ["2D"],
        activa: true,
    });

    return pelicula;
}

export async function actualizarPelicula(id, datos) {
    const pelicula = await Pelicula.findByPk(id);

    if (!pelicula) {
        const error = new Error("La película no existe");
        error.status = 404;
        throw error;
    }

    const permitidos = [
        "titulo", "tituloOriginal", "sinopsis", "duracionMinutos",
        "clasificacion", "genero", "posterUrl", "backdropUrl",
        "trailerUrl", "fechaEstreno", "formatos", "activa",
    ];

    const cambios = {};
    for (const campo of permitidos) {
        if (datos[campo] !== undefined) cambios[campo] = datos[campo];
    }

    await pelicula.update(cambios);
    return pelicula;
}

export async function desactivarPelicula(id) {
    const pelicula = await Pelicula.findByPk(id);

    if (!pelicula) {
        const error = new Error("La película no existe");
        error.status = 404;
        throw error;
    }

    const funcionesActivas = await Funcion.count({
        where: { peliculaId: id, estado: "en_venta" },
    });

    if (funcionesActivas > 0) {
        const error = new Error(
            `No podés desactivarla: tiene ${funcionesActivas} funciones en venta. Cancelalas primero.`
        );
        error.status = 409;
        throw error;
    }

    await pelicula.update({ activa: false });
    return pelicula;
}

export async function listarPeliculas({ soloActivas = true } = {}) {
    const where = soloActivas ? { activa: true } : {};
    const peliculas = Pelicula.findAll({
        where,
        order: [["created_at", "DESC"]]
    })

    return peliculas
}
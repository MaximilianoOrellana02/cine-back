const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

async function consultar(ruta, params = {}) {
    const url = new URL(`${BASE_URL}${ruta}`);
    url.searchParams.set("language", "es-AR");

    for (const [clave, valor] of Object.entries(params)) {
        url.searchParams.set(clave, valor);
    }

    const respuesta = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            accept: "application/json",
        },
    });

    if (!respuesta.ok) {
        const error = new Error("Error al consultar TMDB");
        error.status = respuesta.status === 401 ? 500 : 502;
        throw error;
    }

    return respuesta.json();
}

export async function buscarPeliculas(titulo) {
    const datos = await consultar("/search/movie", {
        query: titulo,
        include_adult: "false",
        region: "AR"
    })

    return datos.results.slice(0, 8).map((p) => ({
        tmdbId: p.id,
        titulo: p.title,
        tituloOriginal: p.original_title,
        sinopsis: p.overview || null,
        posterUrl: p.poster_path ? `${IMG_BASE}/w500${p.poster_path}` : null,
        backdropUrl: p.backdrop_path ? `${IMG_BASE}/w780${p.backdrop_path}` : null,
        fechaEstreno: p.release_date || null,
        anio: p.release_date ? p.release_date.slice(0, 4) : null,
        puntaje: p.vote_average ? Number(p.vote_average.toFixed(1)) : null,
    }));
}

export async function obtenerDetalle(tmdbId) {
    const datos = await consultar(`/movie/${tmdbId}`, {
        append_to_response: "videos",
    });

    const trailer = datos.videos?.results?.find(
        (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );

    return {
        tmdbId: datos.id,
        titulo: datos.title,
        tituloOriginal: datos.original_title,
        sinopsis: datos.overview || null,
        duracionMinutos: datos.runtime || null,
        genero: datos.genres?.map((g) => g.name).join(", ") || null,
        posterUrl: datos.poster_path ? `${IMG_BASE}/w500${datos.poster_path}` : null,
        backdropUrl: datos.backdrop_path ? `${IMG_BASE}/w1280${datos.backdrop_path}` : null,
        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        fechaEstreno: datos.release_date || null,
    };
}
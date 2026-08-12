import { z } from "zod";

const CLASIFICACIONES = ["ATP", "+13", "+16", "+18"];
const FORMATOS = ["2D", "3D"];

export const buscarTmdbSchema = z.object({
    titulo: z.string().trim().min(2, "Escribí al menos 2 caracteres").max(150)
})

export const tmdbIdParamSchema = z.object({
    tmdbId: z.coerce.number().int().positive("El id de TMDB debe ser un número"),
})

export const crearPeliculaSchema = z.object({
    titulo: z.string().trim().min(1, "El título es obligatorio").max(255),
    tituloOriginal: z.string().trim().max(255).nullish(),
    sinopsis: z.string().trim().max(5000).nullish(),
    duracionMinutos: z.number().int().min(1, "La duración es obligatoria").max(600),
    clasificacion: z.enum(CLASIFICACIONES, {
        message: "Elegí una clasificación válida",
    }),
    genero: z.string().trim().max(100).nullish(),
    posterUrl: z.string().trim().url("Debe ser una URL válida").max(500).nullish(),
    backdropUrl: z.string().trim().url().max(500).nullish(),
    trailerUrl: z.string().trim().url().max(500).nullish(),
    tmdbId: z.number().int().positive().nullish(),
    fechaEstreno: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
    formatos: z.array(z.enum(FORMATOS)).min(1, "Elegí al menos un formato").default(["2D"]),
});

export const actualizarPeliculaSchema = crearPeliculaSchema
    .partial()
    .extend({ activa: z.boolean().optional() });

export const peliculaIdParamSchema = z.object({
    id: z.string().trim().uuid("El id debe ser un UUID válido"),
});
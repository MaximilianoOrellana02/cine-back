import { z } from "zod";

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const configFuncionesSchema = z.object({
    peliculaId: z.uuid("Elegí una pelicula"),
    salaId: z.uuid("Elegí una sala"),
    formato: z.enum(["2D", "3D"]),
    idioma: z.enum(["doblada", "subtitulada"]),
    horarios: z
        .array(z.string().regex(HORA, "Formato de hora inválido (HH:MM)"))
        .min(1, "Elegí al menos un horario")
        .max(15, "Maximo de 15 horarios por carga"),
    desde: z.string().regex(FECHA, "Fecha inválida"),
    hasta: z.string().regex(FECHA, "Fecha inválida"),
    estado: z.enum(["programada", "en_venta"]).default("en_venta"),
})

export const listarFuncionesQuerySchema = z.object({
    desde: z.string().regex(FECHA).optional(),
    hasta: z.string().regex(FECHA).optional(),
    salaId: z.string().trim().uuid().optional(),
    peliculaId: z.string().trim().uuid().optional(),
})

export const cancelarFuncionSchema = z.object({
    motivo: z.string().trim().min(3, "Indicá el motivo").max(200),
});

export const funcionIdParamSchema = z.object({
    id: z.string().trim().uuid("El id debe ser un UUID válido"),
});
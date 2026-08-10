import { z } from "zod";

export const peliculaIdParamSchema = z.object({
    id: z.string().trim().uuid("El id debe ser un UUID válido")
});

export const detalleQuerySchema = z.object({
    fecha: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
        .optional(),
});
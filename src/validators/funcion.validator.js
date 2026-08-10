import { z } from "zod"

export const carteleraQuerySchema = z.object({
    fecha: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
        .optional(),
});


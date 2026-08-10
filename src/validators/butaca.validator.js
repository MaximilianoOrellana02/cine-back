import { z } from "zod";

export const funcionIdParamSchema = z.object({
    id: z.string().trim().uuid("El id de función debe ser un UUID válido"),
});

export const bloquearButacasSchema = z.object({
    butacaIds: z
        .array(z.string().trim().uuid("Cada butaca debe ser un UUID válido"))
        .min(1, "Tenés que seleccionar al menos una butaca")
        .max(8, "No podés seleccionar más de 8 butacas"),
});
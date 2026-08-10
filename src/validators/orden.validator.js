import { z } from "zod";

export const crearOrdenSchema = z.object({
    funcionId: z.string().trim().uuid("El id de funcion debe ser un UUID válido"),

    butacaIds: z
        .array(z.string().trim().uuid())
        .min(1, "Tenés que seleccionar al menos una butaca")
        .max(8, "No podés comprar más de 8 butacas"),
    combos: z
        .array(
            z.object({
                comboId: z.string().trim().uuid(),
                cantidad: z.number().int().min(1).max(20),
            })
        )
        .optional()
        .default([]),
    comprador: z.object({
        email: z.string().trim().toLowerCase().email("Email inválido"),
        nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
    }),
})

export const ordenIdParamSchema = z.object({
    id: z.string().trim().uuid("El id debe ser un UUID válido"),
});
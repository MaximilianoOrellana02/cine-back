import { z } from "zod";

export const validarTicketSchema = z.object({
    qrToken: z.string().trim().min(20, "Token inválido")
})

export const codigoParamSchema = z.object({
    codigo: z.string().trim().min(5).max(30),
});

export const funcionIdParamSchema = z.object({
    id: z.string().trim().uuid("El id debe ser un UUID válido"),
});
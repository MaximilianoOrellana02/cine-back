import { z } from "zod";

export const registroSchema = z.object({
    email: z.string().trim().toLowerCase().email("Email inválido").max(150),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(72, "La contraseña es demasiado larga"),
    nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
    telefono: z.string().trim().max(30).optional(),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Email inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
})
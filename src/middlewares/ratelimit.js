import rateLimit from "express-rate-limit";

export const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Demasiados intentos. Probá de nuevo en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const limiteRegistro = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: "Demasiadas cuentas creadas. Probá más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});
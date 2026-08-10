export function validarQuery(schema) {
    return (req, res, next) => {
        console.log(req.query)

        const resultado = schema.safeParse(req.query);

        if (!resultado.success) {
            return res.status(400).json({
                error: "Parámetros inválidos",
                detalles: resultado.error.issues.map((i) => ({
                    campo: i.path.join("."),
                    mensaje: i.message,
                })),
            });
        }

        req.datosValidados = resultado.data;
        next();
    };
}

export function validarBody(schema) {
    return (req, res, next) => {
        const resultado = schema.safeParse(req.body);

        if (!resultado.success) {
            return res.status(400).json({
                error: "Datos inválidos",
                detalles: resultado.error.issues.map((i) => ({
                    campo: i.path.join("."),
                    mensaje: i.message,
                })),
            });
        }

        req.body = resultado.data;
        next();
    };
}

export function validarParams(schema) {
    return (req, res, next) => {
        const resultado = schema.safeParse(req.params);

        if (!resultado.success) {
            return res.status(400).json({
                error: "Parámetros inválidos",
                detalles: resultado.error.issues.map((i) => ({
                    campo: i.path.join("."),
                    mensaje: i.message,
                })),
            });
        }

        req.paramsValidados = resultado.data;
        next();
    };
}
import jwt from "jsonwebtoken";

function extraerToken(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return null
    return header.slice(7)
}

export function requiereAuth(req, res, next) {
    const token = extraerToken(req);

    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next()
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

export function authOpcional(req, res, next) {
    const token = extraerToken(req);

    if (token) {
        try {
            req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            req.usuario = null;
        }
    }

    next();
}

export function requiereRol(...roles) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: "No autenticado" });
        }
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ error: "No tenés permisos para esta acción" });
        }
        next();
    };
}
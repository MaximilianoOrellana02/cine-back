import * as authService from "../services/auth.service.js"

export async function postRegistro(req, res, next) {
    try {
        const resultado = await authService.registrar(req.body);
        res.status(201).json(resultado)
    } catch (error) {
        next(error)
    }
}

export async function postLogin(req, res, next) {
    try {
        const resultado = await authService.login(req.body);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}

export async function getYo(req, res, next) {
    try {
        const usuario = await authService.obtenerPerfil(req.usuario.id);
        res.json({ usuario });
    } catch (error) {
        next(error);
    }
}
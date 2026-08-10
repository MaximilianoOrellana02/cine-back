import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { Usuario } from "../models/index.js";

function generarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

export async function registrar({ email, password, nombre, telefono = null }) {
    const existente = await Usuario.findOne({
        where: { email }
    });

    if (existente) {
        const error = new Error("Ya existe una cuenta con ese correo");
        error.status = 409;
        throw error;
    }

    const usuario = await Usuario.create({
        email,
        password,
        nombre,
        telefono,
        rol: "cliente"
    });

    return {
        token: generarToken(usuario),
        usuario: usuario.toJSON()
    }
}

export async function login({ email, password }) {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !usuario.activo) {
        throw credencialesInvalidas();
    }

    const coincide = await bcrypt.compare(password, usuario.password);

    if (!coincide) {
        throw credencialesInvalidas();
    }

    return {
        token: generarToken(usuario),
        usuario: usuario.toJSON(),
    };
}

export async function obtenerPerfil(usuarioId) {
    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario || !usuario.activo) {
        const error = new Error("Usuario no encontrado");
        error.status = 404;
        throw error;
    }

    return usuario.toJSON();
}

function credencialesInvalidas() {
    const error = new Error("Email o contraseña incorrectos");
    error.status = 401;
    return error;
}
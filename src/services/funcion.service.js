import { Op } from "sequelize";
import { Funcion, Pelicula, Sala } from "../models/index.js";
import { aCentavos, aPesos } from "../utils/dinero.js";

export async function listarCartelera(fecha) {
    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);
    const ahora = new Date()

    const desde = inicioDia > ahora ? inicioDia : ahora;

    if (desde > finDia) {
        return [];
    }

    const funciones = await Funcion.findAll({
        where: {
            estado: "en_venta",
            inicia: { [Op.between]: [desde, finDia] }
        },
        include: [
            {
                model: Pelicula,
                as: "pelicula",
                attributes: [
                    "id",
                    "titulo",
                    "posterUrl",
                    "duracionMinutos",
                    "clasificacion",
                    "genero",
                ],
                where: { activa: true }
            },
            {
                model: Sala,
                as: "sala",
                attributes: ["id", "nombre"]
            },
        ],
        order: [["inicia", "ASC"]]
    })

    return agruparPorPelicula(funciones)
}

function agruparPorPelicula(funciones) {
    const mapa = new Map();

    for (const funcion of funciones) {
        const pelicula = funcion.pelicula;

        if (!mapa.has(pelicula.id)) {
            mapa.set(pelicula.id, {
                peliculaId: pelicula.id,
                titulo: pelicula.titulo,
                posterUrl: pelicula.posterUrl,
                duracionMinutos: pelicula.duracionMinutos,
                clasificacion: pelicula.clasificacion,
                genero: pelicula.genero,
                formatos: new Set(),
                funciones: [],
            });
        }

        const entrada = mapa.get(pelicula.id);
        entrada.formatos.add(funcion.formato);
        entrada.funciones.push({
            id: funcion.id,
            inicia: funcion.inicia,
            formato: funcion.formato,
            idioma: funcion.idioma,
            precioBase: aPesos(aCentavos(funcion.precioBase)),
            salaId: funcion.sala.id,
            sala: funcion.sala.nombre,
        });
    }

    return Array.from(mapa.values()).map((p) => ({
        ...p,
        formatos: Array.from(p.formatos),
    }));
}
import { Op } from "sequelize";
import {
    Butaca,
    Funcion,
    FuncionButaca,
    Pelicula,
    Precio,
    Sala,
    sequelize
} from "../models/index.js"

import {
    aCentavos, aPesos
} from "../utils/dinero.js";


const MINUTOS_COLCHON = 20;

export async function previsualizar(config) {
    const { peliculaId, salaId, formato, idioma, horarios, desde, hasta } = config;

    const { pelicula, sala } = await validarPeliculaYSala(peliculaId, salaId, formato);

    const precio = await obtenerPrecio(formato);
    const fechas = generarFechas(desde, hasta);
    const propuestas = construirFunciones(fechas, horarios, pelicula.duracionMinutos);
    const conflictos = await detectarConflictos(salaId, propuestas);

    const cantidadButacas = await Butaca.count({
        where: { salaId, activa: true }
    })

    return {
        pelicula: { id: pelicula.id, titulo: pelicula.titulo, duracionMinutos: pelicula.duracionMinutos },
        sala: { id: sala.id, nombre: sala.nombre, butacas: cantidadButacas },
        formato,
        idioma,
        precio: aPesos(aCentavos(precio.monto)),
        funciones: propuestas.map((f) => ({
            inicia: f.inicia,
            termina: f.termina,
            conflicto: conflictos.some((c) => c.inicia.getTime() === f.inicia.getTime()),
        })),
        totalFunciones: propuestas.length,
        totalButacas: propuestas.length * cantidadButacas,
        conflictos: conflictos.map((c) => ({
            inicia: c.inicia,
            choca_con: c.choca,
        })),
        valido: conflictos.length === 0,
    };
}

async function validarPeliculaYSala(peliculaId, salaId, formatoElegido) {
    const pelicula = await Pelicula.findByPk(peliculaId);

    if (!pelicula || !pelicula.activa) {
        const error = new Error("La película no existe o está desactivada");
        error.status = 404;
        throw error;
    }

    if (!pelicula.formatos.includes(formatoElegido)) {
        const error = new Error(
            `"${pelicula.titulo}" no está habilitada en ${formatoElegido}`
        );
        error.status = 409;
        throw error;
    }

    const sala = await Sala.findByPk(salaId);

    if (!sala || !sala.activa) {
        const error = new Error("La sala no existe o está desactivada");
        error.status = 404;
        throw error;
    }

    if (formatoElegido === "3D" && !sala.soporta3d) {
        const error = new Error(`${sala.nombre} no tiene proyector 3D`);
        error.status = 409;
        throw error;
    }

    return { pelicula, sala };
}

async function obtenerPrecio(formato) {
    const precio = await Precio.findOne({
        where: {
            formato,
            activo: true
        }
    })

    if (!precio) {
        const error = new Error(`No hay precio configurado para ${formato}`)
        error.staus = 409;
        throw error;
    }

    return precio;
}

function generarFechas(desde, hasta) {
    const fechas = [];
    const inicio = new Date(`${desde}T00:00:00`);
    const fin = new Date(`${hasta}T00:00:00`);

    if (fin < inicio) {
        const error = new Error("La fecha final no puede ser anterior a la inicial")
        error.status = 400;
        throw error;
    }

    const dias = Math.round((fin - inicio) / 86400000) + 1;

    if (dias > 31) {
        const error = new Error("El rango no puede superar los 31 dias");
        error.status = 400;
        throw error;
    }

    for (let i = 0; i < dias; i++) {
        const f = new Date(inicio);
        f.setDate(inicio.getDate() + i);
        fechas.push(f)
    }

    return fechas;
}

function construirFunciones(fechas, horarios, duracionMinutos) {
    const propuestas = [];

    for (const fecha of fechas) {
        for (const horario of horarios) {
            const [hora, minuto] = horario.split(":").map(Number);

            const inicia = new Date(fecha);
            inicia.setHours(hora, minuto, 0, 0);

            const termina = new Date(inicia);
            termina.setMinutes(termina.getMinutes() + duracionMinutos + MINUTOS_COLCHON);

            propuestas.push({ inicia, termina })
        }
    }
    return propuestas.sort((a, b) => a.inicia - b.inicia);

}

async function detectarConflictos(salaId, propuestas) {
    if (propuestas.length === 0) return [];

    const primera = propuestas[0].inicia;
    const ultima = propuestas[propuestas.length - 1].termina;

    const existentes = await Funcion.findAll({
        where: {
            salaId,
            estado: { [Op.ne]: "cancelada" },
            inicia: { [Op.lt]: ultima },
            termina: { [Op.gt]: primera },
        },
        include: [{ model: Pelicula, as: "pelicula", attributes: ["titulo"] }]
    });

    const conflictos = [];

    for (const p of propuestas) {
        const choque = existentes.find(
            (e) => new Date(e.inicia) < p.termina && new Date(e.termina) > p.inicia
        )

        if (choque) {
            conflictos.push({
                inicia: p.inicia,
                choca: `${choque.pelicula.titulo} (${formatearHora(choque.inicia)})`,
            });
            continue;
        }
        const chocaInterno = propuestas.find(
            (o) => o !== p && o.inicia < p.termina && o.termina > p.inicia
        );

        if (chocaInterno) {
            conflictos.push({
                inicia: p.inicia,
                choca: `otra funcion de esta misma carga (${formatearHora(chocaInterno.inicia)})`,
            })
        }
    }

    return conflictos;
}

function formatearHora(fecha) {
    const f = new Date(fecha);
    return `${String(f.getHours()).padStart(2, "0")}:${String(f.getMinutes()).padStart(2, "0")}`;
}

export async function crearEnLote(config) {
    const { peliculaId, salaId, formato, idioma, horarios, desde, hasta, estado = "en_venta" } = config;

    const { pelicula, sala } = await validarPeliculaYSala(peliculaId, salaId, formato);
    const precio = await obtenerPrecio(formato);

    const fechas = generarFechas(desde, hasta);
    const propuestas = construirFunciones(fechas, horarios, pelicula.duracionMinutos);

    if (propuestas.length === 0) {
        const error = new Error("No hay funciones para crear");
        error.status = 400;
        throw error;
    }

    const conflictos = await detectarConflictos(salaId, propuestas);

    if (conflictos.length > 0) {
        const error = new Error("Hay funciones que se solapan");
        error.status = 409;
        error.detalles = conflictos.map(
            (c) => `${formatearFechaHora(c.inicia)} choca con ${c.choca}`
        );
        throw error;
    }

    const butacasSala = await Butaca.findAll({
        where: { salaId, activa: true },
    });

    if (butacasSala.length === 0) {
        const error = new Error(`${sala.nombre} no tiene butacas cargadas`);
        error.status = 409;
        throw error;
    }

    const montoPrecio = aPesos(aCentavos(precio.monto));
    const transaccion = await sequelize.transaction();

    try {
        const creadas = [];

        for (const propuesta of propuestas) {
            const funcion = await Funcion.create(
                {
                    peliculaId,
                    salaId,
                    inicia: propuesta.inicia,
                    termina: propuesta.termina,
                    formato,
                    idioma,
                    precioBase: montoPrecio,
                    estado,
                    butacasGeneradas: false,
                },
                { transaction: transaccion }
            );

            const snapshot = butacasSala.map((b) => ({
                funcionId: funcion.id,
                butacaId: b.id,
                fila: b.fila,
                numero: b.numero,
                tipo: b.tipo,
                posX: b.posX,
                posY: b.posY,
                estado: "libre",
            }));

            await FuncionButaca.bulkCreate(snapshot, { transaction: transaccion });
            await funcion.update({ butacasGeneradas: true }, { transaction: transaccion });

            creadas.push(funcion);
        }

        await transaccion.commit();

        return {
            creadas: creadas.length,
            butacasGeneradas: creadas.length * butacasSala.length,
            pelicula: pelicula.titulo,
            sala: sala.nombre,
            desde: propuestas[0].inicia,
            hasta: propuestas[propuestas.length - 1].inicia,
        };
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
}

function formatearFechaHora(fecha) {
    const f = new Date(fecha);
    const dia = String(f.getDate()).padStart(2, "0");
    const mes = String(f.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes} ${formatearHora(f)}`;
}

export async function listarFunciones({ desde, hasta, salaId, peliculaId }) {
    const where = {}

    if (desde && hasta) {
        where.inicia = {
            [Op.between]: [new Date(`${desde}T00:00:00`), new Date(`${hasta}T23:59:59`)],
        };
    }

    if (salaId) where.salaId = salaId;
    if (peliculaId) where.peliculaId = peliculaId;

    const funciones = await Funcion.findAll({
        where,
        include: [
            { model: Pelicula, as: "pelicula", attributes: ["id", "titulo", "posterUrl"] },
            { model: Sala, as: "sala", attributes: ["id", "nombre"] },
        ],
        order: [["inicia", "ASC"]],
        limit: 500,
    })

    const conteos = await FuncionButaca.findAll({
        attributes: [
            "funcionId",
            [sequelize.fn("COUNT", sequelize.col("id")), "total"],
            [
                sequelize.fn(
                    "SUM",
                    sequelize.literal(`CASE WHEN estado = 'vendida' THEN 1 ELSE 0 END`)
                ),
                "vendidas",
            ]
        ],
        where: {
            funcionId: { [Op.in]: funciones.map((f) => f.id) },
        },
        group: ["funcionId"],
        raw: true
    });

    const mapaConteos = new Map(
        conteos.map((c) => [c.funcionId, { total: Number(c.total), vendidas: Number(c.vendidas) }])
    );

    return funciones.map((f) => {
        const conteo = mapaConteos.get(f.id) ?? { total: 0, vendidas: 0 };
        return {
            id: f.id,
            inicia: f.inicia,
            termina: f.termina,
            formato: f.formato,
            idioma: f.idioma,
            precioBase: aPesos(aCentavos(f.precioBase)),
            estado: f.estado,
            pelicula: { id: f.pelicula.id, titulo: f.pelicula.titulo, posterUrl: f.pelicula.posterUrl },
            sala: { id: f.sala.id, nombre: f.sala.nombre },
            butacas: conteo,
        };
    });
}

export async function cancelarFuncion(funcionId, motivo) {
    const funcion = await Funcion.findByPk(funcionId);

    if (!funcion) {
        const error = new Error("La funcion no existe");
        error.status = 404;
        throw error;
    }

    if (funcion.estado === "cancelada") {
        const error = new Error("Esta función ya está cancelada");
        error.status = 409;
        throw error;
    }

    const vendidas = await FuncionButaca.count({
        where: { funcionId, estado: "vendida" },
    });

    await funcion.update({ estado: "cancelada" });

    return {
        id: funcion.id,
        butacasVendidas: vendidas,
        requiereReembolso: vendidas > 0,
        motivo,
    };
}
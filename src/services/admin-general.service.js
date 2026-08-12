import { Butaca, Sala, Precio } from "../models/index.js";
import { aCentavos, aPesos } from "../utils/dinero.js";


export async function listarSalas() {
    const salas = await Sala.findAll({
        where: { activa: true },
        order: [["nombre", "ASC"]]
    })

    const conteos = await Butaca.findAll({
        attributes: ["salaId", [Butaca.sequelize.fn("COUNT", "*"), "total"]],
        where: { activa: true },
        group: ["salaId"],
        raw: true
    })

    const mapa = new Map(conteos.map((c) => [c.salaId, Number(c.total)]));

    return salas.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        soporta3d: s.soporta3d,
        butacas: mapa.get(s.id) ?? 0,
        formatos: s.soporta3d ? ["2D", "3D"] : ["2D"]
    }))
}

export async function listarPrecios() {
    const precios = await Precio.findAll({ where: { activo: true } });
    return precios.map((p) => ({
        formato: p.formato,
        monto: aPesos(aCentavos(p.monto)),
    }));
}
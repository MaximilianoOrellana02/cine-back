import { Combo } from "../models/index.js";
import { aCentavos, aPesos } from "../utils/dinero.js";

export async function listarCombos() {
    const combos = await Combo.findAll({
        where: { activo: true },
        order: [["orden", "ASC"]]
    });

    return combos
        .filter((c) => c.stock === null || c.stock > 0)
        .map((c) => ({
            id: c.id,
            nombre: c.nombre,
            descripcion: c.descripcion,
            precio: aPesos(aCentavos(c.precio)),
            imagenUrl: c.imagenUrl,
            stockLimitado: c.stock !== null,
            disponibles: c.stock,
        }))
}
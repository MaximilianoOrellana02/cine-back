import { Op } from "sequelize";
import { sequelize, Orden, FuncionButaca } from "../models/index.js";

export async function expirarOrdenesVencidas() {
    const ahora = new Date();

    const vencidas = await Orden.findAll({
        where: {
            estado: "pendiente",
            expiraEn: { [Op.lt]: ahora },
        },
        attributes: ["id", "numero"]
    });

    if (vencidas.length === 0) return { expiradas: 0, butacasLiberadas: 0 };

    let butacasLiberadas = 0;

    for (const orden of vencidas) {
        const transaccion = await sequelize.transaction();

        try {
            const [filasOrden] = await Orden.update(
                {
                    estado: "expirada",
                    motivoCancelacion: "La orden venció sin completarse el pago",
                },
                {
                    where: { id: orden.id, estado: "pendiente" },
                    transaction: transaccion
                }
            );

            if (filasOrden === 0) {
                await transaccion.rollback();
                continue;
            }

            const [filasButacas] = await FuncionButaca.update(
                {
                    estado: "libre",
                    ordenId: null,
                    bloqueadaPor: null,
                    expiraEn: null
                },
                {
                    where: { ordenId: orden.id, estado: "vendida" },
                    transaction: transaccion
                }
            );

            await transaccion.commit();
            butacasLiberadas += filasButacas;
        } catch (error) {
            await transaccion.rollback()
            console.error(`Error al expirar la orden ${orden.numero}:`, error.message);

        }
    }
    return { expiradas: vencidas.length, butacasLiberadas };

}
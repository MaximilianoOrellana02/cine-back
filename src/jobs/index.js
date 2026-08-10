import { expirarOrdenesVencidas } from "../services/limpieza.service.js";

const INTERVALO_MS = 60 * 1000;

export function iniciarJobs() {
    setInterval(async () => {
        try {
            const resultado = await expirarOrdenesVencidas();
            if (resultado.expiradas > 0) {
                console.log(
                    `🧹 ${resultado.expiradas} órdenes expiradas, ${resultado.butacasLiberadas} butacas liberadas`
                );
            }
        } catch (error) {
            console.error("Error en el job de limpieza:", error.message);
        }
    }, INTERVALO_MS);

    console.log("⏰ Job de limpieza activo (cada 60s)");
}
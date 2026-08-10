import * as funcionService from "./../services/funcion.service.js"

function fechaDeHoy() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

export async function getCartelera(req, res, next) {
    try {
        const fecha = req.query.fecha || fechaDeHoy()
        const cartelera = await funcionService.listarCartelera(fecha)

        res.json({
            fecha,
            peliculas: cartelera
        })
    } catch (error) {
        next(error)
    }
}
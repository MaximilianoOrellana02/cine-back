import { Router } from "express"
import * as controller from "../controllers/admin-pelicula.controller.js"
import * as funcionController from "../controllers/admin-funcion.controller.js"
import * as generalController from "../controllers/admin-general.controller.js"
import { requiereAuth, requiereRol } from "../middlewares/auth.js"
import { validarBody, validarParams, validarQuery } from "../middlewares/validar.js";
import { actualizarPeliculaSchema, buscarTmdbSchema, crearPeliculaSchema, peliculaIdParamSchema, tmdbIdParamSchema } from "../validators/admin-pelicula.validator.js";
import { cancelarFuncionSchema, configFuncionesSchema, funcionIdParamSchema, listarFuncionesQuerySchema } from "../validators/admin-funcion.validator.js"

const router = Router()

router.use(requiereAuth, requiereRol("admin"));

//Funciones y Salas
router.get("/salas", generalController.getSalas);
router.get("/precios", generalController.getPrecios);

router.post("/funciones/previsualizar", validarBody(configFuncionesSchema), funcionController.postPrevisualizar)
router.post("/funciones", validarBody(configFuncionesSchema), funcionController.postFunciones);
router.get("/funciones", validarQuery(listarFuncionesQuerySchema), funcionController.getFunciones);
router.post("/funciones/:id/cancelar", validarParams(funcionIdParamSchema), validarBody(cancelarFuncionSchema), funcionController.postCancelar)

//TMDB Y Peliculas
router.get("/tmdb/buscar", validarQuery(buscarTmdbSchema), controller.getBuscarTmdb);
router.get("/tmdb/:tmdbId", validarParams(tmdbIdParamSchema), controller.getDetalleTmdb)

router.get("/peliculas", controller.getPeliculas);
router.post("/peliculas", validarBody(crearPeliculaSchema), controller.postPelicula)
router.patch("/peliculas/:id", validarParams(peliculaIdParamSchema), validarBody(actualizarPeliculaSchema), controller.patchPelicula);
router.delete("/peliculas/:id", validarParams(peliculaIdParamSchema), controller.deletePelicula)

export default router;
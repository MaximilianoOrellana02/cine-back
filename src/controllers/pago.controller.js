import crypto from "crypto"
import * as pagoService from "./../services/pago.service.js"

export async function postPreferencia(req, res, next) {
    try {
        const { ordenId } = req.body;
        const resultado = await pagoService.crearPreferencia(ordenId);
        res.status(201).json(resultado)
    } catch (error) {
        next(error)
    }
}

export async function postWebhook(req, res) {
    console.log("🔔 Webhook recibido de MercadoPago!");

    res.status(200).json("ok");

    try {
        if (!firmaValida(req)) {
            console.warn("Webhook con firma inválida, ignorado");
            return;
        }

        const resultado = await pagoService.procesarWebhook(req.body);
        console.log("Webhook procesado:", resultado);

    } catch (error) {
        console.error("❌ Error procesando webhook:", error);
    }
}

function firmaValida(req) {
    const secreto = process.env.MP_WEBHOOK_SECRET;

    if (!secreto) return true;

    const firma = req.headers["x-signature"];
    const requestId = req.headers["x-request-id"];
    const dataId = req.query["data.id"] || req.query["id"] || req.body?.data?.id;

    if (!firma || !requestId || !dataId) {
        console.warn("Faltan datos para validar firma:", { firma, requestId, dataId });
        return false;
    }

    const partes = Object.fromEntries(
        firma.split(",").map((p) => p.split("=").map((s) => s.trim()))
    );

    const ts = partes.ts;
    const hash = partes.v1;
    if (!ts || !hash) return false;

    const plantilla = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
    const calculado = crypto.createHmac("sha256", secreto).update(plantilla).digest("hex");

    const bufCalculado = Buffer.from(calculado, 'hex');
    const bufHash = Buffer.from(hash, 'hex');

    if (bufCalculado.length !== bufHash.length) {
        console.warn('Longitud de hash distinta');
        return false;
    }

    return crypto.timingSafeEqual(bufCalculado, bufHash);
}
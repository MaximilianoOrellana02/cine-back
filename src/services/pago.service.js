import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { sequelize, Orden, ItemOrden, Pago } from "../models/index.js";
import { emitirTickets } from "./ticket.service.js";
import { aCentavos, aPesos } from "../utils/dinero.js";

const cliente = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 8000 },
});

const preferenceApi = new Preference(cliente);
const paymentApi = new Payment(cliente);

export async function crearPreferencia(ordenId) {
    const orden = await Orden.findByPk(ordenId, {
        include: [{ model: ItemOrden, as: "items" }],
    });

    if (!orden) {
        const error = new Error("La orden no existe");
        error.status = 404;
        throw error;
    }

    if (orden.estado !== "pendiente") {
        const error = new Error("Esta orden ya no admite pagos");
        error.status = 409;
        throw error;
    }

    if (new Date(orden.expiraEn) <= new Date()) {
        const error = new Error("La orden expiró");
        error.status = 409;
        throw error;
    }

    const items = orden.items.map((item) => ({
        id: item.id,
        title: item.descripcion.slice(0, 250),
        quantity: item.cantidad,
        unit_price: aPesos(aCentavos(item.precioUnitario)),
        currency_id: "ARS",
    }));

    const cargoCent = aCentavos(orden.cargoServicio);
    if (cargoCent > 0) {
        items.push({
            id: `cargo-${orden.id}`,
            title: "Cargo por servicio",
            quantity: 1,
            unit_price: aPesos(cargoCent),
            currency_id: "ARS",
        });
    }

    const preferencia = await preferenceApi.create({
        body: {
            items,
            external_reference: orden.id,
            payer: {
                name: orden.nombreComprador,
                email: orden.emailComprador,
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/orden/${orden.id}`,
                pending: `${process.env.FRONTEND_URL}/orden/${orden.id}`,
                failure: `${process.env.FRONTEND_URL}/orden/${orden.id}`,
            },
            //auto_return: "approved",
            notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook`,
            statement_descriptor: "CINE ALFA",
            expires: true,
            expiration_date_to: new Date(orden.expiraEn).toISOString(),
            payment_methods: {
                excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
                installments: 6,
            },
        },
    });
    await Pago.create({
        ordenId: orden.id,
        proveedor: "mercadopago",
        preferenciaId: preferencia.id,
        estado: "pendiente",
        monto: aPesos(aCentavos(orden.total)),
    });

    return {
        preferenciaId: preferencia.id,
        initPoint: preferencia.init_point,
        sandboxInitPoint: preferencia.sandbox_init_point,
    };
}

export async function procesarWebhook(datos) {
    const paymentId = datos?.data?.id;

    if (!paymentId || datos?.type !== "payment") {
        return { procesado: false, motivo: "notificacion_ignorada" };
    }

    const yaProcesado = await Pago.findOne({
        where: { paymentId: String(paymentId) },
    });

    if (yaProcesado) {
        return { procesado: false, motivo: "duplicado" };
    }

    const pagoMP = await paymentApi.get({ id: paymentId });

    const ordenId = pagoMP.external_reference;
    if (!ordenId) {
        return { procesado: false, motivo: "sin_referencia" };
    }

    const orden = await Orden.findByPk(ordenId);
    if (!orden) {
        return { procesado: false, motivo: "orden_inexistente" };
    }

    const estadoInterno = traducirEstado(pagoMP.status);

    const transaccion = await sequelize.transaction();

    try {
        await Pago.create(
            {
                ordenId: orden.id,
                proveedor: "mercadopago",
                preferenciaId: pagoMP.order?.id ? String(pagoMP.order.id) : null,
                paymentId: String(paymentId),
                estado: estadoInterno,
                estadoProveedor: pagoMP.status,
                monto: pagoMP.transaction_amount,
                metodoPago: pagoMP.payment_method_id ?? null,
                cuotas: pagoMP.installments ?? null,
                detalleEstado: pagoMP.status_detail ?? null,
                payloadWebhook: pagoMP,
                procesadoEn: new Date(),
            },
            { transaction: transaccion }
        );

        await transaccion.commit();
    } catch (error) {
        await transaccion.rollback();

        if (error.name === "SequelizeUniqueConstraintError") {
            return { procesado: false, motivo: "duplicado" };
        }
        throw error;
    }

    if (estadoInterno === "aprobado" && orden.estado === "pendiente") {
        await emitirTickets(orden.id);
        return { procesado: true, estado: "aprobado", ordenId: orden.id };
    }

    if (estadoInterno === "rechazado") {
        await Orden.update(
            { estado: "cancelada", motivoCancelacion: `Pago rechazado: ${pagoMP.status_detail}` },
            { where: { id: orden.id, estado: "pendiente" } }
        );
        return { procesado: true, estado: "rechazado", ordenId: orden.id };
    }

    return { procesado: true, estado: estadoInterno, ordenId: orden.id };
}

function traducirEstado(estadoMP) {
    const mapa = {
        approved: "aprobado",
        authorized: "aprobado",
        pending: "pendiente",
        in_process: "en_proceso",
        in_mediation: "en_proceso",
        rejected: "rechazado",
        cancelled: "cancelado",
        refunded: "reembolsado",
        charged_back: "reembolsado",
    };
    return mapa[estadoMP] ?? "pendiente";
}
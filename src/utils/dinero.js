export function aCentavos(valor) {
    if (valor === null || valor === undefined) return 0;
    return Math.round(Number(valor) * 100);
}

export function aPesos(centavos) {
    return Number((centavos / 100).toFixed(2));
}

export function formatearPesos(centavos) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(centavos / 100);
}

export function sumar(...valores) {
    return valores.reduce((acc, v) => acc + aCentavos(v), 0);
}

export function multiplicar(valor, cantidad) {
    return aCentavos(valor) * cantidad;
}

export function porcentaje(centavos, pct) {
    return Math.round(centavos * (pct / 100));
}
import { sequelize, Sala, Butaca, Pelicula, Funcion, FuncionButaca, Usuario, Combo } from "../models/index.js";

const CONFIG_SALAS = [
    {
        nombre: "Sala 1",
        soporta3d: true,
        filas: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        butacasPorFila: 14,
        pasilloDespuesDe: 7,
        filasAccesibles: ["A"],
        filasVip: ["F", "G"],
    },
    {
        nombre: "Sala 2",
        soporta3d: true,
        filas: ["A", "B", "C", "D", "E", "F", "G", "H"],
        butacasPorFila: 12,
        pasilloDespuesDe: 6,
        filasAccesibles: ["A"],
        filasVip: [],
        filasCortas: { H: 8 },
    },
    {
        nombre: "Sala 3",
        soporta3d: false,
        filas: ["A", "B", "C", "D", "E", "F"],
        butacasPorFila: 10,
        pasilloDespuesDe: null,
        filasAccesibles: ["A"],
        filasVip: [],
    },
];

function generarButacas(config, salaId) {
    const butacas = [];

    config.filas.forEach((fila, indiceFila) => {
        const cantidad = config.filasCortas?.[fila] ?? config.butacasPorFila;

        for (let numero = 1; numero <= cantidad; numero++) {
            let posX = numero;
            if (config.pasilloDespuesDe && numero > config.pasilloDespuesDe) {
                posX = numero + 1;
            }

            let tipo = "normal";
            if (config.filasAccesibles.includes(fila)) tipo = "accesible";
            else if (config.filasVip.includes(fila)) tipo = "vip";

            butacas.push({
                salaId,
                fila,
                numero,
                tipo,
                posX,
                posY: indiceFila,
                activa: true,
            });
        }
    });

    return butacas;
}

async function crearSalasYButacas() {
    const salas = {};

    for (const config of CONFIG_SALAS) {
        const sala = await Sala.create({
            nombre: config.nombre,
            soporta3d: config.soporta3d,
            cantidadFilas: config.filas.length,
            cantidadColumnas: config.butacasPorFila + (config.pasilloDespuesDe ? 1 : 0),
            activa: true,
        });

        const butacas = generarButacas(config, sala.id);
        await Butaca.bulkCreate(butacas);

        salas[config.nombre] = sala;
        console.log(`   ${config.nombre}: ${butacas.length} butacas`);
    }

    return salas;
}

async function crearUsuarios() {
    await Usuario.create({
        email: "admin@cinealfa.com",
        password: "admin123",
        nombre: "Administrador",
        rol: "admin",
        emailVerificado: true,
    });

    await Usuario.create({
        email: "portero@cinealfa.com",
        password: "portero123",
        nombre: "Control de Acceso",
        rol: "portero",
        emailVerificado: true,
    });
}

async function crearPeliculas() {
    return await Pelicula.bulkCreate([
        {
            titulo: "Toy Story 5",
            tituloOriginal: "Toy Story 5",
            sinopsis: "Woody, Buzz y la pandilla se enfrentan a un recién llegado de alta tecnología.",
            duracionMinutos: 100,
            clasificacion: "ATP",
            genero: "Animación, Aventuras, Familiar",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/pTjZfbFVWUIwUM5OzX3LVh84ejU.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w1066_and_h600_face/8sSKdEmlmqF4kJUd28SqthXC4yZ.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=s_qpMMkvHYE",
            fechaEstreno: "2026-08-13",
            activa: true,
        },
        {
            titulo: "Spider-Man: Brand New Day",
            tituloOriginal: "Spider-Man: Brand New Day",
            sinopsis: "Peter Parker protege una Nueva York que ya no lo recuerda.",
            duracionMinutos: 135,
            clasificacion: "+13",
            genero: "Acción, Ciencia Ficción, Aventuras",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/1bfaqGFi63AaQWlHuEahhCmxPUU.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w533_and_h300_face/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=YAfxu9voYLs",
            fechaEstreno: "2026-08-13",
            activa: true,
        },
        {
            titulo: "El Conjuro 4: Últimos Ritos",
            tituloOriginal: "The Conjuring: Last Rites",
            sinopsis: "Los Warren enfrentan el caso más oscuro de sus archivos.",
            duracionMinutos: 118,
            clasificacion: "+16",
            genero: "Terror, Suspenso",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/vrfti9ycF4mlA5WuIyfgCf1LJQG.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w533_and_h300_face/i8MupUe4xgmYXoRNAQMYvuoexSU.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=nXObaGjH4Pc",
            fechaEstreno: "2026-08-13",
            activa: true,
        },
        {
            titulo: "Moana 3",
            tituloOriginal: "Moana 3",
            sinopsis: "Moana vuelve a navegar más allá del arrecife junto a Maui.",
            duracionMinutos: 105,
            clasificacion: "ATP",
            genero: "Animación, Aventuras, Musical",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/4sFGyfPGrS2uonrWFDGlLXT0nyA.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=u3ZqySuR-Z0",
            fechaEstreno: "2026-08-13",
            activa: true,
        },
        {
            titulo: "Yo, Narciso",
            tituloOriginal: "Yo, Narciso",
            sinopsis: "Rocío, profesora de sociología, investiga el narcisismo contemporáneo y se hace pasar por paciente de un cirujano estético para observarlo. Lo que empieza como trabajo de campo se le va de las manos.",
            duracionMinutos: 95,
            clasificacion: "ATP",
            genero: "Comedia, Drama",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/wi487ichY7R5qSa1V0pFoetDPal.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces_filter(blur)/wi487ichY7R5qSa1V0pFoetDPal.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=tv03AgZUBPY",
            fechaEstreno: "2026-08-13",
            activa: true,
        },
        {
            titulo: "Avengers: Doomsday",
            tituloOriginal: "Avengers: Doomsday",
            sinopsis: "Los héroes del multiverso se reúnen para enfrentar al Doctor Doom en el evento más ambicioso de Marvel Studios.",
            duracionMinutos: 165,
            clasificacion: "+13",
            genero: "Acción, Ciencia Ficción, Aventuras",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/rQKabpeIewLLNStFr3anEXI0xqu.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w533_and_h300_face/s4v0UX1anfXm0UvloLsTTJ4v222.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=eJUdJoySLII",
            fechaEstreno: "2026-12-17",
            activa: true,
        },
        {
            titulo: "La Odisea",
            tituloOriginal: "The Odyssey",
            sinopsis: "Adaptación del clásico de Homero. El viaje de Odiseo de regreso a Ítaca tras la guerra de Troya, enfrentando dioses, monstruos y su propio destino.",
            duracionMinutos: 160,
            clasificacion: "+13",
            genero: "Aventuras, Drama, Épica",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/eoNiukYRWJRxMlVnTOye0kkUB5k.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w533_and_h300_face/RMXG8myu1aGlNUsRjtxzmpdMK0.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=8un_UztYsw0",
            fechaEstreno: "2026-07-16",
            activa: true,
        },
        {
            titulo: "Obsession",
            tituloOriginal: "Obsession",
            sinopsis: "Un thriller psicológico sobre los límites entre el deseo y la fijación.",
            duracionMinutos: 112,
            clasificacion: "+16",
            genero: "Thriller, Suspenso",
            posterUrl: "https://www.themoviedb.org/t/p/w600_and_h900_face/wnyUBssII8ZRDjDRlUyXt6tX9rt.jpg",
            backdropUrl: "https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces/rZfmzpixLKLR3Hg2u0WgC7XLFl8.jpg",
            trailerUrl: "https://www.youtube.com/watch?v=5MBu6Xhuj38",
            fechaEstreno: "2026-08-06",
            activa: true,
        },
    ]);
}

async function crearCombos() {
    await Combo.bulkCreate([
        {
            nombre: "Combo Pareja",
            descripcion: "2 pochoclos medianos + 2 gaseosas de 500ml",
            precio: 12500.00,
            orden: 1,
            stock: null,
            activo: true,
        },
        {
            nombre: "Combo Individual",
            descripcion: "1 pochoclo mediano + 1 gaseosa de 500ml",
            precio: 7800.00,
            orden: 2,
            stock: null,
            activo: true,
        },
        {
            nombre: "Pochoclo Grande",
            descripcion: "Balde de pochoclos para compartir",
            precio: 6200.00,
            orden: 3,
            stock: 50,
            activo: true,
        },
    ]);
}

const HORARIOS = ["14:30", "17:00", "19:30", "22:00"];

async function generarButacasDeFuncion(funcion, salaId) {
    const butacasSala = await Butaca.findAll({
        where: { salaId, activa: true },
    });

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

    await FuncionButaca.bulkCreate(snapshot);
    await funcion.update({ butacasGeneradas: true });

    return snapshot.length;
}

async function crearFunciones(salas, peliculas) {
    const listaSalas = Object.values(salas);
    const hoy = new Date();
    let total = 0;

    for (let dia = 0; dia < 7; dia++) {
        for (let s = 0; s < listaSalas.length; s++) {
            const sala = listaSalas[s];

            for (let h = 0; h < HORARIOS.length; h++) {
                const pelicula = peliculas[(s + h + dia) % peliculas.length];

                const [hora, minuto] = HORARIOS[h].split(":").map(Number);
                const inicia = new Date(hoy);
                inicia.setDate(hoy.getDate() + dia);
                inicia.setHours(hora, minuto, 0, 0);

                const termina = new Date(inicia);
                termina.setMinutes(termina.getMinutes() + pelicula.duracionMinutos + 20);

                const es3d = sala.soporta3d && h % 2 === 0;
                const precioBase = es3d ? 9500.0 : 7500.0;

                const funcion = await Funcion.create({
                    peliculaId: pelicula.id,
                    salaId: sala.id,
                    inicia,
                    termina,
                    formato: es3d ? "3D" : "2D",
                    idioma: pelicula.clasificacion === "ATP" ? "doblada" : "subtitulada",
                    precioBase,
                    estado: "en_venta",
                });

                await generarButacasDeFuncion(funcion, sala.id);
                total++;
            }
        }
    }

    console.log(`   ${total} funciones creadas`);
}

async function seed() {
    try {
        console.log("🌱 Iniciando seed...\n");

        console.log("📍 Salas y butacas:");
        const salas = await crearSalasYButacas();

        console.log("\n👤 Usuarios:");
        await crearUsuarios();
        console.log("   admin@cinealfa.com / admin123");
        console.log("   portero@cinealfa.com / portero123");

        console.log("\n🎬 Películas:");
        const peliculas = await crearPeliculas();
        console.log(`   ${peliculas.length} películas`);

        console.log("\n🍿 Combos:");
        await crearCombos();
        console.log("   3 combos");

        console.log("\n📅 Funciones:");
        await crearFunciones(salas, peliculas);

        console.log("\n✅ Seed completado\n");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error en el seed:", error);
        process.exit(1);
    }
}

seed();
import { sequelize } from "./../config/database.js";

import Sala from "./Sala.js";
import Butaca from "./Butaca.js";
import Pelicula from "./Pelicula.js";
import Funcion from "./Funcion.js";
import FuncionButaca from "./FuncionButaca.js";
import Usuario from "./Usuario.js";
import Combo from "./Combo.js";
import Orden from "./Orden.js";
import ItemOrden from "./ItemOrden.js";
import Ticket from "./Ticket.js";
import Pago from "./Pago.js";

Sala.hasMany(Butaca, { foreignKey: "salaId", as: "butacas", onDelete: "CASCADE" });
Butaca.belongsTo(Sala, { foreignKey: "salaId", as: "sala" });

Sala.hasMany(Funcion, { foreignKey: "salaId", as: "funciones", onDelete: "RESTRICT" });
Funcion.belongsTo(Sala, { foreignKey: "salaId", as: "sala" });



Pelicula.hasMany(Funcion, { foreignKey: "peliculaId", as: "funciones", onDelete: "RESTRICT" });
Funcion.belongsTo(Pelicula, { foreignKey: "peliculaId", as: "pelicula" });



Funcion.hasMany(FuncionButaca, { foreignKey: "funcionId", as: "butacas", onDelete: "CASCADE" });
FuncionButaca.belongsTo(Funcion, { foreignKey: "funcionId", as: "funcion" });

Butaca.hasMany(FuncionButaca, { foreignKey: "butacaId", as: "instancias", onDelete: "RESTRICT" });
FuncionButaca.belongsTo(Butaca, { foreignKey: "butacaId", as: "butaca" });

Orden.hasMany(FuncionButaca, { foreignKey: "ordenId", as: "butacasCompradas", onDelete: "SET NULL" });
FuncionButaca.belongsTo(Orden, { foreignKey: "ordenId", as: "orden" });



Usuario.hasMany(Orden, { foreignKey: "usuarioId", as: "ordenes", onDelete: "SET NULL" });
Orden.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

Orden.hasMany(ItemOrden, { foreignKey: "ordenId", as: "items", onDelete: "CASCADE" });
ItemOrden.belongsTo(Orden, { foreignKey: "ordenId", as: "orden" });

FuncionButaca.hasMany(ItemOrden, { foreignKey: "funcionButacaId", as: "items", onDelete: "RESTRICT" });
ItemOrden.belongsTo(FuncionButaca, { foreignKey: "funcionButacaId", as: "funcionButaca" });

Combo.hasMany(ItemOrden, { foreignKey: "comboId", as: "items", onDelete: "RESTRICT" });
ItemOrden.belongsTo(Combo, { foreignKey: "comboId", as: "combo" });



Orden.hasMany(Ticket, { foreignKey: "ordenId", as: "tickets", onDelete: "RESTRICT" });
Ticket.belongsTo(Orden, { foreignKey: "ordenId", as: "orden" });

Funcion.hasMany(Ticket, { foreignKey: "funcionId", as: "tickets", onDelete: "RESTRICT" });
Ticket.belongsTo(Funcion, { foreignKey: "funcionId", as: "funcion" });

FuncionButaca.hasOne(Ticket, { foreignKey: "funcionButacaId", as: "ticket", onDelete: "RESTRICT" });
Ticket.belongsTo(FuncionButaca, { foreignKey: "funcionButacaId", as: "funcionButaca" });

Usuario.hasMany(Ticket, { foreignKey: "usadoPor", as: "ticketsValidados", onDelete: "SET NULL" });
Ticket.belongsTo(Usuario, { foreignKey: "usadoPor", as: "validador" });

Orden.hasMany(Pago, { foreignKey: "ordenId", as: "pagos", onDelete: "CASCADE" });
Pago.belongsTo(Orden, { foreignKey: "ordenId", as: "orden" });

export {
    sequelize,
    Sala,
    Butaca,
    Pelicula,
    Funcion,
    FuncionButaca,
    Usuario,
    Combo,
    Orden,
    ItemOrden,
    Ticket,
    Pago,
};
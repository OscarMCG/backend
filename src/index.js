"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const sala_1 = require("./clases/sala");
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
global.io = io;
server.listen(3000, () => {
    //console.log("server excuchando en p 3000");
});
let salas = [];
let idProximaSala = 0;
io.on("connection", (socket) => {
    //console.log("nueva conect");
    socket.on("encontrarSala", (callback) => buscarSalaPublica(callback));
    socket.on("crearSala", (args, callback) => crearSala(socket, callback, args));
    socket.on("unirseASala", (args, callback) => unirseAsala(socket, callback, args));
    socket.on("disconnecting", () => {
        if (socket.rooms.size < 2)
            return;
        const salaJuagador = salas.find((sala) => sala.id == parseInt([...socket.rooms][1].substring(5)));
        if (!salaJuagador)
            return;
        salaJuagador === null || salaJuagador === void 0 ? void 0 : salaJuagador.jugadorAbandono();
        socket.conn.close();
        salas = salas.filter((sala) => sala.id !== salaJuagador.id);
    });
    socket.on("jugar", (args) => {
        var _a;
        //console.log("viendo registro de jugada", args, buscarSala(args.salaId));
        (_a = buscarSala(args.salaId)) === null || _a === void 0 ? void 0 : _a.jugar(args.jugador, args.posicion);
    });
    socket.on("nuevaPartida", (args) => {
        var _a;
        console.log("viendo registro de nueva partida", args, buscarSala(args.salaId));
        (_a = buscarSala(args.salaId)) === null || _a === void 0 ? void 0 : _a.nuevaPartida();
    });
});
/**
 * Busar sala disponible si la encuentra muestra el id de la sala , y sino devuelve null
 */
function buscarSalaPublica(callback) {
    const salaDisponible = salas.find((sala) => {
        if (!sala.publica)
            return false;
        if (sala.jugadores[0].nombre && sala.jugadores[1].nombre)
            return false;
        return true;
    });
    callback(salaDisponible ? salaDisponible.id : null);
}
function crearSala(socket, callback, args) {
    const nuevaSala = new sala_1.Sala(args);
    nuevaSala.id = idProximaSala;
    idProximaSala++;
    salas.push(nuevaSala);
    unirseAsala(socket, callback, {
        id: nuevaSala.id,
        nombreJugador: args.nombreJugador,
    });
}
function unirseAsala(socket, callback, args) {
    console.log("uniendo a sala", args);
    if (!salas.length)
        return callback({ exito: false, mensaje: "NO existe sala" });
    const salaIndex = salas.findIndex((sala) => sala.id === args.id);
    if (salaIndex === -1)
        return callback({
            exito: false,
            mensaje: "NO existe sala" + args.id,
        });
    if (salas[salaIndex].jugadores[0].nombre &&
        salas[salaIndex].jugadores[1].nombre)
        return callback({ exito: false, mensaje: "La sala esta ocupada" });
    salas[salaIndex].agregarJuagador(args.nombreJugador);
    socket.join("sala-" + salas[salaIndex].id);
    return callback({
        exito: true,
        mensaje: "se unio a la sala" + salas[salaIndex].id,
        sala: salas[salaIndex].getSala(),
    });
}
function buscarSala(id) {
    return salas.find((salas) => salas.id === id);
}

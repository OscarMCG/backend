import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { Sala } from "./clases/sala";
import { CrearSalaArgs, unirseAsalaArgs } from "./interfaces/crearSala";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
global.io = io;

server.listen(3000, () => {
  //console.log("server excuchando en p 3000");
});

let salas: Sala[] = [];
let idProximaSala = 0;

io.on("connection", (socket) => {
  //console.log("nueva conect");

  socket.on("encontrarSala", (callback) => buscarSalaPublica(callback));
  socket.on("crearSala", (args, callback) => crearSala(socket, callback, args));
  socket.on("unirseASala", (args, callback) =>
    unirseAsala(socket, callback, args)
  );
  socket.on("disconnecting", () => {
    if (socket.rooms.size < 2) return;
    const salaJuagador = salas.find(
      (sala) => sala.id == parseInt([...socket.rooms][1].substring(5))
    );
    if (!salaJuagador) return;
    salaJuagador?.jugadorAbandono();
    socket.conn.close();
    salas = salas.filter((sala) => sala.id !== salaJuagador.id);
  });
  socket.on("jugar", (args) => {
    //console.log("viendo registro de jugada", args, buscarSala(args.salaId));
    buscarSala(args.salaId)?.jugar(args.jugador, args.posicion);
  });
  socket.on("nuevaPartida", (args) => {
    console.log(
      "viendo registro de nueva partida",
      args,
      buscarSala(args.salaId)
    );
    buscarSala(args.salaId)?.nuevaPartida();
  });
});

/**
 * Busar sala disponible si la encuentra muestra el id de la sala , y sino devuelve null
 */
function buscarSalaPublica(callback: Function) {
  const salaDisponible = salas.find((sala) => {
    if (!sala.publica) return false;
    if (sala.jugadores[0].nombre && sala.jugadores[1].nombre) return false;
    return true;
  });
  callback(salaDisponible ? salaDisponible.id : null);
}

function crearSala(socket: Socket, callback: Function, args: CrearSalaArgs) {
  const nuevaSala = new Sala(args);
  nuevaSala.id = idProximaSala;
  idProximaSala++;
  salas.push(nuevaSala);
  unirseAsala(socket, callback, {
    id: nuevaSala.id,
    nombreJugador: args.nombreJugador,
  });
}

function unirseAsala(
  socket: Socket,
  callback: Function,
  args: unirseAsalaArgs
) {
  console.log("uniendo a sala", args);
  if (!salas.length)
    return callback({ exito: false, mensaje: "NO existe sala" });
  const salaIndex = salas.findIndex((sala) => sala.id === args.id);
  if (salaIndex === -1)
    return callback({
      exito: false,
      mensaje: "NO existe sala" + args.id,
    });
  if (
    salas[salaIndex].jugadores[0].nombre &&
    salas[salaIndex].jugadores[1].nombre
  )
    return callback({ exito: false, mensaje: "La sala esta ocupada" });

  salas[salaIndex].agregarJuagador(args.nombreJugador);
  socket.join("sala-" + salas[salaIndex].id);
  return callback({
    exito: true,
    mensaje: "se unio a la sala" + salas[salaIndex].id,
    sala: salas[salaIndex].getSala(),
  });
}

function buscarSala(id: number) {
  return salas.find((salas) => salas.id === id);
}

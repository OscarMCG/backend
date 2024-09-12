import { Socket } from "socket.io";
import { CrearSalaArgs } from "../interfaces/crearSala";
import { Jugador, JUGADOR_VACIO } from "../interfaces/jugador";
import {
  EstadoJuego,
  PosicionTablero,
  PosicionGanadora,
  SalaBackend,
  Tablero,
  NumeroJugador,
} from "../interfaces/sala";

export class Sala {
  publica: boolean;
  jugadores: [Jugador, Jugador] = [{ ...JUGADOR_VACIO }, { ...JUGADOR_VACIO }];
  id?: number;
  jugadorInicial: 0 | 1 = 0;
  tablero: Tablero = ["", "", "", "", "", "", "", "", ""];
  posicionGanadora?: PosicionGanadora;

  estado: EstadoJuego = "Esperando_oponente";
  constructor(args: CrearSalaArgs) {
    this.publica = args.publica;
  }

  agregarJuagador(nombre: string) {
    const indiceJugador = !this.jugadores[0].nombre ? 0 : 1;
    this.jugadores[indiceJugador].nombre = nombre;
    this.jugadores[indiceJugador].vidas = 3;
    if (this.jugadores[1].nombre) {
      this.estado = this.jugadorInicial === 0 ? "Turno_O1" : "Turno_O2";
    }
    this.comunicarSala();
  }

  getSala(): SalaBackend {
    return {
      publica: this.publica,
      jugadores: this.jugadores,
      id: this.id!,
      estado: this.estado,
      tablero: this.tablero,
      posicionGanadora: this.posicionGanadora,
    };
  }
  /** informa el estado actual de la sala  */
  comunicarSala() {
    global.io.to("sala-" + this.id).emit("sala", this.getSala());
  }

  jugadorAbandono() {
    //cambia el estado de la sala a abandono
    this.estado = "ABANDONADO";
    this.comunicarSala();
  }

  jugar(numeroJugador: NumeroJugador, posicion: PosicionTablero) {
    if (
      (numeroJugador !== 1 && this.estado === "Turno_O1") ||
      (numeroJugador !== 2 && this.estado === "Turno_O2")
    )
      return;
    this, (this.tablero[posicion] = numeroJugador);
    this.posicionGanadora = undefined;
    //turno de jugador
    this.estado = this.estado === "Turno_O1" ? "Turno_O2" : "Turno_O1";
    //verificar victoria o empate
    const fin = this.verificarVictoria();
    if (fin === "Empate") this.estado = "EMPATE";
    else if (typeof fin === "object") {
      const indiceJugadorAfectado = numeroJugador === 1 ? 1 : 0;
      this.jugadores[indiceJugadorAfectado].vidas--;
      if (this.jugadores[indiceJugadorAfectado].vidas === 0) {
        this.estado = numeroJugador === 1 ? "CAMPEON_O1" : "CAMPEON_O2";
        this.posicionGanadora = fin;
      } else {
        this.estado = numeroJugador === 1 ? "GANADOR_O1" : "GANADOR_O2";
        this.posicionGanadora = fin;
      }
    }
    //comunica sala final

    this.comunicarSala();
  }

  verificarVictoria(): PosicionGanadora | "Empate" | undefined {
    //se verifica las lineas horizontales
    for (let i = 0; i < 3; i += 3) {
      if (
        this.tablero[i] !== "" &&
        this.tablero[i] === this.tablero[i + 1] &&
        this.tablero[i] === this.tablero[i + 2]
      )
        return [
          i as PosicionTablero,
          (i + 1) as PosicionTablero,
          (i + 2) as PosicionTablero,
        ];
    }
    //se verifica las lineas verticales
    for (let i = 0; i < 3; i++) {
      if (
        this.tablero[i] !== "" &&
        this.tablero[i] === this.tablero[i + 3] &&
        this.tablero[i] === this.tablero[i + 6]
      ) {
        return [
          i as PosicionTablero,
          (i + 3) as PosicionTablero,
          (i + 6) as PosicionTablero,
        ];
      }
      //se verifica las lineas oblicuas
      if (
        this.tablero[0] !== "" &&
        this.tablero[0] === this.tablero[4] &&
        this.tablero[0] === this.tablero[8]
      ) {
        return [0, 4, 8];
      }
    }

    if (
      this.tablero[2] !== "" &&
      this.tablero[2] === this.tablero[4] &&
      this.tablero[2] === this.tablero[6]
    ) {
      return [2, 4, 6];
    }
    //VERIFICAR EMPATE
    if (!this.tablero.includes("")) return "Empate";
    return undefined;
  }

  nuevaPartida() {
    this.limpiarTablero();
    this.cambiarJugadorInicial();
    this.posicionGanadora = undefined;
    this.estado = this.jugadorInicial === 0 ? "Turno_O1" : "Turno_O2";
    if (this.jugadores[0].vidas === 0 || this.jugadores[1].vidas === 0) {
      this.jugadores[0].vidas = 3;
      this.jugadores[1].vidas = 3;
    }
    this.comunicarSala();
  }

  limpiarTablero() {
    this.tablero = ["", "", "", "", "", "", "", "", ""];
  }

  cambiarJugadorInicial() {
    this.jugadorInicial = this.jugadorInicial === 0 ? 1 : 0;
  }
}

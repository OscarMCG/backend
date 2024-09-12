"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sala = void 0;
const jugador_1 = require("../interfaces/jugador");
class Sala {
    constructor(args) {
        this.jugadores = [Object.assign({}, jugador_1.JUGADOR_VACIO), Object.assign({}, jugador_1.JUGADOR_VACIO)];
        this.jugadorInicial = 0;
        this.tablero = ["", "", "", "", "", "", "", "", ""];
        this.estado = "Esperando_oponente";
        this.publica = args.publica;
    }
    agregarJuagador(nombre) {
        const indiceJugador = !this.jugadores[0].nombre ? 0 : 1;
        this.jugadores[indiceJugador].nombre = nombre;
        this.jugadores[indiceJugador].vidas = 3;
        if (this.jugadores[1].nombre) {
            this.estado = this.jugadorInicial === 0 ? "Turno_O1" : "Turno_O2";
        }
        this.comunicarSala();
    }
    getSala() {
        return {
            publica: this.publica,
            jugadores: this.jugadores,
            id: this.id,
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
    jugar(numeroJugador, posicion) {
        if ((numeroJugador !== 1 && this.estado === "Turno_O1") ||
            (numeroJugador !== 2 && this.estado === "Turno_O2"))
            return;
        this, (this.tablero[posicion] = numeroJugador);
        this.posicionGanadora = undefined;
        //turno de jugador
        this.estado = this.estado === "Turno_O1" ? "Turno_O2" : "Turno_O1";
        //verificar victoria o empate
        const fin = this.verificarVictoria();
        if (fin === "Empate")
            this.estado = "EMPATE";
        else if (typeof fin === "object") {
            const indiceJugadorAfectado = numeroJugador === 1 ? 1 : 0;
            this.jugadores[indiceJugadorAfectado].vidas--;
            if (this.jugadores[indiceJugadorAfectado].vidas === 0) {
                this.estado = numeroJugador === 1 ? "CAMPEON_O1" : "CAMPEON_O2";
                this.posicionGanadora = fin;
            }
            else {
                this.estado = numeroJugador === 1 ? "GANADOR_O1" : "GANADOR_O2";
                this.posicionGanadora = fin;
            }
        }
        //comunica sala final
        this.comunicarSala();
    }
    verificarVictoria() {
        //se verifica las lineas horizontales
        for (let i = 0; i < 3; i += 3) {
            if (this.tablero[i] !== "" &&
                this.tablero[i] === this.tablero[i + 1] &&
                this.tablero[i] === this.tablero[i + 2])
                return [
                    i,
                    (i + 1),
                    (i + 2),
                ];
        }
        //se verifica las lineas verticales
        for (let i = 0; i < 3; i++) {
            if (this.tablero[i] !== "" &&
                this.tablero[i] === this.tablero[i + 3] &&
                this.tablero[i] === this.tablero[i + 6]) {
                return [
                    i,
                    (i + 3),
                    (i + 6),
                ];
            }
            //se verifica las lineas oblicuas
            if (this.tablero[0] !== "" &&
                this.tablero[0] === this.tablero[4] &&
                this.tablero[0] === this.tablero[8]) {
                return [0, 4, 8];
            }
        }
        if (this.tablero[2] !== "" &&
            this.tablero[2] === this.tablero[4] &&
            this.tablero[2] === this.tablero[6]) {
            return [2, 4, 6];
        }
        //VERIFICAR EMPATE
        if (!this.tablero.includes(""))
            return "Empate";
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
exports.Sala = Sala;

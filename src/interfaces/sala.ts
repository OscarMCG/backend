import { Jugador } from "./jugador";

export type EstadoJuego =
  | "Esperando_oponente"
  | "Turno_O1"
  | "Turno_O2"
  | "GANADOR_O1"
  | "GANADOR_O2"
  | "EMPATE"
  | "ABANDONADO"
  | "CAMPEON_O1"
  | "CAMPEON_O2";

export interface SalaBackend {
  publica: boolean;
  jugadores: [Jugador, Jugador];
  id: number;
  estado: EstadoJuego;
  tablero: Tablero;
  posicionGanadora: PosicionGanadora | undefined;
}
export type PosicionTablero = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Tablero = [
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | "",
  NumeroJugador | ""
];
export type NumeroJugador = 1 | 2;
export type PosicionGanadora = [
  PosicionTablero,
  PosicionTablero,
  PosicionTablero
];

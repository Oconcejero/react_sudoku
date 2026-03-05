import { useState, useEffect } from "react";

function generarSudokuCompleto() {
  const tablero = Array.from({ length: 9 }, () => Array(9).fill(0));

  function esValido(
    tablero: number[][],
    fila: number,
    col: number,
    num: number,
  ) {
    // Fila
    if (tablero[fila].includes(num)) return false;

    // Columna
    for (let f = 0; f < 9; f++) {
      if (tablero[f][col] === num) return false;
    }

    // Bloque 3x3
    const inicioFila = Math.floor(fila / 3) * 3;
    const inicioCol = Math.floor(col / 3) * 3;

    for (let f = inicioFila; f < inicioFila + 3; f++) {
      for (let c = inicioCol; c < inicioCol + 3; c++) {
        if (tablero[f][c] === num) return false;
      }
    }

    return true;
  }

  function resolver() {
    for (let fila = 0; fila < 9; fila++) {
      for (let col = 0; col < 9; col++) {
        if (tablero[fila][col] === 0) {
          const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
            () => Math.random() - 0.5,
          );

          for (const num of numeros) {
            if (esValido(tablero, fila, col, num)) {
              tablero[fila][col] = num;

              if (resolver()) return true;

              tablero[fila][col] = 0;
            }
          }

          return false;
        }
      }
    }
    return true;
  }

  resolver();
  return tablero;
}
function crearPuzzle(tableroCompleto: number[][], cantidadVacias = 40) {
  const puzzle = tableroCompleto.map((fila) => [...fila]);

  let vaciadas = 0;
  while (vaciadas < cantidadVacias) {
    const fila = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[fila][col] !== 0) {
      puzzle[fila][col] = 0;
      vaciadas++;
    }
  }

  return puzzle;
}
function comprobar(tablero: number[][], fila: number, col: number) {
  const valor = tablero[fila][col];
  if (valor === 0) return false;

  // Fila
  const conflictoFila = tablero[fila].some((v, c) => c !== col && v === valor);

  // Columna
  const conflictoColumna = tablero.some(
    (filaRev, f) => f !== fila && filaRev[col] === valor,
  );

  // Bloque 3×3
  const inicioFila = Math.floor(fila / 3) * 3;
  const inicioCol = Math.floor(col / 3) * 3;

  for (let f = inicioFila; f < inicioFila + 3; f++) {
    for (let c = inicioCol; c < inicioCol + 3; c++) {
      if ((f !== fila || c !== col) && tablero[f][c] === valor) {
        return true;
      }
    }
  }

  return conflictoFila || conflictoColumna;
}

function sudokuCompleto(tablero: number[][], error: boolean[][]) {
  const sinCeros = tablero.every((fila) => fila.every((celda) => celda !== 0));
  const sinErrores = error.every((fila) =>
    fila.every((celda) => celda === false),
  );
  return sinCeros && sinErrores;
}

const Tablero = () => {
  const niveles = {
    muyfacil: 5,
    facil: 25,
    media: 45,
    dificil: 60,
    absurdo: 70,
  };
  const [dificultad, setDificultad] = useState<keyof typeof niveles>("media");

  const [tablero, setTablero] = useState<number[][]>([]);
  const [fijas, setFijas] = useState<boolean[][]>([]);
  const [error, setError] = useState<boolean[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(false)),
  );
  const [ganado, setGanado] = useState(false);

  useEffect(() => {
    const completo = generarSudokuCompleto();
    const nuevoPuzzle = crearPuzzle(completo, niveles[dificultad]);

    setTablero(nuevoPuzzle);
    setFijas(nuevoPuzzle.map((fila) => fila.map((celda) => celda !== 0)));
    setError(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(false)),
    );
    setGanado(false);
  }, [dificultad]);

  return (
    <div className="container1">
      <h1>Bienvenido a Sudoku</h1>
      <select
        className="niveles"
        value={dificultad}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setDificultad(e.target.value as keyof typeof niveles)
        }
      >
        {" "}
        <option value="muyfacil">Muy fácil</option>{" "}
        <option value="facil">Fácil</option>{" "}
        <option value="media">Media</option>{" "}
        <option value="dificil">Difícil</option>{" "}
        <option value="absurdo">Absurdo</option>{" "}
      </select>

      <div className="Tablero">
        {tablero.map((fila, indiceDeLaFila) => (
          <div className="fila" key={indiceDeLaFila}>
            {fila.map((celda, indiceDeLaColumna) => (
              <input
                className={`celda 
                  ${fijas[indiceDeLaFila][indiceDeLaColumna] ? "fija" : ""}
                  ${error[indiceDeLaFila][indiceDeLaColumna] ? "error" : ""}
                  ${indiceDeLaColumna % 3 === 0 ? "borde-izq" : ""}
                  ${indiceDeLaFila % 3 === 0 ? "borde-arriba" : ""}
                  ${indiceDeLaColumna === 8 ? "borde-der" : ""}
                  ${indiceDeLaFila === 8 ? "borde-abajo" : ""}
                `}
                value={celda === 0 ? "" : String(celda)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (fijas[indiceDeLaFila][indiceDeLaColumna]) return;
                  const numeroIngresadoPorElUsuario = e.target.value;
                  if (!/^[1-9]?$/.test(numeroIngresadoPorElUsuario)) return;

                  const nuevoTablero = tablero.map((fila, filaIndex) =>
                    fila.map((celdaActual, columnaRevisada) =>
                      filaIndex === indiceDeLaFila &&
                      columnaRevisada === indiceDeLaColumna
                        ? Number(numeroIngresadoPorElUsuario)
                        : celdaActual,
                    ),
                  );

                  const nuevosErrores = nuevoTablero.map((fila, f) =>
                    fila.map((_, c) => comprobar(nuevoTablero, f, c)),
                  );

                  setError(nuevosErrores);
                  setTablero(nuevoTablero);

                  if (sudokuCompleto(nuevoTablero, nuevosErrores)) {
                    setGanado(true);
                  }
                }}
              />
            ))}
          </div>
        ))}
        {ganado && <div className="mensaje-ganado">¡HAS GANADO!</div>}
      </div>
    </div>
  );
};

export default Tablero;

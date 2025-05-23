const preguntas = [
  {
    pregunta: "¿En que Centro SENA esta?",
    opciones: ["CDM", "CDS", "CSS", "Otro"],
    respuestaCorrecta: 0
  },
  {
    pregunta: "¿Tiempo para terminar EP?",
    opciones: ["2 Años", "1 Año", "6 Meses", "18 Meses"],
    respuestaCorrecta: 0
  }
];

let indiceActual = 0;
let puntaje = 0;

function iniciarJuego() {
  document.getElementById("pantalla-inicio").style.display = "none";
  document.getElementById("pantalla-final").style.display = "none";
  document.getElementById("pantalla-juego").style.display = "block";
  indiceActual = 0;
  puntaje = 0;
  document.getElementById("puntaje").textContent = "Puntaje: 0";
  mostrarPregunta();
}

function mostrarPregunta() {
  const actual = preguntas[indiceActual];
  document.getElementById("pregunta").textContent = actual.pregunta;
  const contenedorOpciones = document.getElementById("opciones");
  contenedorOpciones.innerHTML = "";

  actual.opciones.forEach((opcion, index) => {
    const boton = document.createElement("button");
    boton.textContent = opcion;
    boton.onclick = () => verificarRespuesta(index);
    contenedorOpciones.appendChild(boton);
  });
}

function verificarRespuesta(indiceSeleccionado) {
  const correcta = preguntas[indiceActual].respuestaCorrecta;
  const respuestaDiv = document.getElementById("respuesta");

  if (indiceSeleccionado === correcta) {
    puntaje++;
    document.getElementById("puntaje").textContent = "Puntaje: " + puntaje;
    respuestaDiv.innerHTML = "✅ ¡Correcto!";
    respuestaDiv.style.color = "lightgreen";
  } else {
    respuestaDiv.innerHTML = "❌ Incorrecto";
    respuestaDiv.style.color = "red";
  }

  // Mostrar siguiente pregunta después de 1 segundo
  setTimeout(() => {
    respuestaDiv.innerHTML = ""; // Limpiar mensaje
    indiceActual++;
    if (indiceActual < preguntas.length) {
      mostrarPregunta();
    } else {
      mostrarPantallaFinal();
    }
  }, 1000);
}

function mostrarPantallaFinal() {
  document.getElementById("pantalla-juego").style.display = "none";
  document.getElementById("pantalla-final").style.display = "block";
  document.getElementById("puntaje-final").textContent = `Tu puntaje final es: ${puntaje} de ${preguntas.length}`;
}

function volverAlInicio() {
  document.getElementById("pantalla-final").style.display = "none";
  document.getElementById("pantalla-inicio").style.display = "block";
}

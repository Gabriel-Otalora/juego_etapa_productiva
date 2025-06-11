let preguntas = [
  {
    pregunta: "¿Qué es la etapa productiva?",
    opciones: ["Una etapa de descanso", "Una etapa de estudio", "Una etapa para aplicar conocimientos", "Una etapa de evaluación final"],
    respuesta: 2,
    retroalimentacion: "La etapa productiva es para aplicar los conocimientos adquiridos en un entorno real."
  },
  {
    pregunta: "¿Cuánto dura la etapa productiva?",
    opciones: ["3 días", "Depende del programa", "1 semana", "Un semestre fijo"],
    respuesta: 1,
    retroalimentacion: "La duración varía según el programa de formación."
  }
];

let indicePregunta = 0;
let puntaje = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let tiempoTotal = 60;
let tiempoPregunta = 10;
let nombreJugador = "";
let intervalos = [];

function mostrarPantalla(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

function mostrarInstrucciones() {
  mostrarPantalla("pantalla-instrucciones");
}

function mostrarPantallaNombre() {
  mostrarPantalla("pantalla-nombre");
}

function guardarNombre() {
  const nombre = document.getElementById("nombre-usuario").value.trim();
  if (nombre !== "") {
    nombreJugador = nombre;
    iniciarJuego();
  } else {
    alert("Por favor, ingresa tu nombre.");
  }
}

function iniciarJuego() {
  indicePregunta = 0;
  puntaje = 0;
  respuestasCorrectas = 0;
  respuestasIncorrectas = 0;
  tiempoTotal = 60;
  tiempoPregunta = 10;
  document.getElementById("puntaje").textContent = 0;
  mostrarPantalla("pantalla-juego");
  mostrarPregunta();
  iniciarTemporizadores();
}

function mostrarPregunta() {
  const p = preguntas[indicePregunta];
  document.getElementById("pregunta").textContent = p.pregunta;

  let opcionesHTML = "";
  p.opciones.forEach((opcion, i) => {
    opcionesHTML += `<button onclick="responder(${i})">${opcion}</button>`;
  });
  document.getElementById("opciones").innerHTML = opcionesHTML;
  document.getElementById("respuesta").textContent = "";
  tiempoPregunta = 10;
  document.getElementById("tiempo-pregunta").textContent = tiempoPregunta;
}

function responder(seleccion) {
  const p = preguntas[indicePregunta];
  if (seleccion === p.respuesta) {
    document.getElementById("respuesta").textContent = "✅ ¡Respuesta correcta!";
    puntaje++;
    respuestasCorrectas++;
  } else {
    document.getElementById("respuesta").textContent = "❌ Respuesta incorrecta. " + p.retroalimentacion;
    respuestasIncorrectas++;
  }
  document.getElementById("puntaje").textContent = puntaje;
  indicePregunta++;
  if (indicePregunta < preguntas.length) {
    setTimeout(mostrarPregunta, 2000);
  } else {
    finalizarJuego();
  }
}

function iniciarTemporizadores() {
  const totalInterval = setInterval(() => {
    tiempoTotal--;
    document.getElementById("tiempo-total").textContent = tiempoTotal;
    if (tiempoTotal <= 0) {
      clearInterval(totalInterval);
      finalizarJuego();
    }
  }, 1000);

  const preguntaInterval = setInterval(() => {
    tiempoPregunta--;
    document.getElementById("tiempo-pregunta").textContent = tiempoPregunta;
    if (tiempoPregunta <= 0) {
      respuestasIncorrectas++;
      document.getElementById("respuesta").textContent = "⏱️ Tiempo agotado.";
      indicePregunta++;
      if (indicePregunta < preguntas.length) {
        setTimeout(mostrarPregunta, 2000);
        tiempoPregunta = 10;
      } else {
        finalizarJuego();
      }
    }
  }, 1000);

  intervalos.push(totalInterval, preguntaInterval);
}

function finalizarJuego() {
  intervalos.forEach(clearInterval);
  mostrarPantalla("pantalla-final");

  const aprobado = respuestasCorrectas > preguntas.length / 2;
  const cuadroFinal = document.getElementById("cuadro-final");
  const personajeFinal = document.getElementById("personaje-final");

  if (aprobado) {
    cuadroFinal.classList.remove("oculto");
    personajeFinal.classList.remove("oculto");
  } else {
    cuadroFinal.classList.add("oculto");
    personajeFinal.classList.add("oculto");
  }

  const mensaje = `
    <h3>📜 Certificado de Participación</h3>
    <p>Hola <strong>${nombreJugador}</strong>,</p>
    <p>${aprobado ? "🎉 ¡Aprobaste el juego!" : "😞 No aprobaste esta vez."}</p>
    <p>✅ Respuestas correctas: ${respuestasCorrectas}</p>
    <p>❌ Respuestas incorrectas: ${respuestasIncorrectas}</p>
  `;
  document.getElementById("certificado").innerHTML = mensaje;
}

function volverAlInicio() {
  location.reload();
}

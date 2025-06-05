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
  // Agrega más preguntas aquí
];

let indicePregunta = 0;
let puntaje = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let tiempoTotal = 60;
let tiempoPregunta = 10;
let nombreJugador = "";

function mostrarInstrucciones() {
  document.getElementById("pantalla-inicio").style.display = "none";
  document.getElementById("pantalla-instrucciones").style.display = "block";
}

function mostrarPantallaNombre() {
  document.getElementById("pantalla-instrucciones").style.display = "none";
  document.getElementById("pantalla-nombre").style.display = "block";
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
  document.getElementById("pantalla-nombre").style.display = "none";
  document.getElementById("pantalla-juego").style.display = "block";
  mostrarPregunta();
  iniciarTemporizadores();
}

function mostrarPregunta() {
  let p = preguntas[indicePregunta];
  document.getElementById("pregunta").textContent = p.pregunta;

  let opcionesHTML = "";
  p.opciones.forEach((opcion, i) => {
    opcionesHTML += `<button onclick="responder(${i})">${opcion}</button>`;
  });

  document.getElementById("opciones").innerHTML = opcionesHTML;
  document.getElementById("respuesta").textContent = "";
  tiempoPregunta = 10;
}

function responder(seleccion) {
  let p = preguntas[indicePregunta];
  if (seleccion === p.respuesta) {
    document.getElementById("respuesta").textContent = "✅ ¡Respuesta correcta!";
    puntaje++;
    respuestasCorrectas++;
  } else {
    document.getElementById("respuesta").textContent = "❌ Respuesta incorrecta. " + p.retroalimentacion;
    respuestasIncorrectas++;
  }

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

  setInterval(() => {
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
}

function finalizarJuego() {
  document.getElementById("pantalla-juego").style.display = "none";
  document.getElementById("pantalla-final").style.display = "block";

  const aprobado = respuestasCorrectas > preguntas.length / 2;
  const mensaje = `
    <h3>Certificado de Participación</h3>
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

// Variables globales
let nombreJugador = "";
let preguntas = [];
let preguntaActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let puntaje = 0;

// Mostrar pantallas
function mostrarInstrucciones() {
  document.getElementById("pantalla-inicio").classList.add("oculto");
  document.getElementById("pantalla-instrucciones").classList.remove("oculto");
}

function mostrarPantallaNombre() {
  document.getElementById("pantalla-instrucciones").classList.add("oculto");
  document.getElementById("pantalla-nombre").classList.remove("oculto");
}

function volverAlInicio() {
  location.reload();
}

// Guardar nombre y cargar preguntas
function guardarNombre() {
  const nombre = document.getElementById("nombre-usuario").value.trim();
  if (nombre !== "") {
    nombreJugador = nombre;
    cargarPreguntasDesdeFirebase(iniciarJuego);
  } else {
    alert("Por favor, ingresa tu nombre.");
  }
}

// Cargar preguntas
function cargarPreguntasDesdeFirebase(callback) {
  firebase.database().ref("preguntas").once("value")
    .then(snapshot => {
      const datos = snapshot.val();
      if (!datos) {
        alert("No se encontraron preguntas en la base de datos.");
        return;
      }
      const todas = Object.values(datos);
      for (let i = todas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [todas[i], todas[j]] = [todas[j], todas[i]];
      }
      preguntas = todas.slice(0, 3);
      callback();
    })
    .catch(error => {
      console.error("Error al cargar preguntas:", error);
      alert("Error al cargar preguntas.");
    });
}

function iniciarJuego() {
  document.getElementById("pantalla-nombre").classList.add("oculto");
  document.getElementById("pantalla-juego").classList.remove("oculto");
  mostrarPregunta();
}

function mostrarPregunta() {
  const pregunta = preguntas[preguntaActual];
  document.getElementById("pregunta").textContent = pregunta.pregunta;
  const opciones = document.getElementById("opciones");
  opciones.innerHTML = "";
  pregunta.opciones.forEach((opcion, index) => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.onclick = () => verificarRespuesta(index);
    opciones.appendChild(btn);
  });
}

function verificarRespuesta(respuestaSeleccionada) {
  const pregunta = preguntas[preguntaActual];
  if (respuestaSeleccionada === pregunta.respuesta) {
    puntaje++;
    respuestasCorrectas++;
  } else {
    respuestasIncorrectas++;
    alert("❌ Incorrecto.\n📌 " + pregunta.retroalimentacion);
  }
  preguntaActual++;
  if (preguntaActual < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarResultados();
  }
}

function mostrarResultados() {
  document.getElementById("pantalla-juego").classList.add("oculto");
  document.getElementById("pantalla-final").classList.remove("oculto");
  document.getElementById("cuadro-final").classList.remove("oculto");
  document.getElementById("personaje-final").classList.remove("oculto");
  document.getElementById("nombre-final").textContent = nombreJugador;
  document.getElementById("puntaje-final").textContent = puntaje;
  document.getElementById("correctas").textContent = respuestasCorrectas;
  document.getElementById("incorrectas").textContent = respuestasIncorrectas;
  guardarResultadoFirebase();
  enviarGoogleSheets();
}

function guardarResultadoFirebase() {
  const ref = firebase.database().ref("jugadores").push();
  ref.set({
    nombre: nombreJugador,
    puntaje: puntaje,
    correctas: respuestasCorrectas,
    incorrectas: respuestasIncorrectas,
    fecha: new Date().toLocaleString()
  });
}

function enviarGoogleSheets() {
  const formData = new FormData();
  formData.append("entry.1170332590", nombreJugador);
  formData.append("entry.1369388644", puntaje);
  formData.append("entry.1684532845", respuestasCorrectas);
  formData.append("entry.12071704", respuestasIncorrectas);
  fetch("https://script.google.com/macros/s/AKfycbyjEMvnlC2bJ8dSjSfoVE7ClHM1IyE39SQv_CDu_S81pTNk_tWyrFPi-ouzQM2bSTxQog/exec", {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}


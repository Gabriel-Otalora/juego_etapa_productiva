let nombreJugador = "";
let preguntas = [];
let preguntaActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let puntaje = 0;

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
    cargarPreguntasDesdeFirebase(iniciarJuego);
  } else {
    alert("Por favor, ingresa tu nombre.");
  }
}

function cargarPreguntasDesdeFirebase(callback) {
  firebase.database().ref("preguntas").once("value")
    .then(snapshot => {
      const datos = snapshot.val();
      if (!datos) {
        alert("No se encontraron preguntas.");
        return;
      }

      const todasPreguntas = Object.values(datos);
      for (let i = todasPreguntas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [todasPreguntas[i], todasPreguntas[j]] = [todasPreguntas[j], todasPreguntas[i]];
      }

      preguntas = todasPreguntas.slice(0, 3);
      callback();
    })
    .catch(error => {
      console.error("❌ Error al cargar preguntas:", error);
      alert("Error al cargar preguntas desde Firebase.");
    });
}

function iniciarJuego() {
  document.getElementById("pantalla-nombre").style.display = "none";
  document.getElementById("pantalla-juego").style.display = "block";
  mostrarPregunta();
}

function mostrarPregunta() {
  const pregunta = preguntas[preguntaActual];
  document.getElementById("pregunta").textContent = pregunta.pregunta;
  const opciones = document.getElementById("opciones");
  opciones.innerHTML = "";

  pregunta.opciones.forEach((opcion, index) => {
    const boton = document.createElement("button");
    boton.textContent = opcion;
    boton.onclick = () => verificarRespuesta(index);
    opciones.appendChild(boton);
  });
}

function verificarRespuesta(respuestaSeleccionada) {
  const pregunta = preguntas[preguntaActual];

  if (respuestaSeleccionada === pregunta.respuesta) {
    puntaje += 1;
    respuestasCorrectas += 1;
  } else {
    respuestasIncorrectas += 1;
    alert("❌ Incorrecto.\n📌 " + pregunta.retroalimentacion);
  }

  preguntaActual += 1;
  if (preguntaActual < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarResultados();
  }
}

function mostrarResultados() {
  document.getElementById("pantalla-juego").style.display = "none";
  document.getElementById("pantalla-final").style.display = "block";

  document.getElementById("nombre-final").textContent = nombreJugador;
  document.getElementById("puntaje-final").textContent = puntaje;
  document.getElementById("correctas").textContent = respuestasCorrectas;
  document.getElementById("incorrectas").textContent = respuestasIncorrectas;

  guardarResultadoFirebase();
  enviarGoogleSheets();
}

function guardarResultadoFirebase() {
  const jugadorRef = firebase.database().ref("jugadores").push();
  jugadorRef.set({
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

function volverAlInicio() {
  location.reload();
}

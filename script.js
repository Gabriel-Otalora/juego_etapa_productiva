let nombreJugador = "";
let numeroFicha = "";
let correoUsuario = "";
let preguntas = [];
let preguntaActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let puntaje = 0;
let tiempoTotal = 60;
let tiempoPregunta = 10;
let intervaloTotal, intervaloPregunta;

// Mostrar pantallas
function mostrarInstrucciones() {
  document.getElementById("pantalla-inicio").classList.add("oculto");
  document.getElementById("pantalla-instrucciones").classList.remove("oculto");
}

function mostrarPantallaNombre() {
  document.getElementById("pantalla-instrucciones").style.display = "none";
  document.getElementById("pantalla-nombre").style.display = "block";
}

function guardarNombre() {
  const nombre = document.getElementById("nombre-usuario").value.trim();
  const ficha = document.getElementById("numero-ficha").value.trim();
  const correo = document.getElementById("correo-usuario").value.trim();
  const autorizacion = document.getElementById("autorizacion").checked;

  if (!nombre || !ficha || !correo) {
    alert("Por favor, completa todos los campos.");
    return;
  }
  if (!autorizacion) {
    alert("Debes autorizar el tratamiento de datos personales.");
    return;
  }

  nombreJugador = nombre;
  numeroFicha = ficha;
  correoUsuario = correo;

  cargarPreguntasDesdeFirebase(() => {
    document.getElementById("pantalla-nombre").style.display = "none";
    document.getElementById("pantalla-temas").style.display = "block";
  });
}

function mostrarPantallaJuego() {
  document.getElementById("pantalla-temas").style.display = "none";
  document.getElementById("pantalla-juego").style.display = "block";
  document.getElementById("puntaje").textContent = puntaje;
  iniciarTemporizadores();
  mostrarPregunta();
}

function cargarPreguntasDesdeFirebase(callback) {
  firebase.database().ref("preguntas").once("value")
    .then(snapshot => {
      const datos = snapshot.val();
      if (!datos) {
        alert("No hay preguntas disponibles.");
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
      console.error("Error cargando preguntas:", error);
    });
}

function iniciarTemporizadores() {
  intervaloTotal = setInterval(() => {
    tiempoTotal--;
    document.getElementById("tiempo-total").textContent = tiempoTotal;
    if (tiempoTotal <= 0) {
      clearInterval(intervaloTotal);
      clearInterval(intervaloPregunta);
      finalizarJuego();
    }
  }, 1000);

  intervaloPregunta = setInterval(() => {
    tiempoPregunta--;
    document.getElementById("tiempo-pregunta").textContent = tiempoPregunta;
    if (tiempoPregunta <= 0) {
      respuestasIncorrectas++;
      mostrarRetroalimentacion("⏱️ Tiempo agotado.");
      avanzarPregunta();
    }
  }, 1000);
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

  document.getElementById("respuesta").textContent = "";
  document.getElementById("tiempo-pregunta").textContent = tiempoPregunta = 10;
  document.getElementById("progreso-pregunta").textContent = preguntaActual + 1;
}

function verificarRespuesta(index) {
  const pregunta = preguntas[preguntaActual];
  if (index === pregunta.respuesta) {
    puntaje++;
    respuestasCorrectas++;
    mostrarRetroalimentacion("✅ ¡Respuesta correcta!");
  } else {
    respuestasIncorrectas++;
    mostrarRetroalimentacion("❌ Incorrecta. " + pregunta.retroalimentacion);
  }
  document.getElementById("puntaje").textContent = puntaje;
  avanzarPregunta();
}

function mostrarRetroalimentacion(texto) {
  document.getElementById("respuesta").textContent = texto;
}

function avanzarPregunta() {
  clearInterval(intervaloPregunta);
  setTimeout(() => {
    preguntaActual++;
    if (preguntaActual < preguntas.length) {
      mostrarPregunta();
      iniciarTemporizadores(); // reinicia solo pregunta
    } else {
      finalizarJuego();
    }
  }, 2000);
}

function finalizarJuego() {
  clearInterval(intervaloTotal);
  clearInterval(intervaloPregunta);
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
    ficha: numeroFicha,
    correo: correoUsuario,
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
  formData.append("entry.9876543210", numeroFicha);
  formData.append("entry.1357911131", correoUsuario); // <-- reemplaza con tu ID real

  fetch("https://script.google.com/macros/s/AKfycbyjEMvnlC2bJ8dSjSfoVE7ClHM1IyE39SQv_CDu_S81pTNk_tWyrFPi-ouzQM2bSTxQog/exec", {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}

function volverAlInicio() {
  location.reload();
}

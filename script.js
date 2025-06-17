// Inicializa Firebase (solo una vez)
const firebaseConfig = {
  apiKey: "AIzaSyDFC3lrOErLYnSp9_BPakKGpoFW66W6bK4",
  authDomain: "juegoetapaproductiva.firebaseapp.com",
  databaseURL: "https://juegoetapaproductiva-default-rtdb.firebaseio.com",
  projectId: "juegoetapaproductiva",
  storageBucket: "juegoetapaproductiva.firebasestorage.app",
  messagingSenderId: "934327191730",
  appId: "1:934327191730:web:c1e30ef2bfec9a0444e1ab"
};

firebase.initializeApp(firebaseConfig);

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

// Cargar preguntas desde Firebase
function cargarPreguntasDesdeFirebase(callback) {
  firebase.database().ref("preguntas").once("value")
    .then(snapshot => {
      const datos = snapshot.val();
      if (!datos) {
        alert("No se encontraron preguntas.");
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

function guardarNombre() {
  const nombre = document.getElementById("nombre-usuario").value.trim();
  if (nombre !== "") {
    nombreJugador = nombre;
    cargarPreguntasDesdeFirebase(iniciarJuego);
  } else {
    alert("Por favor, ingresa tu nombre.");
  }
}

function iniciarJuego() {
  document.getElementById("pantalla-nombre").classList.add("oculto");
  document.getElementById("pantalla-juego").classList.remove("oculto");
  mostrarPregunta();
}

function mostrarPregunta() {
  const pregunta = preguntas[preguntaActual];
  document.getElementById("pregunta").textContent = pregunta.pregunta;
  document.getElementById("retroalimentacion").textContent = ""; // limpiar

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
    document.getElementById("retroalimentacion").textContent = ""; // Sin feedback si es correcta
  } else {
    respuestasIncorrectas++;
    document.getElementById("retroalimentacion").textContent = "❌ " + pregunta.retroalimentacion;
  }

  preguntaActual++;
  if (preguntaActual < preguntas.length) {
    setTimeout(() => mostrarPregunta(), 1200);
  } else {
    setTimeout(() => mostrarResultados(), 1200);
  }

  document.getElementById("puntaje").textContent = puntaje;
}

function mostrarResultados() {
  document.getElementById("pantalla-juego").classList.add("oculto");
  document.getElementById("pantalla-final").classList.remove("oculto");

  document.getElementById("cuadro-final").classList.remove("oculto");
  document.getElementById("personaje-final").classList.remove("oculto");

  document.getElementById("certificado").innerHTML = `
    <p><strong>Nombre:</strong> ${nombreJugador}</p>
    <p><strong>Puntaje:</strong> ${puntaje}</p>
    <p><strong>Correctas:</strong> ${respuestasCorrectas}</p>
    <p><strong>Incorrectas:</strong> ${respuestasIncorrectas}</p>
  `;

  guardarResultadoFirebase();
  enviarGoogleSheets();
}

function volverAlInicio() {
  location.reload();
}

// Guardar en Firebase
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

// Enviar a Google Sheets
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

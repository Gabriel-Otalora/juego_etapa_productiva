// Inicializa Firebase (reemplaza con tu configuración si es diferente)
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

let nombreJugador = "";
let preguntas = [];
let preguntaActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let puntaje = 0;

// Cargar preguntas desde Firebase
function cargarPreguntasDesdeFirebase(callback) {
  firebase.database().ref("preguntas").once("value")
    .then(snapshot => {
      const datos = snapshot.val();
      if (!datos) {
        alert("No se encontraron preguntas en la base de datos.");
        return;
      }

      const todasPreguntas = Object.values(datos);

      // Mezclar aleatoriamente
      for (let i = todasPreguntas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [todasPreguntas[i], todasPreguntas[j]] = [todasPreguntas[j], todasPreguntas[i]];
      }

      preguntas = todasPreguntas.slice(0, 3);
      callback(); // Iniciar el juego
    })
    .catch(error => {
      console.error("❌ Error al cargar preguntas:", error);
      alert("Error al cargar preguntas desde Firebase.");
    });
}

function mostrarInstrucciones() {
  mostrarPantalla("pantalla-instrucciones");
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

// Iniciar juego
function iniciarJuego() {
  document.getElementById("pantalla-inicial").style.display = "none";
  document.getElementById("pantalla-juego").style.display = "block";
  mostrarPregunta();
}

// Mostrar pregunta actual
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

// Verificar respuesta
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

// Mostrar resultados finales
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

// Guardar en Firebase (jugadores)
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

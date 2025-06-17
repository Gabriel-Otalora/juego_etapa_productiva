// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFC3lrOErLYnSp9_BPakKGpoFW66W6bK4",
  authDomain: "juegoetapaproductiva.firebaseapp.com",
  databaseURL: "https://juegoetapaproductiva-default-rtdb.firebaseio.com",
  projectId: "juegoetapaproductiva",
  storageBucket: "juegoetapaproductiva.appspot.com",
  messagingSenderId: "934327191730",
  appId: "1:934327191730:web:c1e30ef2bfec9a0444e1ab"
};
firebase.initializeApp(firebaseConfig);

// Variables
let nombreJugador = "";
let preguntas = [];
let preguntaActual = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let puntaje = 0;

// Pantallas
function mostrarInstrucciones() {
  document.getElementById("pantalla-inicio").classList.add("oculto");
  document.getElementById("pantalla-instrucciones").classList.remove("oculto");
}

function mostrarPantallaNombre() {
  document.getElementById("pantalla-instrucciones").classList.add("oculto");
  document.getElementById("pantalla-nombre").classList.remove("oculto");
}

// Nombre
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
        alert("No hay preguntas.");
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
    });
}

// Iniciar juego
function iniciarJuego() {
  document.getElementById("pantalla-nombre").classList.add("oculto");
  document.getElementById("pantalla-juego").classList.remove("oculto");
  mostrarPregunta();
}

// Mostrar pregunta
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

// Verificar
function verificarRespuesta(index) {
  const pregunta = preguntas[preguntaActual];
  if (index === pregunta.respuesta) {
    puntaje += 1;
    respuestasCorrectas += 1;
  } else {
    respuestasIncorrectas += 1;
    alert("❌ Incorrecto\n📌 " + pregunta.retroalimentacion);
  }
  preguntaActual++;
  if (preguntaActual < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarResultados();
  }
}

// Resultados
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

// Guardar resultados
function guardarResultadoFirebase() {
  firebase.database().ref("jugadores").push().set({
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

// Reiniciar
function volverAlInicio() {
  location.reload();
}

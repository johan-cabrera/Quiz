//Referencias a elementos del DOM
const menu = document.getElementById("menu");
const quiz = document.getElementById("quiz");
const startBtn = document.getElementById("start-btn");
const preguntaEl = document.getElementById("pregunta");
const preguntaAc = document.getElementById("pregunta-actual")
const opcionesEl = document.getElementById("opciones");
const timerEl = document.getElementById("timer");

//Variables de estado
let preguntas = [];
let preguntaIndex = 0;
let tiempo = 60;
let timer;
let respuestasCorrectas = 0;

// Cargar preguntas desde JSON
async function cargarPreguntas() {
  try {
    const res = await fetch("data/preguntas.json");
    const data = await res.json();
    preguntas = mezclarArray(data);
  } catch (err) {
    console.error('No se pudieron cargar las preguntas:', err);
  }
}

// Comenzar funcionalidad del juego
function iniciarJuego() {
  preguntaIndex = 0;
  tiempo = 60;
  animacionInicial();
  mostrarPregunta();
  iniciarTimer();
}

// Desvanecer contenido del menu y ajustar tamaño de la seccion
function animacionInicial(){
  // Ocultar contenido del menu
  gsap.to(menu.children, { 
    opacity: 0, 
    duration: 0.5,
    onComplete: () => {
    gsap.set(menu.children, { display: "none" }); //Hacer que no ocuope espacio en el DOM
  }
  });

// Animar altura del contenedor
  gsap.to(menu, { 
    height: "30vh",
    duration:1, 
    ease: "power2.inOut",
    onComplete: () => {
    quiz.classList.remove("hidden"); //Remover clase para que se pueda visualizar
  }
  });
}

//Comenzar a mostrar las preguntas del cuestionario
function mostrarPregunta() {
  //Seleccionar pregunta actual y mostrarlo en el DOM
  const pregunta = preguntas[preguntaIndex];

  preguntaEl.textContent = pregunta.pregunta;
  const span = preguntaAc.querySelector('span');
  span.textContent = (preguntaIndex + 1) + "/10";

  opcionesEl.innerHTML = "";

  //Agregar cada opcion de las preguntas al DOM
  pregunta.opciones.forEach((op, idx) => {
    const btn = document.createElement("button");
    btn.classList.add("opcion-btn");
    btn.textContent = op.texto; 
    btn.dataset.correcta = op.correcta; //Dataset para saber si es la respuesta correcta
    btn.addEventListener("click", verificarRespuesta); //Verificar la respuesta cuando se haga click en el boton
    opcionesEl.appendChild(btn);//Agregar opcion al DOM
    
    //Pequeña animacion para mostrar las opciones
    gsap.fromTo(btn, 
      { opacity: 0, x: -50 }, 
      { opacity: 1, x: 0, duration: 0.4, delay: idx * 0.1 }
    );
  });
}

//Funcion para el evento click de las opciones
function verificarRespuesta(e){
  const btnSeleccionado = e.target;
  const esCorrecta = btnSeleccionado.dataset.correcta === "true"; //Verificar si opcion seleccionada es correcta
  const botones = document.querySelectorAll(".opcion-btn"); //Array con todas las opciones

  botones.forEach(btn => {
    const correcto = btn.dataset.correcta === "true"; //Verificar el dataset de cada elemento

    //Cambiar el color segun si es correcta o no es correcta
    if (correcto) {
      btn.style.backgroundColor = "#4CAF50"; 
    } else if (btn == btnSeleccionado && !correcto) { // La respuesta equivocada solo cambia si es la mimsa seleccionada
      btn.style.backgroundColor = "#F44336"; 
    }
  });

  if(esCorrecta) respuestasCorrectas++;

  // Esperar 0.5 segundos antes de pasar a siguiente pregunta
  setTimeout(() => {
    siguientePregunta();
  }, 500);
}

//Funcion para cambiar de pregunta
function siguientePregunta() {
  preguntaIndex++;
  if (preguntaIndex < preguntas.length) {
    mostrarPregunta();
  } else {
    terminarJuego();
  }
}

//Funcion que maneja el timer del juego
function iniciarTimer() {
  timerEl.textContent = tiempo;
  timer = setInterval(() => {
    tiempo--;
    timerEl.textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(timer);
      terminarJuego();
    }
  }, 1000); //Codigo se ejecutara cada 1 segundo
}

// Funcion para terminar el juego
function terminarJuego() {
  clearInterval(timer);
  preguntaEl.textContent = "¡Juego terminado!";

  // Mostrar resultados finales del quiz
  const span = preguntaAc.querySelector('span');
  span.style.color = "green";
  span.textContent = respuestasCorrectas + "/10";

  // SVG para cambiar el icono
  const nuevoSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="green" class="icon icon-tabler icons-tabler-filled icon-tabler-circle-check">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"/>
    </svg>
  `;

  //Cambiar el icono
  preguntaAc.firstElementChild.outerHTML = nuevoSVG;

  //Boton para reiniciar el juego
  opcionesEl.innerHTML = `<button class="opcion-btn" onclick="location.reload()">Volver a jugar</button>`;
}


// Función para barajar
function mezclarArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

//Cargar eventos una vez todo el contenido del DOM se haya mostrado
document.addEventListener("DOMContentLoaded", () => {
  cargarPreguntas();
  startBtn.addEventListener("click", iniciarJuego);
});

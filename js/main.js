//Referencias a elementos del DOM
const menu = document.getElementById("menu");
const quiz = document.getElementById("quiz");
const categoriaSelect = document.getElementById("categoria-select");
const startBtn = document.getElementById("start-btn");
const preguntaEl = document.getElementById("pregunta");
const preguntaAc = document.getElementById("pregunta-actual")
const opcionesEl = document.getElementById("opciones");
const timerEl = document.getElementById("timer");
const cantidadSelect = document.getElementById("cantidad-preguntas");
const cantidadIndicador = document.getElementById("cantidad-indicador");


//Variables de estado
let preguntas = [];
let preguntaIndex = 0;
let tiempo = 60;
let timer;
let respuestasCorrectas = 0;
let categoriasSeleccionadas = [];
let cantidadPreguntas;

//Eventos
cantidadSelect.addEventListener("change", () => {
  cantidadPreguntas = parseInt(cantidadSelect.value);

    // Cambia el texto del numero de preguntas
  cantidadIndicador.textContent = `${cantidadPreguntas} preguntas`;

  // Cambiar color del elemento del numero de preguntas
  let colorFondo = "#4CAF50"; 
  if(cantidadPreguntas === 20) colorFondo = "#FF8C00"; 
  else if(cantidadPreguntas === 25) colorFondo = "#F44336"; 
  cantidadIndicador.style.backgroundColor = colorFondo;

  //cambia el color propio al seleccionar una opcion
  cantidadSelect.style.backgroundColor = "#FFD300";
});

categoriaSelect.addEventListener("change", () => {
  categoriasSeleccionadas = [categoriaSelect.value];
  categoriaSelect.style.backgroundColor = "#FFD300";
  cambiarEstilo(categoriaSelect.value);
});

startBtn.addEventListener("click", iniciarJuego);

//Cargar fondo segun categoria
function cambiarEstilo(categoria){
  const root = document.documentElement;
  root.className = "";
  switch (categoria) {
    case "preg_quimica.json":
      root.classList.add("quimica");
      break;
    case "preg_biologia.json":
      root.classList.add("biologia");
      break;
  }
}

// Cargar preguntas de los JSON seleccionados
async function cargarPreguntas() {
  preguntas = [];

  if (categoriasSeleccionadas.length === 0 || !cantidadPreguntas) {
    alert("Por favor seleccione una categoria y la cantidad de preguntas.");
    return;
  }

  try {
    for (const file of categoriasSeleccionadas) {
      const res = await fetch("data/" + file);
      const data = await res.json();
      preguntas = preguntas.concat(data);
    }
    preguntas = mezclarArray(preguntas).slice(0, cantidadPreguntas);
  } catch (err) {
    console.error("No se pudieron cargar las preguntas:", err);
  }
}

// Comenzar funcionalidad del juego
async  function iniciarJuego() {
  await cargarPreguntas();
  if (preguntas.length === 0) return; //Si no hay preguntas no inicia

  preguntaIndex = 0;
  respuestasCorrectas = 0;

  // Ajustar tiempo según cantidad de preguntas
  if (cantidadPreguntas === 10) tiempo = 60;
  else if (cantidadPreguntas === 20) tiempo = 120;
  else if (cantidadPreguntas === 25) tiempo = 150;

  timerEl.textContent = tiempo;
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
  span.textContent = (preguntaIndex + 1) + "/" + preguntas.length;

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
    btn.disabled = true
    const correcto = btn.dataset.correcta === "true"; //Verificar el dataset de cada elemento

    //Cambiar el color segun si es correcta o no es correcta
    if (correcto) {
      btn.style.backgroundColor = "#4CAF50"; 
    } else if (btn == btnSeleccionado && !correcto) { // La respuesta equivocada solo cambia si es la mimsa seleccionada
      btn.style.backgroundColor = "#F44336"; 
    }
  });

  if(esCorrecta) respuestasCorrectas++;

  // Esperar un segundo antes de pasar a siguiente pregunta
  setTimeout(() => {
    siguientePregunta();
  }, 1000);
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
  span.textContent = respuestasCorrectas + "/" + preguntas.length;

  //Mensaje de ánimo al final del juego
  let mensajeFinal = "";
  const porcentaje = (respuestasCorrectas / preguntas.length) * 100;
  if (porcentaje === 100) {
    mensajeFinal = "¡Excelente! 🎉";
  } else if (porcentaje >= 70) {
    mensajeFinal = "¡Muy bien hecho! 💪";
  } else if (porcentaje >= 40) {
    mensajeFinal = "La siguiente lo harás mejor 😉";
  } else {
    mensajeFinal = "Sigue practicando... 📚";
  }
  preguntaEl.textContent = mensajeFinal;

  
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


// index.js - Lógica de Control del Juego

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Game from './Game.js'; // Importamos la clase Game
import Swal from 'sweetalert2';
import '../public/css/main.css';

// =========================================================
// === MANEJO DEL HISTORIAL V/D ============================
// =========================================================

const HISTORIAL_KEY = "dragon_game_historial_vd";
const historialContenidoEl = document.getElementById("historial_contenido");
const historialPanelEl = document.getElementById("historial_vd");
// Referencia al nuevo botón de borrar historial
const btnBorrarHistorial = document.getElementById("btn_borrar_historial");


const manejarHistorial = {
    // 1. Cargar historial desde localStorage o inicializarlo
    cargar: () => {
        const data = localStorage.getItem(HISTORIAL_KEY);
        // Inicializamos como objeto vacío, los jugadores se añadirán dinámicamente
        const historialBase = {}; 
        try {
            return data ? JSON.parse(data) : historialBase;
        } catch (e) {
            console.error("Error al cargar o parsear el historial:", e);
            return historialBase;
        }
    },

    // 2. Guardar el historial en localStorage
    guardar: (historial) => {
        try {
            localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
        } catch (e) {
            console.error("Error al guardar el historial:", e);
        }
    },

    // 3. Actualizar el historial después de una partida
    actualizar: (ganador, perdedor) => {
        const historial = manejarHistorial.cargar();
        
        // Inicializar si el jugador no existe (usamos el username como clave)
        if (!historial[ganador]) historial[ganador] = { V: 0, D: 0 };
        if (!historial[perdedor]) historial[perdedor] = { V: 0, D: 0 };

        // Incrementar contadores
        historial[ganador].V += 1;
        historial[perdedor].D += 1;

        manejarHistorial.guardar(historial);
        manejarHistorial.mostrar(historial); // Actualiza la vista en el DOM
    },

    // 4. Mostrar el historial en el panel HTML
    mostrar: (historial) => {
        if (!historialContenidoEl || !historialPanelEl) return;

        const nombres = Object.keys(historial);
        
        if (nombres.length === 0) {
            historialContenidoEl.innerHTML = '<p class="col-12 text-center small text-muted mb-0">No hay partidas registradas.</p>';
            historialPanelEl.classList.add("d-none");
            // Deshabilitar botón si está vacío
            if (btnBorrarHistorial) btnBorrarHistorial.disabled = true;
            return;
        }
        
        let htmlContent = '';
        
        // Ordenar por diferencia V-D (mayor diferencia positiva primero)
        nombres.sort((a, b) => (historial[b].V - historial[b].D) - (historial[a].V - historial[a].D)); 
        
        nombres.forEach(nombre => {
            const stats = historial[nombre];
            
            // Determina el color del nombre basándose en si el jugador está activo o un color por defecto
            let nombreColor = '#fff';
            if (player1 && nombre === player1.getUsername()) {
                nombreColor = 'var(--player1-color)';
            } else if (player2 && nombre === player2.getUsername()) {
                nombreColor = 'var(--player2-color)';
            }
            
            htmlContent += `
                <div class="col-md-6 col-12">
                    <div class="historial-jugador-entry">
                        <h4 style="color: ${nombreColor};">
                            ${nombre}
                        </h4>
                        <div class="historial-jugador-stats">
                            <span class="historial-victorias">V: ${stats.V}</span>
                            <span class="historial-derrotas">D: ${stats.D}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        historialContenidoEl.innerHTML = htmlContent;
        historialPanelEl.classList.remove("d-none"); // Muestra el panel si hay datos
        // Habilitar botón si hay datos
        if (btnBorrarHistorial) btnBorrarHistorial.disabled = false;
    },

    // 5. Función para borrar el historial (NUEVA FUNCIÓN)
    borrar: () => {
         Swal.fire({
            title: '¿Estás seguro de borrar el historial?',
            text: "¡Esta acción es irreversible! Se eliminarán todos los registros de combate.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡Borrar todo! 💥',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Elimina la clave del localStorage
                localStorage.removeItem(HISTORIAL_KEY); 
                // Recarga el historial (mostrará el mensaje de "No hay partidas...")
                manejarHistorial.mostrar(manejarHistorial.cargar());

                Swal.fire(
                    '¡Eliminado!',
                    'El historial de combate ha sido borrado con éxito.',
                    'success'
                );
            }
        });
    }
};

let historialVD = manejarHistorial.cargar();
manejarHistorial.mostrar(historialVD); // Muestra el historial al cargar la página

// --- ADICIÓN DEL ESCUCHADOR DE EVENTOS PARA EL BOTÓN DE BORRAR HISTORIAL ---
if (btnBorrarHistorial) {
    btnBorrarHistorial.addEventListener('click', manejarHistorial.borrar);
}
// --------------------------------------------------------------------------


// =========================================================
// === LÓGICA DE FONDO DE BATALLA (NUEVO CÓDIGO) ===========
// =========================================================

const FONDOS_DE_BATALLA = [
    'dbz-bg-battle-1',
    'dbz-bg-battle-2',
    'dbz-bg-battle-3'
];

const CLASE_FONDO_SELECCION = 'dbz-bg-seleccion'; 
let fondoActualDeBatalla = ''; // Para rastrear qué fondo quitar

/**
 * Selecciona una clase de fondo de batalla aleatoria y la aplica al <body>.
 */
function aplicarFondoAleatorio() {
    // 1. Quita la clase de fondo anterior y la clase de selección
    document.body.classList.remove(CLASE_FONDO_SELECCION); 
    if (fondoActualDeBatalla) {
        document.body.classList.remove(fondoActualDeBatalla);
    }
    
    // 2. Selecciona un fondo aleatorio
    const indiceAleatorio = Math.floor(Math.random() * FONDOS_DE_BATALLA.length);
    fondoActualDeBatalla = FONDOS_DE_BATALLA[indiceAleatorio];
    
    // 3. Aplica el nuevo fondo.
    document.body.classList.add(fondoActualDeBatalla);
}

/**
 * Restaura el fondo al estado de selección.
 */
function restaurarFondoSeleccion() {
    // 1. Quita la clase de fondo actual de batalla
    if (fondoActualDeBatalla) {
        document.body.classList.remove(fondoActualDeBatalla);
        fondoActualDeBatalla = ''; // Resetea
    }
    
    // 2. Restaura la clase de fondo de selección
    document.body.classList.add(CLASE_FONDO_SELECCION);
}

// =========================================================
// === ESTADO Y REFERENCIAS GLOBALES =======================
// =========================================================
let player1;
let player2;
let personaje1 = "";
let personaje2 = "";
let jugador1Aceptado = false;
let jugador2Aceptado = false;

// Referencias a elementos del DOM
const seleccionDiv = document.getElementById("seleccion_jugadores");
const batallaDiv = document.getElementById("batalla");
const btn_py1 = document.getElementById("btn_py1");
const btn_py2 = document.getElementById("btn_py2");
const seleccion1 = document.getElementById("seleccion_personaje_py1");
const seleccion2 = document.getElementById("seleccion_personaje_py2");


// --- DIÁLOGOS Y ASSETS DE PERSONAJES ---
const accionesPersonaje={
     "Cell":{
          "basico":{
            img:"Cell/basico.png",
            msj:"¡El poder de un guerrero perfecto!", 
          },
          "especial":{
             img:"Cell/especial.png",
            msj:"¡Maldita sea, no me subestimes! ¡Kame Hame Ha!",
          },
          "semilla":{
             img:"Cell/curar.png",
            msj:"He regresado a mi forma perfecta.",
           },
          "ki":{
             img:"Cell/energia.png",
            msj:"¡Hora de absorber energía! ¡AAhhh!",
           }
 },   
 "Gohan":{
          "basico":{
            img:"Gohan/basico.png",
            msj:"¡No te lo perdonaré!",
          },
          "especial":{
             img:"Gohan/especial.png",
            msj:"¡Pagarás por esto! ¡Masenko!",
          },
          "semilla":{
             img:"Gohan/curar.png",
            msj:"¡Con esto, mi fuerza regresa!",
           },
          "ki":{
             img:"Gohan/energia.png",
            msj:"¡Despierta, poder oculto!",
           }
 },   
 "Gogueta":{
          "basico":{
            img:"Gogueta/basico.png",
            msj:"¡Es hora de la diversión!",
          },
          "especial":{
             img:"Gogueta/especial.png",
            msj:"¡Final Flash definitivo! ¡Preparate!",
          },
          "semilla":{
             img:"Gogueta/curar.png",
            msj:"¡Esto no ha terminado! ¡Sigamos!",
           },
          "ki":{
             img:"Gohan/energia.png",
            msj:"¡El poder de la fusión es ilimitado!",
           }
 },   
 "Goku":{
          "basico":{
            img:"Goku/basico.png",
            msj:"¡Vamos a luchar!",
          },
          "especial":{
             img:"Goku/especial.png",
            msj:"¡Adiós! ¡Kame Hame HAAAA!",
          },
          "semilla":{
             img:"Goku/curar.png",
            msj:"¡Una semilla me hará recuperar mis fuerzas!",
           },
          "ki":{
             img:"Goku/energia.png",
            msj:"¡Aumentaré mi Ki! ¡KAIOKEN!",
           }
 },   
 "Pikoro":{
          "basico":{
            img:"Pikoro/basico.png",
            msj:"¡Esto es solo el comienzo!",
          },
          "especial":{
             img:"Pikoro/especial.png",
            msj:"¡Rayo de energía más poderoso!",
          },
          "semilla":{
             img:"Pikoro/curar.png",
            msj:"Mi regeneración es superior a cualquier herida.",
           },
          "ki":{
             img:"Pikoro/energia.png",
            msj:"¡Concentración, Namekusei!",
           }
 },   
 "Trunks":{
          "basico":{
            img:"Trunks/basico.png",
            msj:"¡Lo haré por el futuro!",
          },
          "especial":{
             img:"Trunks/especial.png",
            msj:"¡Espada del futuro! ¡Toma esto!",
          },
          "semilla":{
             img:"Trunks/curar.png",
            msj:"¡No puedo rendirme ahora!",
           },
          "ki":{
             img:"Trunks/energia.png",
            msj:"¡El futuro no será destruido!",
           }
 },   
 "Veguetta":{
          "basico":{
            img:"Veguetta/basico.png",
            msj:"¡Muere, insecto!",
          },
          "especial":{
             img:"Veguetta/especial.png",
            msj:"¡Mi poder es absoluto! ¡Big Bang Attack!",
          },
          "semilla":{
             img:"Veguetta/curar.png",
            msj:"¡Hmph! ¡Un simple curación no me detendrá!",
           },
          "ki":{
             img:"Veguetta/energia.png",
            msj:"¡Soy el príncipe de los Saiyajin!",
           }
 },   
 "VeguitoMega":{
          "basico":{
            img:"VeguitoMega/basico.png",
            msj:"¡Es un juego para mí!",
          },
          "especial":{
             img:"VeguitoMega/especial.png",
            msj:"¡Destrúyelo! ¡Final Kame Hame Ha!",
          },
          "semilla":{
             img:"VeguitoMega/curar.png",
            msj:"¡Un poco de energía y listo!",
           },
          "ki":{
             img:"VeguitoMega/energia.png",
            msj:"¡El poder de la fusión es invencible!",
           }
 },
 "GokuAF":{
          "basico":{
            img:"GokuAF/basico.png",
            msj:"¡Es un juego para mí!",
          },
          "especial":{
             img:"GokuAF/especial.png",
            msj:"¡Destrúyelo! ¡Final Kame Hame Ha!",
          },
          "semilla":{
             img:"GokuAF/curar.png",
            msj:"¡Un poco de energía y listo!",
           },
          "ki":{
             img:"GokuAF/energia.png",
            msj:"¡¡Aumentaré mi Ki!",
           }
 }
}

// --- FUNCIÓN DE ALERTA DE ATAQUE ---
const alertaAtk = (personaje,accion) => {
    let timerInterval;
    Swal.fire({
        title: accionesPersonaje[personaje][accion].msj,
        imageUrl: `./public/img/${accionesPersonaje[personaje][accion].img}`,
        imageWidth: 250, 
        imageHeight: 250,
        showCancelButton:false,
        showConfirmButton:false,
        backdrop: 'rgba(0, 0, 0, 0.85)',
        background: '#000000d0', 
        color: '#fff', 
        customClass: {
            popup: 'dbz-action-card',
            title: 'dbz-action-title'
        },
        html: `<b class="dbz-action-timer"></b>`,
        timer: 2000,
        timerProgressBar: true,
        willClose: () => {
            clearInterval(timerInterval);
        },
        didOpen: () => {
            const b = Swal.getHtmlContainer() ? Swal.getHtmlContainer().querySelector('b') : null;
            
            timerInterval = setInterval(() => {
                if (b && Swal.isVisible()) { 
                    b.textContent = `...${Math.floor(Swal.getTimerLeft() / 100) / 10}s`;
                } else {
                    clearInterval(timerInterval);
                }
            }, 100);
        }
    });
};

// --- FUNCIÓN DE UTILIDAD: SINCRONIZACIÓN DE BARRAS DE ESTADO ---
const actualizarHUD = (player, num) => {
    if (!player) return; 
    
    // NOTA: Se asume que Game.MAX_STAT es 100 y que los getVida/getKi/getEnergia devuelven valores hasta 100
    const MAX_STAT = Game.MAX_STAT;

    // Actualización de barras:
    const vidaBar = document.getElementById(`vida${num}`);
    if (vidaBar) {
        vidaBar.style.width = `${player.getVida() / MAX_STAT * 100}%`;
        vidaBar.innerText = `${player.getVida()}`;
    }
    
    const kiBar = document.getElementById(`ki${num}`);
    if (kiBar) {
        kiBar.style.width = `${player.getKi() / MAX_STAT * 100}%`; 
        kiBar.innerText = `${player.getKi()}`;
    }

    const energiaBar = document.getElementById(`energia${num}`);
    if (energiaBar) {
        energiaBar.style.width = `${player.getEnergia() / MAX_STAT * 100}%`; 
        energiaBar.innerText = `${player.getEnergia()}`;
    }
    
    // --- Control de Deshabilitación de Botones por Recursos/Estados ---
    
    // Costos (Se asume que Game.js tiene estas constantes)
    const tieneRecursosBasico = player.getEnergia() >= Game.COSTO_ATK_BASIC_ENERGIA && player.getKi() >= Game.COSTO_ATK_BASIC_KI;
    const tieneRecursosEspecial = player.getEnergia() >= Game.COSTO_ATK_ESPECIAL_ENERGIA && player.getKi() >= Game.COSTO_ATK_ESPECIAL_KI;
    const tieneCostoSemilla = player.getEnergia() >= Game.COSTO_SEMILLA_ENERGIA;

    // Chequeo de estados máximos
    const kiYEnergiaMax = player.getKi() === MAX_STAT && player.getEnergia() === MAX_STAT;
    const tieneTodoMaximo = player.getVida() === MAX_STAT && kiYEnergiaMax;


    // 1. Ataques
    const btnAtkBasico = document.getElementById(`btn_atk_basico${num}`);
    if (btnAtkBasico) btnAtkBasico.disabled = !tieneRecursosBasico;

    const btnAtkEspecial = document.getElementById(`btn_atk_especial${num}`);
    if (btnAtkEspecial) btnAtkEspecial.disabled = !tieneRecursosEspecial;

    // 2. Carga de Ki: Se deshabilita si Ki Y Energía están al 100%
    const btnCargarKi = document.getElementById(`btn_cargar_ki${num}`);
    if (btnCargarKi) btnCargarKi.disabled = kiYEnergiaMax;
    
    // 3. Semilla: Se deshabilita si NO tiene el costo de Energía O si tiene el 100% en las 3 barras.
    const btnSemilla = document.getElementById(`btn_semilla${num}`);
    if (btnSemilla) btnSemilla.disabled = !tieneCostoSemilla || tieneTodoMaximo;
}

// --- LÓGICA DE SELECCIÓN DE PERSONAJES ---

const cambiarSeleccion = (botones, tituloSeleccionado, colorClase) => {
    botones.forEach(btn => {
        const imgTitle = btn.querySelector("img").title;
        // La clase "dbz-btn" se añade automáticamente si no se selecciona
        btn.classList.remove("selected", "btn-danger", "btn-primary"); 
        
        if (tituloSeleccionado === imgTitle) {
            btn.classList.add(colorClase, "selected"); 
        } else {
             // Esto mantiene el botón con el estilo dbz-btn si no está seleccionado
            btn.classList.remove("btn-danger", "btn-primary");
        }
    });
}

// --- LÓGICA DE PREVISUALIZACIÓN KOF ---
const setupCharacterSelection = (selectionElement, playerNum, portraitPreviewElement) => {
    if (!selectionElement) return;

    selectionElement.querySelectorAll(".personaje-btn").forEach(btn => {
        // Evento de CLIC (Selección)
        btn.addEventListener("click", (evento) => {
            const imgTitle = evento.currentTarget.querySelector("img").title;
            const colorClass = playerNum === 1 ? "btn-danger" : "btn-primary";
            const acceptBtn = playerNum === 1 ? btn_py1 : btn_py2;

            cambiarSeleccion(selectionElement.querySelectorAll(".personaje-btn"), imgTitle, colorClass); 
            
            if (playerNum === 1) {
                personaje1 = imgTitle;
            } else {
                personaje2 = imgTitle;
            }
            if (imgTitle !== "") acceptBtn.disabled = false;
        });
    });
};

// Aplicar la lógica de selección (asumo que se ejecuta sin errores de null)
setupCharacterSelection(seleccion1, 1, null); // Pasando null si las referencias no están en el DOM
setupCharacterSelection(seleccion2, 2, null);


// --- LÓGICA DE TRANSICIÓN Y FIN DE JUEGO ---

/** Reinicia los estados de los jugadores y el turno para una revancha. */
const reiniciarBatalla = () => {
    player1.resetStats(); // Asumo que Game.js tiene resetStats()
    player2.resetStats();
    // Vuelve a habilitar el juego y reinicia el HUD
    actualizarHUD(player1, 1);
    actualizarHUD(player2, 2);
    // Inicia el turno del jugador 1
    manejarTurno(null, player2, 2); 
}

/** Reinicia todo para volver a la selección de personajes. */
const reiniciarSeleccion = () => {
    // Esconder la batalla, mostrar la selección
    batallaDiv.classList.add("d-none");
    seleccionDiv.classList.remove("d-none"); 
    
    // ✅ RESTAURA EL FONDO DE SELECCIÓN
    restaurarFondoSeleccion();
    
    // Mostrar paneles de selección
    document.getElementById(`jugador1`).classList.remove("d-none");
    document.getElementById(`jugador2`).classList.remove("d-none");
    
    // Reiniciar estados de aceptación y personajes
    jugador1Aceptado = false;
    jugador2Aceptado = false;
    personaje1 = "";
    personaje2 = "";
    player1 = null; // Liberar objetos de jugador
    player2 = null;
    
    // Deshabilitar botones de aceptar hasta que seleccionen de nuevo
    btn_py1.disabled = true;
    btn_py2.disabled = true;

    // Quitar selección visual de personajes
    seleccion1.querySelectorAll(".personaje-btn").forEach(btn => cambiarSeleccion(seleccion1.querySelectorAll(".personaje-btn"), "", "btn-danger"));
    seleccion2.querySelectorAll(".personaje-btn").forEach(btn => cambiarSeleccion(seleccion2.querySelectorAll(".personaje-btn"), "", "btn-primary"));
    
    // Vuelve a cargar y mostrar el historial (por si hubo cambios)
    manejarHistorial.mostrar(manejarHistorial.cargar());
}


const ocultarSeleccion = (jugadorNum) => {
    document.getElementById(`jugador${jugadorNum}`).classList.add("d-none");
}

const mostrarBatalla = () => {
   if (jugador1Aceptado && jugador2Aceptado) {
    seleccionDiv.classList.add("d-none"); 
    batallaDiv.classList.remove("d-none"); 
    historialPanelEl.classList.add("d-none"); // OCULTA el historial en batalla
    
    // ✅ APLICA EL FONDO ALEATORIO AL INICIAR LA BATALLA
    aplicarFondoAleatorio();
    
    // Inicia el turno del jugador 1 
    manejarTurno(null, player2, 2); 
   }
}

/**
 * Función central para gestionar el final de cada acción y el cambio de turno.
 * @param {*} atacante El jugador que acaba de actuar (puede ser null al inicio).
 * @param {*} oponente El jugador que recibió la acción.
 * @param {number} numAnterior El número de jugador que acaba de terminar su turno (1 o 2).
 */
const manejarTurno = (atacante, oponente, numAnterior) => {
    const numAtacante = numAnterior === 1 ? 2 : 1; 
    const atacanteActual = numAtacante === 1 ? player1 : player2;
    const oponenteActual = numAtacante === 1 ? player2 : player1;

    // 1. Actualizar el HUD de ambos jugadores
    actualizarHUD(player1, 1);
    actualizarHUD(player2, 2);

    // 2. Comprobar si hay un ganador
    if (oponenteActual.getVida() <= 0) {
        // Deshabilita todos los botones de acción para detener el combate
        document.querySelectorAll('#batalla button').forEach(btn => btn.disabled = true);
        
        // Determina ganador/perdedor para el historial
        const ganador = atacanteActual.getUsername();
        const perdedor = oponenteActual.getUsername();
        
        // 🚨 GUARDA EL RESULTADO EN EL HISTORIAL ANTES DE PREGUNTAR POR REVANCHA
        manejarHistorial.actualizar(ganador, perdedor); 
        
        // CORRECCIÓN PENDIENTE: `getPersonaje()` debe existir en Game.js
        const personajeGanador = atacanteActual.getPersonaje ? atacanteActual.getPersonaje() : 'Personaje';
        
        Swal.fire({
            title: '¡FIN DEL COMBATE!',
            text: `${ganador} (${personajeGanador}) ha ganado la batalla. El historial V/D ha sido actualizado.`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Revancha', 
            cancelButtonText: 'Seleccionar otro personaje', 
            reverseButtons: true,
            backdrop: 'rgba(0, 0, 0, 0.9)',
        }).then((result) => {
            if (result.isConfirmed) {
                reiniciarBatalla();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                reiniciarSeleccion();
            }
        });
        return; 
    }
    
    // 3. Cambiar el turno: Deshabilita los botones del turno anterior, habilita los del turno actual
    const botonesAnterior = document.querySelectorAll(`#batalla .col-md-5`)[numAnterior - 1].querySelectorAll('button');
    const botonesActual = document.querySelectorAll(`#batalla .col-md-5`)[numAtacante - 1].querySelectorAll('button');
    
    botonesAnterior.forEach(btn => btn.disabled = true);
    botonesActual.forEach(btn => btn.disabled = false);
    
    // Re-ejecutar HUD para revalidar el estado de los botones del jugador activo (por si no tiene Ki/Energía)
    actualizarHUD(atacanteActual, numAtacante); 
}


// --- BOTONES ACEPTAR ---

btn_py1.addEventListener("click", () => {
    const user_py1 = document.getElementById("username_py1").value.trim();
    if (user_py1 === "" || personaje1 === "") {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debe ingresar nombre y seleccionar personaje' });
        return;
    }
    
    // Pasamos el nombre del personaje al constructor (Asumimos Game(name, character))
    player1 = new Game(user_py1, personaje1); 
    document.getElementById("username1").innerText = user_py1;
    document.getElementById("nombre_personaje1").innerText = personaje1;
    document.getElementById("img_personaje1").src = `./public/img/${personaje1}/base.png`; 
    actualizarHUD(player1, 1); 

    ocultarSeleccion(1);
    jugador1Aceptado = true;
    mostrarBatalla();
});

btn_py2.addEventListener("click", () => {
    const user_py2 = document.getElementById("username_py2").value.trim();
    if (user_py2 === "" || personaje2 === "") {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debe ingresar nombre y seleccionar personaje' });
        return;
    }

    // Pasamos el nombre del personaje al constructor
    player2 = new Game(user_py2, personaje2); 
    document.getElementById("username2").innerText = user_py2;
    document.getElementById("nombre_personaje2").innerText = personaje2;
    document.getElementById("img_personaje2").src = `./public/img/${personaje2}/base.png`;
    actualizarHUD(player2, 2);

    ocultarSeleccion(2);
    jugador2Aceptado = true;
    mostrarBatalla();
});


// --- ESCUCHADORES DE ACCIÓN DE BATALLA ---

// ATAQUE BÁSICO JUGADOR 1/2
document.getElementById("btn_atk_basico1").addEventListener("click", () => {
    alertaAtk(personaje1,"basico");
    // Se asume que player1.atk_basic devuelve true si el ataque se pudo realizar (tenía recursos)
    if (player1.atk_basic(player2)) manejarTurno(player1, player2, 1);
    else Swal.fire({ icon: 'warning', text: `${player1.getUsername()} no tiene Ki o Energía suficiente para Ataque Básico.` });
}); 

document.getElementById("btn_atk_basico2").addEventListener("click", () => {
    alertaAtk(personaje2,"basico");
    if (player2.atk_basic(player1)) manejarTurno(player2, player1, 2);
    else Swal.fire({ icon: 'warning', text: `${player2.getUsername()} no tiene Ki o Energía suficiente para Ataque Básico.` });
}); 

// ATAQUE ESPECIAL JUGADOR 1/2
document.getElementById("btn_atk_especial1").addEventListener("click", () => {
    alertaAtk(personaje1,"especial");
    if (player1.atk_especial(player2)) manejarTurno(player1, player2, 1);
    else Swal.fire({ icon: 'warning', text: `${player1.getUsername()} no tiene Ki o Energía suficiente para Ataque Especial.` });
}); 

document.getElementById("btn_atk_especial2").addEventListener("click", () => {
    alertaAtk(personaje2,"especial");
    if (player2.atk_especial(player1)) manejarTurno(player2, player1, 2);
    else Swal.fire({ icon: 'warning', text: `${player2.getUsername()} no tiene Ki o Energía suficiente para Ataque Especial.` });
});

// CARGAR KI JUGADOR 1/2
document.getElementById("btn_cargar_ki1").addEventListener("click", () => {
    // La comprobación de kiYEnergiaMax está dentro de actualizarHUD, pero la repetimos para el mensaje
    if (player1.getKi() === Game.MAX_STAT && player1.getEnergia() === Game.MAX_STAT) {
        Swal.fire({ icon: 'warning', text: 'No se puede cargar Ki, ambas barras de Ki y Energía están al 100%.' });
        return;
    }
    
    alertaAtk(personaje1,"ki");
    player1.cargarKi();
    manejarTurno(player1, player2, 1);
});

document.getElementById("btn_cargar_ki2").addEventListener("click", () => {
    if (player2.getKi() === Game.MAX_STAT && player2.getEnergia() === Game.MAX_STAT) {
        Swal.fire({ icon: 'warning', text: 'No se puede cargar Ki, ambas barras de Ki y Energía están al 100%.' });
        return;
    }
    
    alertaAtk(personaje2,"ki");
    player2.cargarKi(); 
    manejarTurno(player2, player1, 2);
});

// SEMILLA JUGADOR 1/2
document.getElementById("btn_semilla1").addEventListener("click", () => {
    const tieneTodoMaximo = player1.getVida() === Game.MAX_STAT && player1.getKi() === Game.MAX_STAT && player1.getEnergia() === Game.MAX_STAT;
    
    if (tieneTodoMaximo) {
        Swal.fire({ icon: 'info', text: 'No se puede usar la semilla porque no hay nada que curar.' });
        return;
    }

    alertaAtk(personaje1,"semilla");
    if (player1.usarSemilla()) {
        Swal.fire({ icon: 'info', text: `🌱 ${player1.getUsername()} ha usado una Semilla del Ermitaño. ¡Vida y recursos restaurados!` });
        manejarTurno(player1, player2, 1); 
    } else {
        Swal.fire({ icon: 'warning', text: `${player1.getUsername()} no tiene Energía para la Semilla o ya tiene Vida Máxima.` });
    }
});

document.getElementById("btn_semilla2").addEventListener("click", () => {
    const tieneTodoMaximo = player2.getVida() === Game.MAX_STAT && player2.getKi() === Game.MAX_STAT && player2.getEnergia() === Game.MAX_STAT;
    
    if (tieneTodoMaximo) {
        Swal.fire({ icon: 'info', text: 'No se puede usar la semilla porque no hay nada que curar.' });
        return;
    }
    
    alertaAtk(personaje2,"semilla");
    if (player2.usarSemilla()) {
        Swal.fire({ icon: 'info', text: `🌱 ${player2.getUsername()} ha usado una Semilla del Ermitaño. ¡Vida y recursos restaurados!` });
        manejarTurno(player2, player1, 2); 
    } else {
        Swal.fire({ icon: 'warning', text: `${player2.getUsername()} no tiene Energía para la Semilla o ya tiene Vida Máxima.` });
    }
});
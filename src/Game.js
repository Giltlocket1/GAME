// Game.js (CON FUNCIONALIDADES DE PERSONAJE Y RESET)

class Game {
    #username;
    #personaje; // Para guardar el nombre del personaje
    #vida;
    #energia; 
    #ki; 
    
    // Costos de recursos y daño base
    static COSTO_ATK_BASIC_ENERGIA = 150;
    static COSTO_ATK_BASIC_KI = 200;
    static DANO_ATK_BASIC = 175;

    static COSTO_ATK_ESPECIAL_ENERGIA = 300;
    static COSTO_ATK_ESPECIAL_KI = 400;
    static DANO_ATK_ESPECIAL = 350;

    static AUMENTO_KI_CARGA = 250;
    static MAX_STAT = 1000;
    
    // Costo de la Semilla
    static COSTO_SEMILLA_ENERGIA = 500; 

    /**
     * Constructor del jugador.
     * @param {string} username Nombre del jugador.
     * @param {string} personaje Nombre del personaje seleccionado.
     */
    constructor(username, personaje) {
        this.#username = username;
        this.#personaje = personaje;
        this.#vida = Game.MAX_STAT; 
        this.#energia = Game.MAX_STAT; 
        this.#ki = Game.MAX_STAT; 
        this.mostrarStats();
    }

    // --- GETTERS ---
    getVida() {
        return this.#vida;
    }
    getEscudo() {
        return 0;
    }
    getEnergia() {
        return this.#energia;
    }
    getKi() {
        return this.#ki;
    }
    getUsername() {
        return this.#username;
    }
    
    /**
     * Devuelve el nombre del personaje.
     */
    getPersonaje() { 
        return this.#personaje;
    }

    // --- MÉTODOS DE UTILIDAD ---

    mostrarStats() {
        console.log(`[${this.getUsername()}] V:${this.getVida()} EN:${this.getEnergia()} KI:${this.getKi()}`);
    }
    
    /**
     * Reinicia todas las estadísticas a MAX_STAT para la Revancha.
     */
    resetStats() {
        this.#vida = Game.MAX_STAT;
        this.#energia = Game.MAX_STAT; 
        this.#ki = Game.MAX_STAT;
        this.mostrarStats();
    }

    // --- LÓGICA DE VIDA (SIN ESCUDO) ---

    /**
     * Decrementa la vida del jugador directamente.
     * @param {number} damage Cantidad de daño recibido.
     * @returns {boolean} True si el jugador ha sido derrotado (Vida <= 0).
     */
    decrementaVida(damage) {
        this.#vida = Math.max(this.#vida - damage, 0); 
        
        console.log(`${this.#username} recibió ${damage} de daño. Vida actual: ${this.#vida}`);
        return this.#vida === 0;
    }

    /**
     * Incrementa el Ki y Energía.
     */
    cargarKi() {
        this.#ki = Math.min(this.#ki + Game.AUMENTO_KI_CARGA, Game.MAX_STAT);
        this.#energia = Math.min(this.#energia + Game.AUMENTO_KI_CARGA, Game.MAX_STAT);
        console.log(`${this.#username} ha cargado Ki y Energía!`);
        return true; 
    }

    /**
     * 🌱 Restaura Vida, Energía y Ki (Semilla del Ermitaño).
     */
    usarSemilla() {
        // Validación: No puede usar si tiene vida MAX o no tiene Energía.
        if (this.#vida === Game.MAX_STAT || this.#energia < Game.COSTO_SEMILLA_ENERGIA) {
            return false; 
        }
        
        this.#energia -= Game.COSTO_SEMILLA_ENERGIA; 
        this.#vida = Game.MAX_STAT;
        this.#ki = Game.MAX_STAT;
        this.#energia = Game.MAX_STAT;
        
        return true;
    }

    // --- MÉTODOS DE ATAQUE ---

    /**
     * Realiza el ataque básico (requiere Energía y Ki).
     */
    atk_basic(opponent) {
        if (this.#energia < Game.COSTO_ATK_BASIC_ENERGIA || this.#ki < Game.COSTO_ATK_BASIC_KI) {
            return false;
        }

        this.#energia -= Game.COSTO_ATK_BASIC_ENERGIA;
        this.#ki -= Game.COSTO_ATK_BASIC_KI;
        
        opponent.decrementaVida(Game.DANO_ATK_BASIC); 
        this.mostrarStats();
        return true;
    }

    /**
     * Realiza el ataque especial (requiere Energía y Ki).
     */
    atk_especial(opponent) {
        if (this.#energia < Game.COSTO_ATK_ESPECIAL_ENERGIA || this.#ki < Game.COSTO_ATK_ESPECIAL_KI) {
            return false;
        }

        this.#energia -= Game.COSTO_ATK_ESPECIAL_ENERGIA;
        this.#ki -= Game.COSTO_ATK_ESPECIAL_KI;
        
        opponent.decrementaVida(Game.DANO_ATK_ESPECIAL); 
        this.mostrarStats();
        return true;
    }
}

export default Game;
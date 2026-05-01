class Sprite {
    constructor({ posicion, image, frames = { max: 1 }, sprites, animate = false, isEnemy = false, scale = 1, name }) {
        this.posicion = posicion;
        this.image = image;
        this.scale = scale;
        this.frames = { ...frames, value: 0, elapsed: 0 };

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.health = 100;
        this.isEnemy = isEnemy;
        this.name = name;
    }

    draw() {
        if (!this.width) return; //metodo de proteccion parque si nocarga a tiempo el witdh de la imagen retorne y no dibuje nada malo

        const columnasTrueno = 5;
        let col = 0;
        let fila = 0;

        if (this.frames.max > columnasTrueno) {
            col = this.frames.value % columnasTrueno;
            fila = Math.floor(this.frames.value / columnasTrueno);
        } else {
            col = this.frames.value;
            fila = 0;
        }

        contexto.save(); 
        contexto.globalAlpha = this.opacity; // Guarga el contexto actual de sus dimensiones  en este punto

        contexto.drawImage( //modificamos el contexto para cambiar las dimensiones 
            this.image,
            col * this.width,
            fila * this.height,
            this.width,
            this.height,
            this.posicion.x,
            this.posicion.y,
            this.width * this.scale,
            this.height * this.scale
        );
        contexto.restore(); // Restaura el contexto a como estaba antes cuando se guardo

        if (!this.animate) return;

        if (this.frames.max > 1) { //esto hace que la animacion con el contador pase frame a frame y se vea el movimiento
            this.frames.elapsed++;
        }

        let framesPorCambio;

        if (this.frames.max > 4) { 
            framesPorCambio = 6;  // si teine mas de 4 frames la imagen ira a una velocidad de 6 frames por cambio, mientras mas alto mas lento y mietnras mas bajo mas rapido                                  
        }
        else {
            if (this.animSpeed) {
                framesPorCambio = this.animSpeed; 
            } else {
                framesPorCambio = 12;
            }
        }

        if (this.frames.elapsed % framesPorCambio === 0) {
            if (this.frames.value < this.frames.max - 1) this.frames.value++;
            else this.frames.value = 0;
        }
    }

    attack(config) { 
        attack(this, config);
    }

    faint() {
        const dialogo = document.querySelector('#dialogoBox');
        dialogo.style.display = 'block';

        if (this.isEnemy) {
            dialogo.innerHTML = this.name + ' ha muerto!<br>¡Has ganado la batalla!';
        } else {
            dialogo.innerHTML = this.name + ' ha muerto!<br>Has perdido la batalla...';
        }

        gsap.to(this.posicion, {
            y: this.posicion.y + 70,
            duration: 1,
            ease: "power1.in"
        });

        gsap.to(this, {
            opacity: 0,               
            duration: 2,
            ease: "power1.out"
        });

        setTimeout(() => {
            finalizarCombate();
        }, 2300);
    }

    
    applyDamage(recipient, attack, healthBar) {
        recipient.health -= attack.damage;
        if (recipient.health < 0) recipient.health = 0;

        gsap.to(healthBar, {
            width: recipient.health + '%'
        });

        if (recipient.health <= 0) {
            recipient.faint();
            return false;
        }
        return true;
    }
}

class Limite {
    static width = 48
    static height = 48

    constructor({ posicion }) {
        this.posicion = posicion;
        this.width = 48;
        this.height = 48;
    }

    draw() {
        contexto.fillStyle = 'rgba(255, 0, 0, 0)'
        contexto.fillRect(this.posicion.x, this.posicion.y, this.width, this.height)
    }
}
import theGame from "./Game";
import MovingObject from "./MovingObject";

export default class Ball extends MovingObject 
{
    isMega = false;
    isStuck = false;     // Est-ce que la balle est collée ?
    stickOffsetx = 0;     // Décalage X par rapport au centre du paddle


    draw() {
        // Sélection de l'image en fonction de l'état
        const currentImage = this.isMega ? theGame.images.megaball : this.image;
            
        theGame.ctx.drawImage(
            currentImage,
            this.position.x,
            this.position.y,
            this.size.width, 
            this.size.height
        );
    }

    update() {
        // Si collée, on ne met pas à jour via la vélocité standard
        // La position est gérée manuellement par le Paddle dans Game.js
        if (this.isStuck) return; 
        
        super.update();
    }
}
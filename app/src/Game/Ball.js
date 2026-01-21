import theGame from "./Game";
import MovingObject from "./MovingObject";

export default class Ball extends MovingObject 
{
    isMega = false;

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
}
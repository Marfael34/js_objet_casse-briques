import theGame from "./Game";
import MovingObject from "./MovingObject";

export default class Ball extends MovingObject {
    isMega = false;
    isStuck = false;     
    stickOffsetx = 0; // x minuscule pour correspondre au moteur de jeu

    draw() {
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
        if (this.isStuck) return; 
        super.update();
    }
}
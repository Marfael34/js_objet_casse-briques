import MovingObject from "./MovingObject";
import theGame from "./Game";

export const BONUS_TYPES = {
    MULTIBALL: 'multiball',
    BIG_PADDLE: 'bigPaddle'
    // Possibilité d'ajouter d'autres types ici : BIG_PADDLE: 'big_paddle', etc.
};

export default class Bonus extends MovingObject {
    type;
    previousKeyFrameStamps;
    frameRate = 1;

    constructor(image, width, height, x, y, type) {
        // Orientation 270 degrés pour aller vers le bas dans ton système
        super( image, width, height, 270, 3);
        this.setPosition(x, y);
        this.type = type;
        console.log(type);
    }

     draw(){
            let sourceX,sourceY;
            
            if (this.type == 'multiball') {
                sourceX = 0;
                sourceY = 0;
            }
            else if (this.type == 'bigPaddle') {
                sourceX = 20;
                sourceY = 0;
            }

            theGame.ctx.drawImage(
                this.image, 
                sourceX,
                sourceY,
                this.size.width,
                this.size.height,
                this.position.x,
                this.position.y,
                this.size.width,
                this.size.height
            );
        }

        updateKeyframe(){
            
            // Toute première keyframe
            if(!this.previousKeyFrameStamps){
                this.previousKeyFrameStamps = theGame.currentLoopStamp;
                return;
            }
            const delta = theGame.currentLoopStamp - this.previousKeyFrameStamps;
            
            
            // Si la frame d'animation de la boucle non correspond pas au framerate voulu on sort
            if(delta < 1000 / this.frameRate) return;
           
            // Sinon on met a jour l'index d'animation
            this.animationIndex ++;
             
            
            if(this.animationIndex > 3)
                this.animationIndex = 0;
            this.previousKeyFrameStamps = theGame.currentLoopStamp;
        }

}
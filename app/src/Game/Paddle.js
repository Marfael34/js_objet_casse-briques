import theGame from "./Game.js";
import MovingObject from "./MovingObject";

export default class Paddle extends MovingObject
{
    equipment;

    // Propriétés pour l'animation
    animationIndex = 0;
    previousKeyFrameStamps;
    frameRate = 1;

    draw(){       
            const sourceY = this.animationIndex * this.size.height;

            theGame.ctx.drawImage(
                this.image, 
                0,
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
            console.log(this)
        }

}
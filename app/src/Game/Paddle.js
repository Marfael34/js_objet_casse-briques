import theGame from "./Game.js";
import MovingObject from "./MovingObject";

export default class Paddle extends MovingObject
{
    equipment;
    isSticky = false;
    // Propriétés pour l'animation
    animationIndex = 0;
    previousKeyFrameStamps;
    frameRate = 1;
    stickyTimer = 0;        // Temps restant pour le bonus global
    autoReleaseTimer = 0; // Temps restant avant le relâchement automatique

    draw(){       
            const sourceY = this.animationIndex * this.size.height;

            theGame.ctx.drawImage(
                this.image, 
                0,
                sourceY,
                100,
                this.size.height,
                this.position.x,
                this.position.y,
                this.size.width,
                this.size.height
            );
        }

        updateKeyframe(){
            if(this.size.height > 20){
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

}
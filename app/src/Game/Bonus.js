import MovingObject from "./MovingObject";
import theGame from "./Game";

export const BONUS_TYPES = {
    MULTIBALL: 'multiball',
    BIG_PADDLE: 'bigPaddle',
    PIERCINGBALL: 'piercingBall',
    STICKYBALL: 'stickyBall'
};

export default class Bonus extends MovingObject {
    type;
    animationIndex = 0;
    previousKeyFrameStamps;
    frameRate = 1;

    constructor(image, width, height, x, y, type) {
        // Orientation 270 degrés pour aller vers le bas dans ton système
        super( image, width, height, 270, 3);
        this.setPosition(x, y);
        this.type = type;
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
            else if (this.type == 'piercingBall'){
                sourceX = 40;
                sourceY = 0;
            }
            else if (this.type == 'stickyBall'){
                sourceX = 60;
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

}
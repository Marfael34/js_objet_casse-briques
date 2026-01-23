import theGame from "./Game.js";
import MovingObject from "./MovingObject";

export default class Paddle extends MovingObject {
    isSticky = false;
    animationIndex = 0;
    previousKeyFrameStamps;
    frameRate = 1;
    stickyTimer = 0;
    autoReleaseTimer = 0;

    draw() {       
        const sourceY = this.animationIndex * this.size.height;
        theGame.ctx.drawImage(
            this.image, 
            0, sourceY, 100, this.size.height,
            this.position.x, this.position.y,
            this.size.width, this.size.height
        );
    }

    updateKeyframe() {
        if (this.size.height > 20) {
            if (!this.previousKeyFrameStamps) {
                this.previousKeyFrameStamps = theGame.currentLoopStamp;
                return;
            }
            const delta = theGame.currentLoopStamp - this.previousKeyFrameStamps;
            if (delta < 1000 / this.frameRate) return;
            this.animationIndex++;
            if (this.animationIndex > 3) this.animationIndex = 0;
            this.previousKeyFrameStamps = theGame.currentLoopStamp;
        }
    }
}
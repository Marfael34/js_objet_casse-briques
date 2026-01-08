import MovingObject from "./MovingObject";

export default class Paddle extends MovingObject
{
    equipment;
    xRange;

    update(){
        super.update();

        // on récupère les limites du paddle
        let bounds = this.getBounds();
        // On la limite la position à l'intérieur de xRange
        if(bounds.left < this.xRange.min){
            this.position.x = this.xRange.min;
        }
        else if(bounds.right > this.xRange.max){
            this.position.x = this.xRange.max;
        }
    }
}
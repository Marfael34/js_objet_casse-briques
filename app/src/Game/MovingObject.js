import CustomMath from "./CustomMath";
import Vector from "./DataType/Vector";
import GameObject from "./GameObject";

export default class MovingObject extends GameObject
{
    speed = 1;
    orientation = 45;
    velocity;

    constructor(image, width, height, orientation, speed) {
        super(image, width, height);

        this.orientation = orientation;
        this.speed = speed;
        this.velocity = new Vector();

    }

    reverseOrientationX(){
        this.orientation = 180 - this.orientation;
    }

    reverseOrientationY(){
        
        this.orientation *= -1;
    }

    update(){

        let radOrientation = CustomMath.degToRad(this.orientation);
        this.velocity.x = this.speed * Math.cos( radOrientation );
        this.velocity.y = this.speed * Math.sin( radOrientation) * -1;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
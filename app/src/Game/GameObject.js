import Bounds from "./DataType/Bounds";
import Size from "./DataType/Size";
import theGame from "./Game";

export default class GameObject 
{
    image;
    position;
    size;

    constructor(image, width, height){
        this.image = image;
        this.size = new Size(width, height);
    }

    getBounds(){
        return new Bounds(
            this.position.y,
            this.position.x + this.size.width,
            this.position.y + this.size.height,
            this.position.x
        )
    }

    draw(){
        theGame.ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.size.width, 
            this.size.height
        );

    }
}
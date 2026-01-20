import theGame from "./Game";
import GameObject from "./GameObject";

export default class Brick extends GameObject
{
    type;
    strength;
    points;
    weapon;

     constructor(image, width, height, strength = 1){
            super( image, width, height);
            this.strength = strength;
            this.type = strength;

            // Distribution aléatoire du bonus (ex: 20% de chance)
            if (Math.random() < 0.5) {
                this.bonus = 'multiball';
            }else if (Math.random() < 0.1){
                this.bonus = 'bigPaddle'
            }
        }

        draw(){
            let sourceX,sourceY;
            
            if (this.type == -1) {
                 sourceX = 50;
                 sourceY = 0;
            } else if( this.type == -2){
                sourceX = 0;
                 sourceY = 0;
            }
            
            else {
                sourceX = (this.size.width * this.type) - this.size.width +100;
                sourceY = (this.size.height * this.strength) - this.size.height;
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
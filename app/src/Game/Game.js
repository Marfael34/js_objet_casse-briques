import '../assets/css/style.css';
// import des assets de sprite
import ballImgsrc from '../assets/img/ball.png';
import paddleImgsrc from '../assets/img/paddle.png';
import brickImgsrc from '../assets/img/brick.png';
import CustomMath from './CustomMath';
import Ball from './Ball';

class Game
{
    // contexte de dessin du canvas
    ctx;
    // Image
    images = {
        ball: null,
        paddle: null,
        brick: null
    }
    // State (un objet qui décrit l'état actuel du jeu, les balles, les briques encore présentes, ect.)
    state = {
        // Balles (plusieurs car possible multiball)
        balls: [],
        // Paddle
        paddle: null
    };


    start(){
        console.log('Jeu démarrer ...');
        // initialisation de l'interface HTML
        this.initHTMLUI();
         // initialisation des images
        this.initImages();
        // initialisation des objet du jeux
        this.initGameObject();
        // lancement de la boucle
        requestAnimationFrame(this.loop.bind(this));
        
    }

    // méthode "privées"
    initHTMLUI(){
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Arkanoïd';

        const elCanvas = document.createElement('canvas');
        elCanvas.width = 800;
        elCanvas.height = 600;

        document.body.append( elH1, elCanvas);

        // on récupération du context de dessin 
        this.ctx = elCanvas.getContext("2d");
    }

    initImages(){
        //Balle
        const imgBall = new Image();
        imgBall.src = ballImgsrc;
        this.images.ball = imgBall;

        // Paddle
        const imgPaddle = new Image();
        imgPaddle.src = paddleImgsrc;
        this.images.paddle = imgPaddle;

        // Brique
        const imgBrick = new Image();
        imgBrick.src = brickImgsrc;
        this.images.brick = imgBrick;
    }

    //Mise en place des objet du jeux sur la scène
    initGameObject(){
        // Balle 
        console.log(this.images)
        const ball = new Ball(this.images.ball, 20, 20, 45, 80);
        ball.setPosition(400, 300);
        this.state.balls.push(ball);
        // Dessin des balles 
        this.state.balls.forEach(theBall => {
            theBall.draw();
        });

    }


    // boucle d'animation
    loop(){ 
        
        

        // on efface tout le canvas
        this.ctx.clearRect(0,0, 800, 600);
        // Dessin des objets 
        this.state.balls.forEach(theBall => {
            theBall.update();
            const bounds = theBall.getBounds();
            // TODO en mieux Détection des collisions 
            // collision avec le côté droit ou gauche de la scène: Inversion du X de la velocité
            if(bounds.right >= 800 || bounds.left <= 0){
                theBall.reverseOrientationX();
            }
            // Collision avec le côté haut ou bas de la scène: Inversion du Y de la velocité 
            if(bounds.bottom >= 600 || bounds.top <=0){
                theBall.reverseOrientationY();
            }
            theBall.draw();
        });
        // Appel de la frame suivante
        requestAnimationFrame(this.loop.bind(this));
    }

    // focntion de test inutile dans le jeux 
    drawtest(){
        this.ctx.fillStyle = '#fc0';
        this.ctx.arc(400, 300, 100, Math.PI/6, -Math.PI / 6);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

const theGame = new Game();

export default theGame;
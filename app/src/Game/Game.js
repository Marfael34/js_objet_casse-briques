import '../assets/css/style.css';
// import des assets de sprite
import ballImgsrc from '../assets/img/ball.png';
import CustomMath from './CustomMath';

class Game
{
    // contexte de dessin du canvas
    ctx;
    ballImg;

    //temporaire: position de base de la balle
    ballX = 400;
    ballY = 300;
    ballSpeed = 10;
    ballAngle = 30;
    ballVelocity = {
            x: this.ballSpeed * Math.cos(CustomMath.degToRad(this.ballAngle)), // trajectoire de la balle avec 30° d'angle (Pi/6)
            y: this.ballSpeed * -1 * Math.sin(CustomMath.degToRad(this.ballAngle)) // -1 pour inverser le repères y (en math, il est dans l'autre sens)
        }

    start(){
        console.log('Jeu démarrer ...');
        // initialisation de l'interface HTML
        this.initHTMLUI();
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

    //Mise en place des objet du jeux sur la scène
    initGameObject(){
         // 1- on créer une balise HTML <img> qui ne sera jamais ajoutée au DOM
        this.ballImg = new Image();

        // 2- on récupère le nom de l'image généré par webpack en tant que src de cette image
        this.ballImg.src = ballImgsrc; 

        // 3- on demande au context de dessin de dessiner cette image dans le canvas
        this.ctx.drawImage(this.ballImg, this.ballX, this.ballY);

    }


    // boucle d'animation
    loop(){ 
       
        // mise a jour de la position de la balle 
        this.ballX += this.ballVelocity.x;
        this.ballY+= this.ballVelocity.y;
        
        // TODO en mieux Détection des collisions 
        // collision avec le côté droit ou gauche de la scène: Inversion du X de la velocité
        if(this.ballX + 20 >= 800 || this.ballX <= 0){
            this.ballVelocity.x *= -1;
        }
        // Collision avec le côté haut ou bas de la scène: Inversion du Y de la velocité 
        if(this.ballY +20 >= 600 || this.ballY <=0){
            this.ballVelocity.y *=-1;
        }

        // -- rendu visuel -- 
        // on efface tout le canvas
        this.ctx.clearRect(0,0, 800, 600);
        // Dessin des objets 
        this.ctx.drawImage(this.ballImg, this.ballX, this.ballY);
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
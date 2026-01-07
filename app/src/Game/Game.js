import '../assets/css/style.css';
// import des assets de sprite
import ballImgsrc from '../assets/img/ball.png';

class Game
{
    // contexte de dessin du canvas
    ctx;

    //temporaire: position de base de la balle
    ballX = 400;
    ballY = 300;

    start(){
        console.log('Jeu démarrer ...');
        this.initHTMLUI();
        requestAnimationFrame(this.loop.bind(this));
        
    }

    // méthode "privées"
    initHTMLUI(){
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Casse brique';

        const elCanvas = document.createElement('canvas');
        elCanvas.width = 800;
        elCanvas.height = 600;

        document.body.append( elH1, elCanvas);

        // on récupération du context de dessin 
        this.ctx = elCanvas.getContext("2d");
    }

    // boucle d'animation
    loop(){
        // tomporaire: dessin de la balle a partir d'une image 
        // 1- on créer une balise HTML <img> qui ne sera jamais ajoutée au DOM
        const ballImg = new Image();

        // 2- on récupère le nom de l'image généré par webpack en tant que src de cette image
        ballImg.src = ballImgsrc; 

        // 3- on demande au context de dessin de dessiner cette image dans le canvas
        ballImg.addEventListener('load', ()=>{
            this.ctx.drawImage(ballImg, this.ballX, this.ballY);

        });
        // mise a jour de la position de la balle 
        this.ballX ++;
        this.ballY --;

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
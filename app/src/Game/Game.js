import '../assets/css/style.css';

class Game
{
    // contexte de dessin du canvas
    ctx;

    start(){
        console.log('Jeu démarrer ...');
        this.initHTMLUI();
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
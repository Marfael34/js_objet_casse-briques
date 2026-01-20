// Import de la feuille de style
import '../assets/css/style.css';
// Import des donner de configuration 
import customConfig from '../config.json';
import levelsConfig from '../levels.json';
// import des assets de sprite
import ballImgsrc from '../assets/img/ball.png';
import paddleImgsrc from '../assets/img/paddle.png';
import brickImgsrc from '../assets/img/brick.png';
import edgeImgsrc from '../assets/img/edge.png';
import bonusImgsrc from  '../assets/img/bonus.png';
import Ball from './Ball';
import GameObject from './GameObject';
import CollisionType from './DataType/CollisionType';
import Paddle from './Paddle.js';
import Brick from './Brick';
import Bonus from './Bonus.js';

class Game
{
    // Config
    config = {
        canvasSize: {
            width: 800,
            height: 600
        },
        ball:{
            radius: 10,
            orientation: 45, 
            speed: 10,
            position: {
                x: 400,
                y: 300
            },
            angleAlteration:30
        },
        bonusBall:{
            speed: 3,
            position: {
                x: 400,
                y:300
            }
        },
        paddleSize: {
            width: 100,
            height: 20
        },
        modal:{
            class: {
                c1:'hidden',
                c2: 'modal-overlay'
            }
        }
    }

    // Données des niveaux
    levels;

    // Contexte de dessin du canvas
    ctx;

    // TimeStamps haute résolution de la boucle d'animation
    currentLoopStamp;

    // Image
    images = {
        ball: null,
        paddle: null,
        brick: null,
        edge: null,
        bonus : null,
    }
    // State (un objet qui décrit l'état actuel du jeu, les balles, les briques encore présentes, ect.)
    state = {
        // Balles (plusieurs car possible multiball)
        balls: [],
        // Briques
        bricks: [],
        // Bordure de la mort 
        deathEdge: null,
        // Bordure a rebon
        bouncingEdge: [],
        // bonus 
        bonus: [],
        // Paddle
        paddle: null,
        //Entrées utilisateur
        userInput: {
            paddelLeft: false,
            paddleRight: false
        },
        score:0,
        hp:3
        
    };

    constructor(customConfig = {}, levelsConfig = [] ){
        Object.assign(this.config, customConfig);
        this.levels = levelsConfig;
        this.currentLevel= 0;

    }

    start(){
        // initialisation de l'interface HTML
        this.initHTMLUI();
         // initialisation des images
        this.initImages();
        // initialisation des objet du jeux
        this.initGameObject();
        // lancement de la boucle
        
        
    }

    // Méthode "privées"
    initHTMLUI(){
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Arkanoïd';

        const elCanvas = document.createElement('canvas');
        elCanvas.width = this.config.canvasSize.width;
        elCanvas.height = this.config.canvasSize.height;

        const elScore = document.createElement('span');
        elScore.textContent = `Score: ${this.state.score}`;
        this.scoreElement = elScore;

        const elHp = document.createElement('span');
        elHp.textContent = `Vie: ${this.state.hp}`;
        this.hpElement = elHp;

        const elStartModal = document.createElement('div');
        elStartModal.setAttribute('id', 'modale-start');
        elStartModal.classList.add(this.config.modal.class.c2);
        elStartModal.innerHTML = `
            <div class="modal">
                <h2> Bienvenue sur Arkanoïd </h2>
                <p> Prêt pour jouer a un jeux complexe et palpitan </p>
                <button class="btn-restart btn-play">Jouer</button>
            </div>
        `;
        elStartModal.querySelector('.btn-play').addEventListener('click', () => {
            elStartModal.classList.add('hidden')
            requestAnimationFrame(this.loop.bind(this));
        });

        const elLoseModal = document.createElement('div');
        elLoseModal.setAttribute('id', 'modale-lose');
        elLoseModal.classList.add(this.config.modal.class.c1);
        elLoseModal.classList.add(this.config.modal.class.c2);
        elLoseModal.innerHTML = `
            <div class="modal">
                <p> Aie c'est foutu !! </p>
                <button class="btn-restart btn-rejouer"">Rejouer</button>
            </div>
        `;
        elLoseModal.querySelector('.btn-rejouer');
        elLoseModal.addEventListener('click', () => this.playAgain());

        const elWinModal = document.createElement('div');
        elWinModal.setAttribute('id', 'modale-win');
        elWinModal.classList.add(this.config.modal.class.c1);
        elWinModal.classList.add(this.config.modal.class.c2);
        elWinModal.innerHTML = `
            <div class="modal">
                <p> Bravo vous avez fini le niveau</p>
                <button class="btn-restart next-btn">Niveaux suivant</button>

            </div>
        `;

        elWinModal.querySelector('.next-btn');
        elWinModal.addEventListener('click',() => this.nextLevel());
        

        document.body.append( elStartModal ,elH1, elScore,elHp, elCanvas, elLoseModal, elWinModal);

        // on récupération du context de dessin 
        this.ctx = elCanvas.getContext("2d");

        // Ecouteur d'évenement du clavier 
        document.addEventListener('keydown', this.handlerKeyboad.bind(this, true));
        document.addEventListener('keyup', this.handlerKeyboad.bind(this, false));
        
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

        // Bordure
        const imgEdge = new Image();
        imgEdge.src = edgeImgsrc;
        this.images.edge = imgEdge;

        // Bonus 
        const imgBonus = new Image();
        imgBonus.src = bonusImgsrc;
        this.images.bonus = imgBonus;
        
    }

    //Mise en place des objet du jeux sur la scène
    initGameObject(){
        // Balle 
        const ballDiamater = this.config.ball.radius * 2
        const ball = new Ball(
            this.images.ball,
            ballDiamater, ballDiamater, 
            this.config.ball.orientation, 
            this.config.ball.speed
        );

        ball.setPosition(
            this.config.ball.position.x, 
            this.config.ball.position.y
        );

        ball.isCircular = true;
        this.state.balls.push(ball);

        // Bordure de la mort 
        const deathEdge = new GameObject(
            this.images.edge, 
            this.config.canvasSize.width, 
            20
        );
        deathEdge.setPosition( 
            0, 
            this.config.canvasSize.height + 30 
        );
        this.state.deathEdge = deathEdge;

        // -- Bordure a rebond
        // Haut
        const edgeTop = new GameObject(
            this.images.edge, 
            this.config.canvasSize.width, 
            20
        );
        edgeTop.setPosition(
            0, 
            0
        );
        // Droite
        const edgeRight = new GameObject(
            this.images.edge, 
            20, 
            this.config.canvasSize.height + 10
        );
        edgeRight.setPosition(
            this.config.canvasSize.width - 20, 
            20
        );
        edgeRight.tag = "RightEdge";
        
        // Gauche
        const edgeLeft = new GameObject(
            this.images.edge, 
            20, 
            this.config.canvasSize.height + 10
        );
        edgeLeft.setPosition(
            0, 
            20
        );
        edgeLeft.tag = "LeftEdge";

        // Ajout dans la liste des bords
        this.state.bouncingEdge.push(
            edgeTop, 
            edgeRight, 
            edgeLeft
        );

        //Paddle
        const paddle = new Paddle(
            this.images.paddle, 
            this.config.paddleSize.width, 
            this.config.paddleSize.height, 
            0, 
            0
        );
        paddle.setPosition(
           (this.config.canvasSize.width / 2) - (this.config.paddleSize.width /2), 
            this.config.canvasSize.height - this.config.paddleSize.height - 20
        );
        this.state.paddle = paddle;

        // Chargement des brique
        this.loadBricks(this.levels.data[this.currentLevel]);

    }

    // Création des briques
    loadBricks(levelArray){
        for(let line = 0; line < levelArray.length; line ++){
            for(let column = 0; column < levelArray[line].length; column ++){
                let brickType = levelArray[line][column];
                // Si la valeur trouver est 0, c'est un espace vide, donc on passe à la colonne suivante 
                if(brickType == 0) continue;

                // Si on a bien une birque, on la créer et on la met dans le state
                const brick = new Brick(
                    this.images.brick, 
                    50, 
                    25,
                    brickType
                );
                brick.setPosition(
                    20 + (50 * column), 
                    20 + (25 * line)
                );

                this.state.bricks.push(brick)

            }
        } 
    }

    // Cycle de vie: 1 - Enntrées Utilisateur
    checkUserInput(){
         // On analyse quel commande de mouvement est demandée pour le paddle
        // Droite
        if( this.state.userInput.paddleRight ){
            this.state.paddle.orientation = 0;
            this.state.paddle.speed = 7;
        }
        // Gauche
        if(this.state.userInput.paddelLeft){
            this.state.paddle.orientation = 180;
            this.state.paddle.speed = 7;
        }
        // Ni droite ni gauche
        if(! this.state.userInput.paddleRight && ! this.state.userInput.paddelLeft){
            this.state.paddle.speed = 0;
        }

        // Mise a jour de la position
        this.state.paddle.update();
    }

   // Cycle de vie: 2 - Collisions et calcules qui en découlent
    checkCollisions(){

         // Collision des balles avec tout les objets
        // on créer un tableau pour stocker les balles non perdues
        const saveBalls = []; 

        this.state.balls.forEach(theBall => {
            

            // Collision de la balle avec le bord de la mort
            if( theBall.getCollisionType(this.state.deathEdge) !== CollisionType.NONE){
                // On enlève la balle du state
                return;
            }

            // On sauvegarde la balle en cours (car si on est la, c'est qu'on a pas tapé le borde de la mort)
            saveBalls.push(theBall);


            // Collision de la balle avec les bords rebondisant
             this.state.bouncingEdge.forEach( theEdge => {
                const collisionType = theBall.getCollisionType( theEdge );

                switch( collisionType ) {
                    case CollisionType.NONE:
                        return;

                    case CollisionType.HORIZONTAL:
                        theBall.reverseOrientationX();
                        break;

                    case CollisionType.VERTICAL:
                        theBall.reverseOrientationY();
                        break;

                    default:
                        break;
                }
            });

            // Collision de la balle avec les briques
            this.state.bricks.forEach(theBrick => {
                const collisionType = theBall.getCollisionType( theBrick );

                switch( collisionType ) {
                    case CollisionType.NONE:
                        return;

                    case CollisionType.HORIZONTAL:
                        theBall.reverseOrientationX();
                        break;

                    case CollisionType.VERTICAL:
                        theBall.reverseOrientationY();
                        break;

                    default:
                        break;
                }

            // ici on a forcément une collision (car la première clause du switch fait un return)
            //  Décrement compteur de resistance de la brique
            if(theBrick.strength !== 0 ){
                theBrick.strength --;
            }

            if (theBrick.strength === 0) {
                this.state.score += theBrick.type * 100; // Ajout du score
                // Si la brique a un bonus, on le fait apparaître
                if (theBrick.bonus) {
                    const ballDiamater = this.config.ball.radius * 2
                    const newBonus = new Bonus(
                        this.images.bonus, // Utilise une image spécifique pour le bonus si dispo
                        ballDiamater, ballDiamater, 
                        theBrick.position.x, theBrick.position.y, 
                        theBrick.bonus
                    );
                    this.state.bonus.push(newBonus);
                }
                this.updateScore(); // Mise à jour de l'affichage
            }
        }); 
        

            // Collision avec le paddle
            const paddleCollisionType = theBall.getCollisionType(this.state.paddle);

                switch( paddleCollisionType ) {

                    case CollisionType.HORIZONTAL:
                        // Altération de l'angle en fonction du mouvement du paddle
                        theBall.reverseOrientationX();                       
                        break;

                    case CollisionType.VERTICAL:
                        let alteration = 0;
                        if(this.state.userInput.paddleRight){
                            alteration = -1 * this.config.ball.angleAlteration;
                        }
                        else if(this.state.userInput.paddelLeft){
                            alteration = this.config.ball.angleAlteration;
                        }
                        theBall.reverseOrientationY(alteration);

                         // Correction pour un résultat de 0 et 180 pour éviter
                        if(theBall.orientation === 0){
                            theBall.orientation = 10;
                        }
                        else if(theBall.orientation === 180){
                            theBall.orientation = 170
                        }
                        break;

                    default:
                        break;
                }
        });

        // Mise a jour du state.balls avec saveBalls
        this.state.balls = saveBalls;

                // Collision du paddle avec les bords
        this.state.bouncingEdge.forEach( theEdge => {
            const collisionType = this.state.paddle.getCollisionType(theEdge);

            // si aucune collision ou autre collision
            if(collisionType !== CollisionType.HORIZONTAL) return;

            // si la collision est horizontale, on arrête la vitesse du paddle
            this.state.paddle.speed = 0;

            // on récupère les limite de  theEdge
            const edgeBounds = theEdge.getBounds();


            // si on a touché la bordure de droite
            if(theEdge.tag === "RightEdge"){
                this.state.paddle.position.x =  edgeBounds.left - 1 - this.state.paddle.size.width;
            }
            // si on a touché la bordure de gauche
            if(theEdge.tag === "LeftEdge"){
                this.state.paddle.position.x =  edgeBounds.right + 1;
            }

            // on remet a jour le paddle
            this.state.paddle.update();
        });  

        const activeBonus = [];
        this.state.bonus.forEach(TheBonus => {
        TheBonus.update(); // Fait tomber le bonus

            const collision = TheBonus.getCollisionType(this.state.paddle);
            
            if (collision !== CollisionType.NONE) {
                // Le paddle a ramassé le bonus
                this.activateBonus(TheBonus.type);
                // On ne l'ajoute pas à activeBonus, il disparaît
            } else if (TheBonus.position.y < this.config.canvasSize.height) {
                // Le bonus est encore à l'écran
                activeBonus.push(TheBonus);
            }
        });
        this.state.bonus = activeBonus;
    }


    // Cycle de vie: 3 - Mise a jours des données des GameObject
    updateObjects(){
        // Balles 
        this.state.balls.forEach( theBall => {
            theBall.update();
        })

        // Briques 
        // on ne conserves dans le state que les briques dont strength est different de 0 
        this.state.bricks = this.state.bricks.filter(theBrick => theBrick.strength !== 0 );

        // Paddle 
        this.state.paddle.updateKeyframe();
    }

    // Cycle de vie: 4 - Rendu graphique des GameObjects
    renderObject(){

        // On efface tout le canvas
        this.ctx.clearRect(
            0,
            0, 
            this.config.canvasSize.width, 
            this.config.canvasSize.height
        );

        // Dessin des bordure à rebond
        this.state.bouncingEdge.forEach(theEdge => {
            theEdge.draw();
        });

        // Dessin des briques
        this.state.bricks.forEach(theBrick =>{
            theBrick.draw();
        });

        // Dessin du paddle
        this.state.paddle.draw();

        // Dessin des balles
        this.state.balls.forEach(theBall => {
            theBall.draw();
        })

        this.state.bonus.forEach(TheBonus => {
            TheBonus.draw();
        });
    }

    // Boucle d'animation
    loop(stamp){
        // Enregistrement du stamp actuel
            this.currentLoopStamp = stamp;
        // Cycle 1
        this.checkUserInput();

        // Cylce 2
        this.checkCollisions();

        // cycle 3
        this.updateObjects();

        // Cycle 4
        this.renderObject();

        //S'il n'y a aucune balle dans saveBalls, on a perd une vie
        if(this.state.balls.length <= 0){
            this.state.hp --;
            this.updateHP();

            if (this.state.hp > 0) {
                // Il reste des vies : on réinitialise la balle
                const ballDiamater = this.config.ball.radius * 2;
                const newBall = new Ball(
                    this.images.ball,
                    ballDiamater, 
                    ballDiamater, 
                    this.config.ball.orientation, 
                    this.config.ball.speed
                );
                newBall.setPosition(
                    this.config.ball.position.x, 
                    this.config.ball.position.y
                );
                newBall.isCircular = true;
                this.state.balls.push(newBall);
                
                // On relance la frame suivante après réinitialisation
                requestAnimationFrame(this.loop.bind(this));
                return;
            } else if(this.state.hp <= 0){
                
                // On récupère l'élément HTML de la modale
                const modal = document.getElementById('modale-lose');
                if (modal) {
                    // On retire la classe 'hidden' pour l'afficher
                    modal.classList.remove('hidden');
                }
                // on sort de loop()
                return;
        }
            
        }

        //S'il n'y a aucune brique dans saveBrique, on a gagner
        if(this.state.bricks.length <= 0){
            // On récupère l'élément HTML de la modale
            const modal = document.getElementById('modale-win');
            if (modal) {
                // On retire la classe 'hidden' pour l'afficher
                modal.classList.remove('hidden');
            }
            // on sort de loop()
            return;
        }

        // Appel de la frame suivante
        requestAnimationFrame(this.loop.bind(this));
    }

    activateBonus(type) {
        if (type === 'multiball') {
            // On prend la première balle existante pour copier ses propriétés
            const referenceBall = this.state.balls[0] || this.config.ball;
            
            // On ajoute deux nouvelles balles avec des angles différents
            [85, 100].forEach(angle => {
                const newBall = new Ball(
                    this.images.ball,
                    this.config.ball.radius * 2,
                    this.config.ball.radius * 2,
                    angle,
                    this.config.ball.speed
                );
                newBall.setPosition(this.state.paddle.position.x, this.config.ball.position.y - 20);
                newBall.isCircular = true;
                this.state.balls.push(newBall);
            });
        }

        if(type === 'bigPaddle'){
            if( this.state.paddle.size.width < 200){
                this.state.paddle.size.width += 50;
                this.state.paddle.update();
            }
            
        }
    }

    // Gestionnaire d'évènement DOM
    handlerKeyboad(isActive, evt){
        
        // flèche droite
        if( evt.key === 'Right' || evt.key === 'ArrowRight' ){
            // Si on souhaite activer "droite" mais que gauche est déjà activé, on déseactive gauche
            if(isActive && this.state.userInput.paddelLeft)
                this.state.userInput.paddelLeft = false;
            
            this.state.userInput.paddleRight = isActive;
        }

        // Flèche gauche
        else if(evt.key === 'Left' ||evt.key === 'ArrowLeft'){
            // Si on souhaite activer "gauche" mais que droite est déjà activé, on déseactive droite
            if(isActive && this.state.userInput.paddleRight)
                this.state.userInput.paddleRight = false;

            this.state.userInput.paddelLeft = isActive;

        }

    }

    // Pour passer au niveaux suivant
    nextLevel() {
        // Masquer la modale de victoire
        const modal = document.getElementById('modale-win');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Passer au niveau suivant s'il existe
        if (this.currentLevel < this.levels.data.length - 1) {
            this.currentLevel ++;
            
            
        } else {
            // Optionnel : Revenir au premier niveau ou afficher un message de fin
            this.currentLevel = 0;
            
        }

        this.state.balls = [];
        this.state.bricks = [];
        this.state.bouncingEdge = [];
        this.state.bonus = [];
        

        this.initGameObject();
        requestAnimationFrame(this.loop.bind(this));  
    }

    // Rejouer
    playAgain(){
        // Masquer la modale de victoire
        const modal = document.getElementById('modale-lose');
        if (modal) {
            modal.classList.add('hidden');
        }

        this.state.hp = 3;
        this.state.score = 0;
        this.updateHP();
        this.updateScore();

        this.state.balls = [];
        this.state.bricks = [];
        this.state.bouncingEdge = [];
        this.state.bonus = [];
        

        this.initGameObject();
        requestAnimationFrame(this.loop.bind(this));  
    }

     //  une méthode pour mettre à jour le score
    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${this.state.score}`; 
        }
    }

    // une méthode pour mettre à jour la vie
    updateHP() {
        if (this.hpElement) {
            this.hpElement.textContent = `Vie: ${this.state.hp}`;
        }
    }
}


const theGame = new Game(customConfig, levelsConfig);

export default theGame;
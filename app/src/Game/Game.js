import '../assets/css/style.css';
// Import des donner de configuration 
import customConfig from '../config.json';
import levelsConfig from '../levels.json';
// import des assets de sprite
import ballImgsrc from '../assets/img/ball.png';
import paddleImgsrc from '../assets/img/paddle.png';
import brickImgsrc from '../assets/img/brick.png';
import edgeImgsrc from '../assets/img/edge.png';
import Ball from './Ball';
import GameObject from './GameObject';
import CollisionType from './DataType/CollisionType';
import Paddle from './Paddle';
import Brick from './Brick';

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
        paddleSize: {
            width: 100,
            height: 20
        }

    }

    // Données des niveaux
    levels;

    // Contexte de dessin du canvas
    ctx;
    // Image
    images = {
        ball: null,
        paddle: null,
        brick: null,
        edge: null
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
        // Paddle
        paddle: null,
        //Entrées utilisateur
        userInput: {
            paddelLeft: false,
            paddleRight: false
        }
    };

    constructor(customConfig = {}, levelsConfig = [] ){
        Object.assign(this.config, customConfig);

        this.levels = levelsConfig;

    }

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

    // Méthode "privées"
    initHTMLUI(){
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Arkanoïd';

        const elCanvas = document.createElement('canvas');
        elCanvas.width = this.config.canvasSize.width;
        elCanvas.height = this.config.canvasSize.height;

        document.body.append( elH1, elCanvas);

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
    }

    //Mise en place des objet du jeux sur la scène
    initGameObject(){
        // Balle 
        const ballDiamater = this.config.ball.radius * 2
        console.log(this.images)
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

        this.state.balls.push(ball);
        console.log(ball)

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
        // TODO on le dessine ou pas ?

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
        this.loadBricks(this.levels.data[0]);

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
        } console.log(this.state)
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
            theBrick.strength --;
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


    }

    // Boucle d'animation
    loop(){ 
        
        // Cycle 1
        this.checkUserInput();

        // Cylce 2
        this.checkCollisions();

        // cycle 3
        this.updateObjects();

        // Cycle 4
        this.renderObject();

        
        
        //S'il n'y a aucune balle dans saveBalls, on a perdu
        if(this.state.balls.length <= 0){
            console.log("Aie c'est foutu !!");
            // on sort de loop()
            return;
        }

        // Appel de la frame suivante
        requestAnimationFrame(this.loop.bind(this));
    }

    // focntion de test inutile dans le jeux 
    drawtest(){
        this.ctx.fillStyle = 'rgb(18, 165, 72)';
        this.ctx.arc(400, 300, 100, Math.PI/6, -Math.PI / 6);
        this.ctx.closePath();
        this.ctx.fill();
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
}

const theGame = new Game(customConfig, levelsConfig);

export default theGame;
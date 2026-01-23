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
import megaBallImgsrc from '../assets/img/megaBall.png';
//autre import
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
        megaball: null,
    };

    players = {
            1:{ score: 0, hp:3, level:1, currentScore:0},
            2:{ score: 0, hp:3, level:1, currentScore:0}
            
    };
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
        stickyMode: false,
        //Entrées utilisateur
        userInput: {
            paddelLeft: false,
            paddleRight: false,
            launch: false
        },
        score:0,
        currentScore: 0,
        hp:3, 
        level:1,
        currentPlayer: 1,
        playerMode: null,
    };

    constructor(customConfig = {}, levelsConfig = [] ){
        Object.assign(this.config, customConfig);
        this.levels = levelsConfig;
        this.currentLevel= 0;
        this.stickyTimeout = null;
        this.releaseTimeout = null;

    }

    start(){
        // initialisation de l'interface HTML
        this.initHTMLUI();
         // initialisation des images
        this.initImages();
        // initialisation des objet du jeux
        this.initGameObject();
    }

    // Méthode "privées"
    initHTMLUI(){
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Arkanoïd';

        const elCanvas = document.createElement('canvas');
        elCanvas.width = this.config.canvasSize.width;
        elCanvas.height = this.config.canvasSize.height;

        const elHeader = document.createElement('div');
        elHeader.innerHTML = `
            <span id="ui-level">Niveau: ${this.state.level}</span>
            <span id="ui-score">Score: ${this.state.score}</span> 
            <span id="ui-hp">Vies: ${this.state.hp}</span> 
        `;
        
        // On stocke les références directes aux spans pour la mise à jour
        this.uiLevel = elHeader.querySelector('#ui-level');
        this.uiScore = elHeader.querySelector('#ui-score');
        this.uiHp = elHeader.querySelector('#ui-hp');

        // Modale choix nb joueur
        const elNbPlayer = document.createElement('div');
        elNbPlayer.setAttribute('id', 'modale-nbplayer');
        elNbPlayer.classList.add('modal-overlay');
        elNbPlayer.innerHTML = `
            <div class="modal">
                <h2> Bienvenue sur Arkanoïd </h2>
                <p> Choisissez le nombre de joueurs </p>
                <button class="btn solo-btn">Solo</button>
                <button class="btn duo-btn"> Duo </button>
            </div>
        `;
        // bounton pour jouer en solo
        elNbPlayer.querySelector('.solo-btn').addEventListener('click', () => {
            this.state.playerMode = 'Solo';
            elModeDisplay.textContent =  `Mode sélectionné: ${this.state.playerMode}`
            elNbPlayer.classList.add('hidden');
            elStartModal.classList.remove('hidden')

        });
        // bounton pour jouer en duo
        elNbPlayer.querySelector('.duo-btn').addEventListener('click', () => {
            this.state.playerMode = 'Duo';
            elModeDisplay2.textContent =  `Mode sélectionné: ${this.state.playerMode}`
            elNbPlayer.classList.add('hidden');
            elStartModalDuo.classList.remove('hidden');
            this.state.hp = this.players[this.state.currentPlayer].hp;
            this.state.currentLevel = 0;
            
        });

        // Modale start/home solo
        const maxLevels = this.levels.data.length;
        const elStartModal = document.createElement('div');
        elStartModal.setAttribute('id', 'modale-start');
        elStartModal.classList.add('hidden');
        elStartModal.classList.add('modal-overlay');
        elStartModal.innerHTML = `
            <div class="modal">
                <h2> Bienvenue sur Arkanoïd </h2>
                <p id="display-player-mode""></p>
                <label id="label-select" for="level-select">Choisir un niveau :</label>
                <select id="level-select" class="level-select">
                    ${Array.from({ length: maxLevels }, (_, i) =>
                        `<option value="${i+1}">Niveau ${i + 1}</option>`
                    ).join('')}
                </select>
                <button class="btn btn-play">Jouer</button>
                <button class="btn btn-nbplayer">Nb joueur</button>
            </div>
        `;      
        const elModeDisplay = elStartModal.querySelector('#display-player-mode'); // Référence au texte
        // ecouteure de click 
        elStartModal.querySelector('.btn-play').addEventListener('click', () => {  

            const selectedLevel = parseInt(elStartModal.querySelector('#level-select').value);
            const maxLevels = this.levels.data.length;
            const safeLevel = Math.min(Math.max(selectedLevel, 1), maxLevels);
            // Mise à jour du niveau
            this.state.level = safeLevel;
            this.currentLevel = safeLevel - 1;
   
            // Réinitialisation des objets pour le niveau choisi
            this.state.balls = [];
            this.state.bricks = [];
            this.state.bouncingEdge = [];
            this.state.bonus = [];

            this.initGameObject();
            this.updateHeader();

            elStartModal.classList.add('hidden')
            requestAnimationFrame(this.loop.bind(this));
        });
        elStartModal.querySelector('.btn-nbplayer').addEventListener('click', () => {
            elStartModal.classList.add('hidden');
            elNbPlayer.classList.remove('hidden');
        })

        // Modale start/home duo
        const elStartModalDuo = document.createElement('div');
        elStartModalDuo.setAttribute('id', 'modale-start');
        elStartModalDuo.classList.add('hidden');
        elStartModalDuo.classList.add('modal-overlay');
        elStartModalDuo.innerHTML = `
            <div class="modal">
                <h2> Bienvenue sur Arkanoïd </h2>
                <p id="display-player-mode""></p>
                <button id="btn-play-duo" class="btn btn-play">Jouer</button>
                <button id="btn-nbplayer-duo" class="btn btn-nbplayer">Nb joueur</button>
            </div>
        `;
        const elModeDisplay2 = elStartModalDuo.querySelector('#display-player-mode');
        elStartModalDuo.querySelector('#btn-play-duo').addEventListener('click', () => {  
            this.state.level = 1;
            this.initGameObject();
            this.updateHeader();

            elStartModalDuo.classList.add('hidden')
            requestAnimationFrame(this.loop.bind(this));
        });
        elStartModalDuo.querySelector('#btn-nbplayer-duo').addEventListener('click', () => {
            elStartModalDuo.classList.add('hidden');
            elNbPlayer.classList.remove('hidden');
        })

        // Modale lose
        const elLoseModal = document.createElement('div');
        elLoseModal.setAttribute('id', 'modale-lose');
        elLoseModal.classList.add('hidden');
        elLoseModal.classList.add('modal-overlay');
        elLoseModal.innerHTML = `
            <div class="modal">
                <p> Vous avez Perdu !! </p>
                <button class="btn btn-rejouer">Rejouer</button>
                <button class="btn btn-home"> Acceuil </button>
            </div>
        `;
        // ecouteure de click 
        elLoseModal.querySelector('.btn-rejouer').addEventListener('click', () => this.playAgain());
        elLoseModal.querySelector('.btn-home').addEventListener('click', () => {
            elLoseModal.classList.add('hidden');
            elStartModal.classList.remove('hidden');
            this.resetGameState();
        });
        // Modale win
        const elWinModal = document.createElement('div');
        elWinModal.setAttribute('id', 'modale-win');
        elWinModal.classList.add('hidden');
        elWinModal.classList.add('modal-overlay');
        elWinModal.innerHTML = `
            <div class="modal">
                <p> Bravo vous avez fini le niveau</p>
                <button class="btn next-btn">Niveaux suivant</button>
                <button class="btn btn-home"> Acceuil </button>
            </div>
        `;
        // ecouter de click
        elWinModal.querySelector('.next-btn').addEventListener('click', () => this.nextLevel());
        elWinModal.querySelector('.btn-home').addEventListener('click', () => {
            elWinModal.classList.add('hidden');
            elStartModal.classList.remove('hidden');
            this.resetGameState();
        });
        

        document.body.append( elNbPlayer,elStartModalDuo, elStartModal ,elH1,elHeader, elCanvas, elLoseModal, elWinModal);

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
         
        // MEGABALL 
        const imgMegaBall = new Image();
        imgMegaBall.src = megaBallImgsrc;
        this.images.megaball = imgMegaBall;
        
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
    loadBricks(levelArray) {

    // ✅ sécurité : si le niveau n'existe pas
    if (!levelArray || !Array.isArray(levelArray)) {
        console.error("❌ Niveau invalide :", levelArray);
        console.warn("⚠️ Retour au niveau 1");
        levelArray = this.levels.data[0]; // fallback niveau 1
        this.currentLevel = 0;
        this.state.level = 1;
    }

    for (let line = 0; line < levelArray.length; line++) {
        for (let column = 0; column < levelArray[line].length; column++) {

            let brickType = levelArray[line][column];

            if (brickType == 0) continue;

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

            this.state.bricks.push(brick);
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

        this.state.balls.forEach(ball => {
            if (ball.isStuck) {
                // On cale la position X sur celle du paddle + l'offset enregistré au moment de l'impact
                ball.position.x = this.state.paddle.position.x + ball.stickOffsetx;
                
                // On s'assure que Y reste juste au-dessus du paddle (cas où le paddle changerait de taille)
                ball.position.y = this.state.paddle.position.y - ball.size.height;
            }
        });

        // B. Si le joueur appuie sur "Haut", on relâche les balles
        if (this.state.userInput.launch) {
            this.releaseStickyBalls();
        }
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

                // Si pas de collision standard ET pas une Mega Ball qui traverse, on ignore
                if (collisionType === CollisionType.NONE) {
                    return;
                }

                // Gestion du rebond et de la destruction de brique
                if (theBall.isMega) {
                    // La Mega Ball détruit directement la brique sans rebondir
                    theBrick.strength = 0; 
                } else {
                    // Comportement standard : rebond
                    switch( collisionType ) {
                        case CollisionType.HORIZONTAL:
                            theBall.reverseOrientationX();
                            break;
                        case CollisionType.VERTICAL:
                            theBall.reverseOrientationY();
                            break;
                    }

                    // Décrémentation normale de la résistance
                    if(this.isMega == true){
                        theBrick.onDestroy();
                    }
                    if(theBrick.strength !== 0 ){
                        theBrick.strength --;
                    }


                }

                // Gestion du score et des bonus (accessible même en mode Mega)
                if (theBrick.strength === 0) {
                    this.state.score += theBrick.type * 100; // Ajout du score
                    this.state.currentScore += theBrick.type *100
                    
                    if (theBrick.bonus) {
                        const ballDiamater = this.config.ball.radius * 2
                        const newBonus = new Bonus(
                            this.images.bonus, 
                            ballDiamater, ballDiamater, 
                            theBrick.position.x, theBrick.position.y, 
                            theBrick.bonus
                        );
                        this.state.bonus.push(newBonus);
                    }
                    this.updateHeader(); // Mise à jour de l'affichage
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

                        if (this.state.paddle.isSticky && !theBall.isStuck) {
                            theBall.isStuck = true;

                            theBall.stickOffsetx = theBall.position.x - this.state.paddle.position.x;

                            theBall.position.y = this.state.paddle.position.y - theBall.size.height;
                            
                            // On déclenche le compte à rebours de relâchement (5s)
                            this.state.paddle.autoReleaseTimer = 5000;


                        }
                    
                    if (!theBall.isStuck) {
                        
                        // Comportement standard (Code existant)
                        let alteration = 0;
                        if(this.state.userInput.paddleRight){
                            alteration = -1 * this.config.ball.angleAlteration;
                        }
                        else if(this.state.userInput.paddelLeft){
                            alteration = this.config.ball.angleAlteration;
                        }
                        theBall.reverseOrientationY(alteration);
                        // ... (Correction 0 et 180 existante)
                    }
                    break;

                        // si pas de bonus
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
            TheBonus.update(); 
            const collision = TheBonus.getCollisionType(this.state.paddle);
            
            if (collision !== CollisionType.NONE) {
                this.activateBonus(TheBonus.type);        
            } else if (TheBonus.position.y < this.config.canvasSize.height) {
                // Le bonus est conservé tant qu'il n'a pas dépassé le bas du canvas
                activeBonus.push(TheBonus);
            }
        });
        this.state.bonus = activeBonus;
    }

    // Cycle de vie: 3 - Mise a jours des données des GameObject
    updateObjects(){

        // Calcul du temps écoulé (approximatif pour 60fps : 16.6ms, ou calculé via stamp)
        const deltaTime = 1000 / 60; 

        const paddle = this.state.paddle;

        // 1. Gestion de la fin du bonus Sticky si pas de contact
        if (paddle.isSticky) {
            paddle.stickyTimer -= deltaTime;
            if (paddle.stickyTimer <= 0) {
                paddle.isSticky = false;
                paddle.stickyTimer = 0;
            }
        }

        // 2. Gestion du relâchement automatique
        // On vérifie si au moins une balle est collée
        const hasStuckBall = this.state.balls.some(b => b.isStuck);
        if (hasStuckBall) {
            paddle.autoReleaseTimer -= deltaTime;
            if (paddle.autoReleaseTimer <= 0) {
                this.releaseStickyBalls();
                paddle.autoReleaseTimer = 0;
            }
        }

        // Balles 
        this.state.balls.forEach( theBall => {
            if (theBall.isStuck) {
                theBall.position.x = this.state.paddle.position.x + theBall.stickyOffsetX
                // Si la balle est collée, elle suit le paddle
                theBall.position.x = this.state.paddle.position.x + theBall.stickyOffsetX;
                // On la place juste au-dessus du paddle
                theBall.position.y = this.state.paddle.position.y - theBall.size.height;
            } else {
                // Sinon elle bouge normalement
                theBall.update();
            }
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
        if (this.state.balls.length <= 0) {
            if (this.state.playerMode === 'Duo') {
            this.state.hp--; // Le joueur actuel perd une vie
            this.updateHeader();
                if (this.state.hp > 0) {
                    this.switchPlayer();
                    requestAnimationFrame(this.loop.bind(this));
                    return;
                } else {
                    // Joueur éliminé, on vérifie si l'autre peut encore jouer
                    const otherId = (this.state.currentPlayer === 1) ? 2 : 1;
                    if (this.players[otherId].hp > 0) {
                        this.switchPlayer();
                        requestAnimationFrame(this.loop.bind(this));
                        return;
                    } else {
                        document.getElementById('modale-lose').classList.remove('hidden');
                        return;
                    }
                }
            }

            if(this.state.playerMode === 'Solo'){
                this.state.hp --;
                this.state.stickyMode = false;
                this.updateHeader();
            

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
            
        }

        // On vérifie s'il reste au moins une brique cassable (strength > 0)
        const breakableBricks = this.state.bricks.filter(theBrick => theBrick.strength > 0);

        if (breakableBricks.length <= 0) {
            // On récupère l'élément HTML de la modale de victoire
            const modal = document.getElementById('modale-win');
            if (modal) {
                modal.classList.remove('hidden');
            }
            // On arrête la boucle
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

        if( type === 'piercingBall'){
            this.state.balls.forEach(ball => {
                ball.isMega = true;
            });
            
            // Optionnel : Désactivation après 10 secondes
            setTimeout(() => {
                this.state.balls.forEach(ball => ball.isMega = false);
            }, 10000);
        }

        if (type === 'stickyBall') {
            this.state.paddle.isSticky = true;
            // On donne 10 secondes de "vie" au bonus
            this.state.paddle.stickyTimer = 10000; 
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
        else if(evt.key === 'Left' || evt.key === 'ArrowLeft'){
            // Si on souhaite activer "gauche" mais que droite est déjà activé, on déseactive droite
            if(isActive && this.state.userInput.paddleRight)
                this.state.userInput.paddleRight = false;

            this.state.userInput.paddelLeft = isActive;

        }

        if (evt.key === 'ArrowUp' || evt.key === ' ') {
            this.state.userInput.launch = isActive;
        }
        

    }

    // Pour passer au niveaux suivant
    nextLevel() {
        const modal = document.getElementById('modale-win');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        if (this.currentLevel < this.levels.data.length - 1) {
            this.currentLevel++;
            this.state.level++; // Incrémente le numéro du niveau affiché
        } else {
            this.currentLevel = 0;
            this.state.level = 1;
        }

        this.state.currentScore = 0
        this.state.balls = [];
        this.state.bricks = [];
        this.state.bouncingEdge = [];
        this.state.bonus = [];
        
        this.updateHeader(); // Met à jour l'affichage (Niveau et Score)
        this.initGameObject();
        requestAnimationFrame(this.loop.bind(this));  
    }

    // Rejouer
    playAgain() {
        const modal = document.getElementById('modale-lose');
        if (modal) {
            modal.classList.add('hidden');
        }

        this.state.hp = 3;
        this.state.score -= this.state.currentScore;
        this.state.currentScore = 0;
        this.currentLevel = this.state.level -1; // Index du tableau de niveaux

        if (this.state.playerMode === 'Duo') {
            this.state.currentPlayer = 1; // On remet le tour au joueur 1
            
            this.players[1] = { score: 0, hp: 3, currentScore: 0 };
            this.players[2] = { score: 0, hp: 3, currentScore: 0 };
        }
    
        this.updateHeader(); // Rafraîchit l'UI

        this.state.balls = [];
        this.state.bricks = [];
        this.state.bouncingEdge = [];
        this.state.bonus = [];
        
        this.initGameObject();
        requestAnimationFrame(this.loop.bind(this));  
    }

    //  une méthode pour mettre à jour le header (score, vie et niveaux)
    updateHeader() {
        const prefix = this.state.playerMode === 'Duo' ? `J${this.state.currentPlayer} - ` : '';
        
        if (this.uiScore) this.uiScore.textContent = `${prefix}Score: ${this.state.score}`;
        if (this.uiHp) this.uiHp.textContent = `${prefix}Vies: ${this.state.hp}`;
        if (this.uiLevel) this.uiLevel.textContent = `Niveau: ${this.state.level}`;
    }

    switchPlayer() {
        if (this.state.playerMode !== 'Duo') return;

        // 1. On soustrait les points accumulés durant cette tentative
        // pour que le joueur recommence à son score initial au prochain tour.
        this.state.score -= this.state.currentScore;

        // 2. Sauvegarde des données du joueur qui vient de perdre sa balle
        // On remet le currentScore à 0 pour sa prochaine session.
        this.players[this.state.currentPlayer] = {
            score: this.state.score,
            currentScore: 0, 
            hp: this.state.hp,
            level: this.state.level,
            currentLevel: this.currentLevel
        };

        // 3. Bascule vers l'autre joueur (1 -> 2 ou 2 -> 1)
        this.state.currentPlayer = (this.state.currentPlayer === 1) ? 2 : 1;

        // 4. Chargement des données du nouveau joueur
        const nextPlayer = this.players[this.state.currentPlayer];
        this.state.score = nextPlayer.score;
        this.state.currentScore = nextPlayer.currentScore;
        this.state.hp = nextPlayer.hp;
        this.state.level = nextPlayer.level;
        this.currentLevel = nextPlayer.level - 1;

        // 5. Réinitialisation du plateau de jeu pour le nouveau joueur
        this.state.balls = [];
        this.state.bricks = [];
        this.state.bonus = [];
        this.state.bouncingEdge = [];
        
        this.initGameObject();
        this.updateHeader();
        
        alert(`Au tour du Joueur ${this.state.currentPlayer} !`);
    }

    resetGameState() {
        this.ctx.clearRect(
                0,
                0, 
                this.config.canvasSize.width, 
                this.config.canvasSize.height
            );
        this.state.hp = 3;
        this.state.score = 0;
        this.state.currentScore = 0;
        this.state.level = 1;
        this.currentLevel = 0;
        this.state.balls = [];
        this.state.bricks = [];
        this.state.bouncingEdge = [];
        this.state.bonus = [];
        this.updateHeader();
        this.initGameObject(); // Prépare les objets sans lancer la boucle
    }

    // Dans src/Game/Game.js

    // Dans src/Game/Game.js

    releaseStickyBalls() {
        let released = false;
        this.state.balls.forEach(ball => {
            if (ball.isStuck) {
                ball.isStuck = false;
                
                // 1. On donne une petite impulsion vers le haut pour l'éloigner du paddle
                // On déplace la balle de 10 pixels supplémentaires vers le haut (Y diminue)
                ball.position.y -= 10;

                // 2. Calcul de l'angle de lancer
                let alteration = 0;
                if(this.state.userInput.paddleRight) alteration = -1 * this.config.ball.angleAlteration;
                else if(this.state.userInput.paddelLeft) alteration = this.config.ball.angleAlteration;
                    
                // On force l'orientation vers le haut (90°) puis on applique l'inversion/altération
                ball.orientation = 90;
                ball.reverseOrientationY(alteration);
                    
                released = true;
            }
        });
            
        // Désactiver le mode sticky du paddle une fois les balles relâchées
        this.state.paddle.isSticky = false;
    }

}

const theGame = new Game(customConfig, levelsConfig);

export default theGame;
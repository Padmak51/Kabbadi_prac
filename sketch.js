var redPlr,yellowPlr;
var db;
var redPlrAni,yellowPlrAni;
var cnv;
var redPlrPos, yellowPlrPos;
var plrTurn;
var gameState=0;
var redScore=0;
var yelloScore=0;
var btnReset;
var winningPlr;

function preload(){
    redPlrAni = loadAnimation("assests/player1a.png","assests/player1b.png","assests/player1a.png");
    yellowPlrAni = loadAnimation("assests/player2a.png","assests/player2b.png","assests/player2a.png");
}

function setup(){
  cnv = createCanvas(windowWidth-150,windowHeight-100);
  //Centering the canvas
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);

  db = firebase.database(); 

  //Red Player
  redPlr = createSprite(width/4,height/2,10,10);
  redPlr.shapeColor = "red";
  redPlr.addAnimation("redMoving",redPlrAni);
  redPlr.scale = 0.5
  redPlr.setCollider("circle", 0,0,40)
  redPlr.debug = true;

  //Yellow Player
  yellowPlr = createSprite(width/4 + width/2,height/2,10,10);
  yellowPlr.shapeColor = "green";
  yellowPlr.addAnimation("yellowMoving",yellowPlrAni);
  yellowPlr.scale = -0.5
  yellowPlr.setCollider("circle", 0,0,40)
  yellowPlr.debug = true;

 // if(redPlrPos !=null && yellowPlrPos != null )
 // {
    var redPlrPosRef = db.ref('players/redPlayer');
    redPlrPosRef.on("value", readPositionRed, showError);

    var yellowPlrPosRef = db.ref('players/yellowPlayer');
    yellowPlrPosRef.on("value", readPositionYellow, showError);
 // }
 /* else{
    writePositionRed(width/4,height/2);
    writePositionYellow(width/4 + width/2,height/2);
  }*/

  getGameState();
  
  btnReset = createButton('RE-START');
  btnReset.position(width/2+45, 20);
  
}

function draw(){
    background(rgb(180,180,180));
    drawLine(width/2,"black"); //Center Line
    drawLine(width/4,"red");
    drawLine(width/4 + width/2 ,"yellow");

    btnReset.mousePressed(resetGame);
    push();
    textSize(15);
    stroke("orange");
    strokeWeight(1);
    fill("red");
    text("RED Score : "+redScore,width/4+10,50);
    pop();  

    push();
    textSize(15);
    stroke("orange");
    strokeWeight(2);
    fill("yellow");
    text("YELLOW Score : "+yelloScore,width/2+70,50);
    pop()
    //WAITING state
    if(gameState == 0){
      textSize(20)
     fill("red")
      text("Press space to start!!",width/2-90,100);

      if(keyDown("space")){
        getTurn();
        if(plrTurn != undefined || plrTurn !=null){
          alert("Player " + plrTurn +"'s Turn");
          updateGameState(1); //Start Playing
        }       
      }
    }
    
    //PLAY state
    if(gameState === 1){
      if(plrTurn === "RED")
      {
        console.log("MOVE RED");
        //Move Red Player in all directions
        if(keyDown(LEFT_ARROW)){
          writePositionRed(-5,0);
        }
        else if(keyDown(RIGHT_ARROW)){
          writePositionRed(5,0);
        }
        else if(keyDown(UP_ARROW)){
          writePositionRed(0,-5);
        }
        else if(keyDown(DOWN_ARROW)){
          writePositionRed(0,5);
        }

        //Move yellow player sideways only
        if(keyDown("W")){
          writePositionYellow(0,-5);
        }
        else if(keyDown("S")){
          writePositionYellow(0,5);
        }

        if(redPlr.isTouching(yellowPlr)){
          yelloScore += 1;
          winningPlr = "YELLOW";
          updateGameState(2);
          updateWinner(winningPlr);
        }
        else if(redPlr.x > width/4+width/2){
          redScore += 1;
          winningPlr = "RED";
          updateGameState(2);
          updateWinner(winningPlr);
        }
      }

      if(plrTurn === "YELLOW")
      {
        console.log("MOVE YELLOW");
        //Move Yellow Player in all directions
        if(keyDown("A")){
          writePositionYellow(-5,0);
        }
        else if(keyDown("D")){
          writePositionYellow(5,0);
        }
        else if(keyDown("W")){
          writePositionYellow(0,-5);
        }
        else if(keyDown("S")){
          writePositionYellow(0,5);
        }

        //Move yellow player sideways only
        if(keyDown(UP_ARROW)){
          writePositionRed(0,-5);
        }
        else if(keyDown(DOWN_ARROW)){
          writePositionRed(0,5);
        }

        if(redPlr.isTouching(yellowPlr)){
          redScore += 1;
          winningPlr = "RED";
          updateGameState(2);
          updateWinner(winningPlr);
        }
        else if (yellowPlr.x < width/4){
        
          yelloScore += 1;
          winningPlr = "YELLOW";
          updateGameState(2);
          updateWinner(winningPlr);
        }
      }
    }
    
    //Game END state
    if(gameState === 2){
      console.log("GAME END!!");
      console.log(winningPlr);
      if(winningPlr!=undefined || winningPlr != null){
        push();
        //fill(0,150,150,Math.round(random(20,70)));
        textSize(25);
        strokeWeight(4);
        stroke("Red");
        fill("Yellow");
        text("Congratulation "+winningPlr+ " player!!",width/2-150,100);
        pop();
      }
    }


    drawSprites();
}

function resetGame(){
  db.ref('/').update({
    gameState : 0,
    playerTurn : plrTurn == "RED"?plrTurn = "YELLOW" : plrTurn = "RED",
    players : null
  })
  redPlr.destroy();
  yellowPlr.destroy();
  redScore = 0;
  yelloScore = 0;
  setup();
  //writePositionRed(width/4,height/2);
  //writePositionYellow(width/4 + width/2,height/2);
}

function drawLine(x,color){
    push();
    stroke(color);
    strokeWeight(4);
    for(var y = 0; y<height; y=y+20){
      line (x,y,x,y+10);
    }
    pop();
}

function readPositionRed(data){
   redPlrPos = data.val();

   redPlr.x = redPlrPos.posX;
   redPlr.y = redPlrPos.posY;
}

function readPositionYellow(data){
  yellowPlrPos = data.val();

  yellowPlr.x = yellowPlrPos.posX;
  yellowPlr.y = yellowPlrPos.posY;
}

function writePositionRed(x,y){
  var posRef = db.ref('players/redPlayer');
    posRef.set({
      posX : redPlr.x + x,
      posY : redPlr.y + y
    })
}

function writePositionYellow(x,y){
  var posRef = db.ref('players/yellowPlayer');
    posRef.set({
      posX : yellowPlr.x + x,
      posY : yellowPlr.y + y
    })
}

function getTurn(){
  var turnRef = db.ref('playerTurn');
    turnRef.on("value",(data)=>{
      plrTurn = data.val();
    });
}

function updateTurn(plrTurn){
  var turnRef = db.ref('/');
    posRef.update({
      playerTurn : plrTurn
    })
}

function updateWinner(winningPlr){
  var winnerRef = db.ref('/');
    winnerRef.update({
      winner : winningPlr
    })
}

function getGameState(){
  var gameStateRef = db.ref('gameState').on("value",(data)=>{
    gameState = data.val()
  });
  console.log(gameState);
}

function updateGameState(state){
    db.ref('/').update({
      gameState : state
    })
}

function showError(){
  console.log("Error");
}

var DeleteMe=0;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

canvas.style.cursor= 'none';

//////////////////Permanent Components/////////////////
var canvasWidth;
var canvasHeight;
var orientationMultiplier;

setInterval(updateCamera, 20);

window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);

canvas.onmousedown = function() {
  if(timer===-1) {
    fade ();
    timer = 1;}
  else if(timer>130 && game.transition===false) {
    if(game.running===false) {
      game.running=true;
    }
    else {
      game.running=false;
      ctx.fillStyle = 'black';
      ctx.fillText('Paused', canvasWidth/2, canvasHeight/2);
    }}
     }

window.addEventListener('keydown', function (e) {
      if(game.running===true) {
      player.keys = (player.keys || []);
      player.keys[e.keyCode] = true;}});
window.addEventListener('keyup', function (e) {
      player.keys[e.keyCode] = false; });

//////////////////////////////////////////////////////

var fallingObjectArray;
var thePlayer;
var theLava;
var theWalls;
var level = 7;
var timer = 0;  //timer=-1 ->game over, timer=x -> game ran for x/50 seconds

var game = {
  running: false,
  transition: false,
  startGame : function() {
    thePlayer = new player();
    theLava = new lava();
    theWalls = new walls();
    fallingObjectArray = [];
    this.running=true;
},
  stopGame : function() {//todo end-game ceiling, power-ups?, lava draws trails as well?, delete walls, fade to black when game over, style the text after textures
    ctx.fillStyle = 'black';
    ctx.fillText(' You survived ', canvasWidth/2, canvasHeight/2 - 0.7/orientationMultiplier*canvasWidth);
    ctx.fillText(Math.floor(timer/50)+ ' seconds!', canvasWidth/2, canvasHeight/2 + 0.7/orientationMultiplier*canvasWidth); //can't belive it actually works
    timer = -1;
    this.running=false;
    },
  clearCanvas : function () {
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
}
  }

function walls() {
  this.leftWallx = canvasWidth/30;
  this.rightWallx = canvasWidth - canvasWidth/30;
  this.updateWalls = function () {
  ctx.fillStyle= '#4f3222';
  ctx.fillRect(0,0,this.leftWallx,canvasHeight);
  ctx.fillRect(this.rightWallx,0,this.rightWallx,canvasHeight);
}
}

function lava() {
  this.height=canvasHeight/20;
  this.updateLava = function() {
  ctx.fillStyle= 'orangered';
  ctx.fillRect(0,canvasHeight-this.height,canvasWidth,this.height);
  }
}

function renderOnScreenFallingObjects () {
  if(game.transition===false) {
  if(timer%Math.floor((60-level*5)/2)===0 && timer<(10+5*level)*50)
    fallingObjectArray.push(new constructor());

    for(var i=0 ;i<fallingObjectArray.length; i++) {
          if(fallingObjectArray[i].y - fallingObjectArray[i].randomSize > canvasHeight-theLava.height) {
            fallingObjectArray.shift();
            if(fallingObjectArray.length===0) break; }
  fallingObjectArray[i].y=fallingObjectArray[i].y+fallingObjectArray[i].speed;
  fallingObjectArray[i].speed= fallingObjectArray[i].speed +(0.025+0.0025*level)*fallingObjectArray[i].speed;
  fallingObjectArray[i].update();
  if(fallingObjectArray[i].y - fallingObjectArray[i].randomSize < canvasHeight-theLava.height &&
    fallingObjectArray[i].y + fallingObjectArray[i].randomSize > canvasHeight-theLava.height)
    theLava.height=theLava.height + (11 - level)*0.13*canvasWidth/canvasHeight;
      }}
    }

function stopIfCollision() {
  if(game.transition===false) {
  if(thePlayer.y+thePlayer.playerSize>canvasHeight - theLava.height) {
    game.stopGame();
      return;
  }
/*  for (var i = 0; i<fallingObjectArray.length;i++) {
      if(thePlayer.collideWith(fallingObjectArray[i])){
      game.stopGame();
      return;
    }} */
  if(timer>130 && fallingObjectArray.length===0) {
    level++;
    game.transition = setInterval(levelTransition,20);
  }
  }
}

function levelTransition() {
  theLava.height = theLava.height - 0.013*theLava.height;
  thePlayer.y = thePlayer.y + 0.013*theLava.height/3;
  if(theLava.height<canvasHeight/20){
    clearInterval(game.transition);
    game.transition = false;
    timer=1;
  }
  }

function renderLevelText () {
  if((timer<130 && game.running===true) || game.transition!==false) {
    ctx.fillStyle = 'black';
    ctx.fillText('Level ' +level, canvasWidth/2, canvasHeight/2);
  }
}

function fade () { //since this happens before cameraUpdate, this jitters on the fadein, but it's barely noticeable
  var opac = 0.01;
  var reverse = false;
  var fadeTimer = setInterval( function() {
  if(opac<0.01)
    clearInterval(fadeTimer);
  else if (opac>1) {
   reverse = true;
   game.startGame();
  }
  if (reverse===true)
    opac = opac / 1.25;
  else
    opac = opac * 1.25;
  ctx.fillStyle = "rgba(0, 0, 0,"+ opac + ")";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }, 10);
}

function player () {
  this.playerSize= 1.5*orientationMultiplier;
  this.x = canvasWidth/2;
  this.y = 9/10*canvasHeight;
  this.speedx=0;
  this.speedy=0;
  this.history = [];

  this.update = function () {// todo decelerate player(fix it), fix trail
    this.playerSize = 1.5*orientationMultiplier;
    this.history.push(new Vector(this.x,this.y));
    if(this.history.length>7)
    this.history.shift();
    for(var i =0;i<this.history.length;i++)
     drawCircle(this.history[i].posx, this.history[i].posy, i/this.history.length * this.playerSize, 'rgba(0, 0, 0, '+i/this.history.length/2+')');//circle gets draw when radius=0. wat?
        this.speedx= this.speedx - 0.1*Math.sign(this.speedx);
        this.speedy= this.speedy - 0.1*Math.sign(this.speedy);
      if(this.speedx<0.1 && this.speedx>-0.1)
        this.speedx=0;
      if(this.speedy<0.1 && this.speedy>-0.1)
        this.speedy=0;
      if (player.keys && player.keys [37]) {
        if(this.speedx>0)
          this.speedx =this.speedx -0.50 - 0.05*level;
        else
          this.speedx =this.speedx -0.25 - 0.025*level; }

      if (player.keys && player.keys [39]) {
        if(this.speedx<0)
          this.speedx =this.speedx +0.50 + 0.05*level;
        else
          this.speedx =this.speedx +0.25 + 0.025*level; }
      if (player.keys && player.keys [38]) {
        if(this.speedy>0)
          this.speedy =this.speedy -0.50 - 0.05*level;
        else
          this.speedy =this.speedy -0.25 - 0.025*level; }
      if (player.keys && player.keys [40]) {
        if(this.speedy<0)
          this.speedy =this.speedy +0.50 + 0.05*level;
        else
          this.speedy =this.speedy +0.25 + 0.025*level; }

      this.x= this.x+ this.speedx;
      this.y= this.y+ this.speedy;

      if(this.x>theWalls.rightWallx-this.playerSize) {
        this.x=theWalls.rightWallx-this.playerSize;
        this.speedx= -this.speedx/1.5;
      }
      if(this.x<theWalls.leftWallx+this.playerSize) {
        this.x=theWalls.leftWallx+this.playerSize;
        this.speedx= -this.speedx/1.5;
      }
      if(this.y-this.playerSize<=0) {
       this.y=0+this.playerSize;
       this.speedy= -this.speedy/1.5;
      }
     if(game.transition!==false)
     if(this.y+this.playerSize>=canvasHeight-theLava.height) {
       this.y=canvasHeight - theLava.height - this.playerSize;
       this.speedy= -this.speedy/1.5;
      }

      drawCircle(this.x, this.y, this.playerSize, 'black');
  }

   this.collideWith = function (obstacle) {
   var crash = false;
    if ((this.x - obstacle.x) * (this.x - obstacle.x) +
        (this.y - obstacle.y) * (this.y - obstacle.y) <
        (this.playerSize + obstacle.randomSize) *
        (this.playerSize + obstacle.randomSize) * 7/10)
      crash = true;
    return crash;
  }
   }

var Vector = function(x, y) {
  this.posx = x;
  this.posy = y;
}

function drawCircle(x,y,r,color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function constructor () {
  this.randomSize = Math.random() * (canvasWidth/10-canvasWidth/50)+canvasWidth/50; //r //todo change 'randomSize' to 'radius' (maybe change the spectrum)
  this.x = Math.random() * (theWalls.rightWallx - 2*this.randomSize - theWalls.leftWallx) + theWalls.leftWallx + this.randomSize;
  if(timer%51===0)// this ignores walls. Test after deciding if you keep walls or not. And is also broken af, fix it.
  this.x = thePlayer.x;console.log(timer);
  this.y = -this.randomSize;
  this.speed = 0.01;//the number of 0s dictates the delay until the lava drops
  this.update= function () {
  drawCircle(this.x, this.y, this.randomSize, 'green');
  }
}

function resizeGame() {
if(window.innerWidth>window.innerHeight) { // 16:9 aspectRatio
  if(window.innerWidth/window.innerHeight>16/9) {
    canvas.height = window.innerHeight;
    canvas.width  = 16*window.innerHeight/9;
  }
  else {
    canvas.width = window.innerWidth;
    canvas.height= 9*window.innerWidth/16;
  }
  orientationMultiplier = 16;
}
else {
  if(window.innerWidth/window.innerHeight>9/16) {
    canvas.height = window.innerHeight;
    canvas.width  = 9*window.innerHeight/16;}
  else {
    canvas.width = window.innerWidth;
    canvas.height= 16*window.innerWidth/9;
  }
  orientationMultiplier = 9;
}
ctx.font = canvas.width * 1/orientationMultiplier+ "px Trade Winds, Verdana";
ctx.textAlign = 'center';
canvasWidth = canvas.width;
canvasHeight = canvas.height;
if(typeof thePlayer != "undefined") {
}
  if(typeof theLava != "undefined") {
}
}

function updateCamera () {
  if(game.running===true) {
  timer = timer + 1;
  game.clearCanvas();
  thePlayer.update();
  renderOnScreenFallingObjects();
  theWalls.updateWalls();
  theLava.updateLava();
  stopIfCollision();
  renderLevelText();
  }
}

////////
resizeGame();
game.startGame();

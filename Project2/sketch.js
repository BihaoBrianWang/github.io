//Global Setting

let gameState = "intro";
let player = { head: "normal", body: "normal", arms: "normal", legs: "normal" ,heart:"normal",spirit:"normal"};
let office = { hasContract: true, items: [] };
let activeTasks = [];
let contractButtons = [], consentButtons = [], nextContractButton;
let pendingConsent = false, triggered = 0;
let salary = 0 , title = "Senior worker";
let blurLevel = 0, maxBlur = 5, blurTimer = 0, blurDuration = 30000, coffeeEffectActive = false;
let nextContractIndex = 0;

let restartButton;

//preload Musci and sound fx
let
OfficeNoiseBGM,FailBGM,SuccessBGM,ClickFx,KeyboardFx;

//Preload Images
let IntroBgImg,RunningBgImg,HeadImg,BodyImg,ArmsImg,LegsImg,ComputerImg,PrinterImg,PhoneImg,CoffeeImg,TitleImg,SalaryImg,FailImg,SuccessImg;

function preload(){
  // Background
  IntroBgImg = loadImage('Photoes/IntroBackground.png');
  RunningBgImg = loadImage('Photoes/RunningBackground.png');
  FailImg = loadImage('Photoes/FailImg.png');
  SuccessImg = loadImage('Photoes/Success.png');

  // Body Image
  HeadImg = loadImage('Photoes/Head.png');
  BodyImg = loadImage('Photoes/Body.png');
  ArmsImg = loadImage('Photoes/Arms.png');
  LegsImg = loadImage('Photoes/Legs.png');
  HeartImg = loadImage('Photoes/Heart.png');

  // MiniGame
  ComputerImg = loadImage('Photoes/Computer.png');
  PrinterImg = loadImage('Photoes/Printer.png');
  PhoneImg = loadImage('Photoes/Phone.png');
  CoffeeImg = loadImage('Photoes/Coffee.png');
  TitleImg = loadImage('Photoes/Title.png');
  SalaryImg = loadImage('Photoes/SalaryBoard.png');

  // Contracts
  contractImages = [
    loadImage('Photoes/Contract0.png'),
    loadImage('Photoes/Contract1.png'),
    loadImage('Photoes/Contract2.png'),
    loadImage('Photoes/Contract3.png'),
    loadImage('Photoes/Contract4.png'),
    loadImage('Photoes/Contract5.png'),
    loadImage('Photoes/Contract6.png')
  ];
  
  //Music and Sound
  OfficeNoiseBGM = loadSound('Sound/OfficeNoise.mp3');
  FailBGM = loadSound('Sound/Fail.wav');
  Success = loadSound('Sound/Success.ogg');
  ClickFx = loadSound('Sound/Click.wav');
  KeyboardFx = loadSound('Sound/Keyboard.mp3');
  
}
 

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  setupUI();
}

function draw() {
  if (gameState === "intro") drawIntro();
  else if (gameState === "running") drawRunning();
  else if (gameState === "gameover") drawGameOver();
  else if (gameState ==="success") drawSuccess();
}

//Different Game State Drawing Function

function drawIntro() {
  drawContract(); }

function drawRunning() {
  updateBlurEffect();

  imageMode(CORNER);
  let buffer = createGraphics(width, height);
  buffer.textAlign(CENTER, CENTER);
  buffer.rectMode(CENTER);
  buffer.imageMode(CENTER);
  buffer.image( RunningBgImg,width/2,height/2,800,600);

  drawOffice(buffer);
  drawBodyStatus(buffer);
  drawActiveTasks(buffer);

  for (let t of activeTasks) if (t instanceof TaskCoffee) t.display(buffer);

  displayBlurEffect(buffer);

  if (!pendingConsent) nextContractButton.draw();
  else drawConsentPrompt();
}

function drawGameOver(){
  clear();

  image(FailImg,0,0,800,600);
  textAlign(CENTER, CENTER);
  text("You were fired.Just because you refused one small request, the company cast you aside without hesitation.The people who once called you an “excellent worker” don’t even remember your name now.But at least… you’re no longer being exploited.At least this time, you can finally breathe freely.", 200, 100,300,200);
  text("996 Work Culture in China",550,170,150,200);
  
  myLink = createA("https://en.wikipedia.org/wiki/996_working_hour_system", "Visit WIKI Website", "_blank");
  myLink.position(500, 200);  
  myLink.style("color", "#3366ff");
  myLink.style("font-size", "16px");
  restartButton.draw();
  
}

function drawSuccess(){
  clear();

  image(SuccessImg, 0,0,800,600);
  textAlign(CENTER, CENTER);
  text("You did it. You completed every task the company gave you. They call you an “excellent worker,” and you’ve earned a generous salary.But after all this… do you still remember who you were outside of work?The things you once loved, the person you wanted to become — are they still there?Was it all worth it?", width / 2-250, height / 2 - 60,300,200);
  restartButton.draw();
}

// Setup & UI
function setupUI() {
  restartButton = new Button(width / 2, height / 2 + 100, 160, 50, "Restart Game", restartGame);
  generateContractButtons();
  nextContractButton = new Button(width - 100, 40, 160, 40, "Next Contract", triggerConsentPrompt);
}

function restartGame() {
   console.log("Restart clicked!");

  gameState = "intro";
  player = { head: "normal", body: "normal", arms: "normal", legs: "normal", heart: "normal", spirit: "normal" };
  office = { hasContract: true, items: [] };
  activeTasks = [];
  contractButtons = [];
  consentButtons = [];
  pendingConsent = false;
  triggered = 0;
  salary = 0;
  title = "Senior worker";
  let nextContractIndex = 0;

  //Reset
  blurLevel = 0;
  maxBlur = 5;
  blurTimer = 0;
  blurDuration = 30000;
  coffeeEffectActive = false;

  // Rebuid UI
  setupUI();
   clear();  
}

function updateBlurEffect() {
  if (!coffeeEffectActive) return;
  blurTimer += deltaTime;
  if (blurTimer > blurDuration) blurTimer = 0;
  blurLevel = map(blurTimer, 0, blurDuration, 0, maxBlur, true);
}

function displayBlurEffect(buffer) {
   push();
  imageMode(CORNER);              
  if (coffeeEffectActive) {
    drawingContext.filter = `blur(${blurLevel}px)`;
    image(buffer, 0, 0);
    drawingContext.filter = "none";
    pop();

    let borderHeight = map(blurLevel, 0, maxBlur, 0, height / 2 - 50);
    noStroke();
    fill(0, 180);
    rect(width / 2, borderHeight / 2, width, borderHeight);
    rect(width / 2, height - borderHeight / 2, width, borderHeight);
  } else {
    image(buffer, 0, 0);
    pop();
  }
}

// === Contract System ===
function generateContractButtons() {
  contractButtons = [
    new Button(width / 2 + 80, height / 2+200, 100, 40, "Accept", acceptContract),
    new Button(width / 2 - 60, height / 2+200, 100, 40, "Reject", rejectContract)
  ];
}

function drawContract() {
  push();
  imageMode(CENTER);
  let contractIndex = constrain(triggered, 0, contractImages.length - 1);
  if (contractImages[contractIndex]) {
    image(contractImages[contractIndex], width / 2, height / 2, 600, 600);
  }
  pop();
  contractButtons.forEach(b => b.draw());
}

function acceptContract() { office.hasContract = false; gameState = "running"; triggered = 0; if (!OfficeNoiseBGM.isPlaying()) {
    OfficeNoiseBGM.loop();
    OfficeNoiseBGM.setVolume(0.3); // 可调整音量
  } }
function rejectContract() { gameState = "gameover"; }

function triggerConsentPrompt() {
  pendingConsent = true;
  nextContractIndex = constrain(triggered + 1, 0, contractImages.length - 1);
  generateConsentButtons();
}

function generateConsentButtons() {
  consentButtons = [
    new Button(width / 2 + 80, height / 2 + 200, 100, 40, "Accept", acceptNextTransformation),
    new Button(width / 2 - 80, height / 2 + 200, 100, 40, "Reject", rejectTransformation)
  ];
}

function drawConsentPrompt() {
   // show the contract artwork behind the panel
  if (contractImages[nextContractIndex]) {
    push();
    imageMode(CENTER);
    image(contractImages[nextContractIndex], width / 2, height / 2, 600, 600);
    pop();
  }
  consentButtons.forEach(b => b.draw());
}

// Body transformation Function
function acceptNextTransformation() 
{ 
  pendingConsent = false; 
  //Load the mini game
  triggerNextBodyPart(); 
}
function rejectTransformation() { gameState = "gameover"; }

// === World Rendering ===
function drawOffice(pg) {
  pg.textAlign(CENTER, CENTER);
  pg.imageMode(CENTER);
  for (let item of office.items) {
    if (item === "computer") {
      pg.image(ComputerImg,width/2+30, height/2-30,300,300 );
    }
    if (item === "printer") {
      pg.image(PrinterImg,width / 2 - 250, height / 2 - 20,300,300 );
    }
    if (item === "coffee") {
      pg.image(CoffeeImg,width / 2 -200, height / 2 + 120, 150,150);
    }
    if (item === "phone") {
      pg.image(PhoneImg,width / 2 + 200, height / 2 + 100, 300,300);
    }
    if(item ==="heart")
      {
        pg.image(SalaryImg,width/2+200,height/2-200,200,200);
      }
    if(item ==="spirit")
      {
        pg.image(TitleImg,width/2-200,height/2-200,300,300);
      }
  }
}

function drawBodyStatus(pg) {
  let x = 50, y = height - 100;
  pg.noStroke();
  pg.textAlign(CENTER, CENTER);
  pg.imageMode(CENTER);

  pg.fill("#607D8B");
  pg.rect(80,500,100,250,10);
  
    pg.textSize(18);
  pg.fill("#000000");
  pg.text("Body Status", x + 40, y - 100);
 
  // 头部
  if (player.head === "computer") ;
  else pg.image(HeadImg, 80, 500,72, 210);

  // 身体
  if (player.body === "phone") ;
  else pg.image(BodyImg, 80, 500, 72, 210);

  // 手臂
  if (player.arms === "coffee");
  else pg.image(ArmsImg, 80, 500, 72, 210);

  // 腿
  if (player.legs === "printer");
  else pg.image(LegsImg, 80, 500, 72, 210);

  // 心与灵魂
  if (player.heart === "heart");
  else
  {
  let beat = 1 + 0.4 * sin(frameCount * 0.2);   
  let heartSize = 50*beat;
  pg.image(HeartImg,90,450,heartSize,heartSize);
                 
   }
  if (player.spirit === "spirit") ;

}

function drawBodyPart(pg, x, y, state, label) {
  pg.fill(state === "normal" ? color(255, 255, 255, 100) : color(120, 120, 120, 100));
  pg.ellipse(x, y, 30, 30);
  pg.fill(0);
  pg.textAlign(LEFT, CENTER);
  pg.textSize(12);
  pg.text(label, x + 40, y);
}

function increaseSalary(amount = 100) {
  salary += amount;
  console.log(`Salary increased! Current salary: $${salary}`);
}

// === Mini-Game Loader ===
function drawActiveTasks(pg) { activeTasks.forEach(t => { if (!(t instanceof TaskCoffee)) t.display(pg); }); }

function triggerNextBodyPart() {
  triggered++;
  if (triggered === 1) loadComputerGame();
  else if (triggered === 2) loadPrinterGame();
  else if (triggered === 3) loadCoffeeGame();
  else if (triggered === 4) loadPhoneGame();
  else if (triggered ===5) loadHeart();
  else if (triggered ===6) loadSpirit();
}

// === Mini-Games ===
function loadComputerGame() {
  player.head = "computer";
  office.items.push("computer");
  activeTasks.push(new TaskComputer(width / 2, height / 2 - 70));
}

function loadPrinterGame() {
  player.legs = "printer";
  office.items.push("printer");
  activeTasks.push(new TaskPrinter(width / 2 - 250, height / 2 - 50));
}

function loadCoffeeGame() {
  player.arms = "coffee";
  office.items.push("coffee");
  blurTimer = 0; blurLevel = 0; coffeeEffectActive = true;
  activeTasks.push(new TaskCoffee(width / 2 - 200, height / 2 + 100));
}

function loadPhoneGame()
{
  player.body = "phone";
  office.items.push("phone");
  activeTasks.push(new TaskPhone(width/2+200,height/2+100));
}

function loadHeart()
{
  player.heart = "heart";
  office.items.push("heart")
  activeTasks.push(new TaskHeart(width/2+200,height/2-200));
}

function loadSpirit()
{
  player.spirit = "spirit";
  office.items.push("spirit")
  activeTasks.push(new TaskSpirit(width/2-200,height/2 - 200));
}

// === Button Class ===
class Button {
  constructor(x, y, w, h, label, action) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.label = label; this.action = action;
  }
  draw(pg = null) {
    let g = pg || window;
    g.fill(255);
    g.stroke(0);
    g.rect(this.x, this.y, this.w, this.h, 5);
    g.noStroke();
    g.fill(0);
    g.textAlign(CENTER, CENTER);
    g.textSize(16);
    g.text(this.label, this.x, this.y);
  }
  clicked(mx, my) {
    return mx > this.x - this.w / 2 && mx < this.x + this.w / 2 && my > this.y - this.h / 2 && my < this.y + this.h / 2;
  }
   trigger() {
    if (ClickFx) ClickFx.play();
    this.action();
  }
}

// === Base Task Classes ===
class TaskBase { update() {} display() {} clicked() {} }

// === Computer Mini Game ===
class TaskComputer extends TaskBase {
  constructor(x, y) { super(); this.x = x; this.y = y; this.feedback = ""; this.generate(); }

  createAnswerButtons(x, y, answers, callback) {
    return answers.map((ans, i) => new Button(x - 60 + i * 60, y + 40, 40, 30, ans.toString(), () => callback(ans)));
  }

  generate() {
    let a = int(random(1, 10)), b = int(random(1, 10)), op = random(["+", "-"]);
    this.correct = op === "+" ? a + b : a - b;
    this.question = `${a} ${op} ${b} = ?`;
    this.answers = [this.correct];
    while (this.answers.length < 3) {
      let fake = this.correct + int(random(-5, 6));
      if (!this.answers.includes(fake)) this.answers.push(fake);
    }
    shuffle(this.answers, true);
    this.buttons = this.createAnswerButtons(this.x, this.y, this.answers, ans => this.check(ans));
  }

  check(ans) {
    if (ans === this.correct) {
      increaseSalary();
      setTimeout(() => this.generate(), 800);
       if (Success) Success.play();Success.setVolume(0.3);
    } 
   
    
  }

  display(pg) {
    pg.textAlign(CENTER, CENTER);
    pg.fill(0);
    pg.textSize(32);
    pg.text(this.question, this.x, this.y - 40);
    this.buttons.forEach(b => b.draw(pg));
    pg.textSize(18);
    pg.text(this.feedback, this.x, this.y + 80);
  }

  clicked(mx, my) { this.buttons.forEach(b => { if (b.clicked(mx, my)) b.action(); }); }
}

// === Printer Mini Game ===
class TaskPrinter extends TaskBase {
  constructor(x, y) { super(); this.x = x; this.y = y; this.generateWord(); this.inputIndex = 0; this.feedback = Array(5).fill("neutral"); }

  generateWord() {
    this.word = Array.from({ length: 5 }, () => String.fromCharCode(int(random(65, 91)))).join("");
    this.feedback = Array(5).fill("neutral");
    this.inputIndex = 0;
  }

  display(pg) {
    pg.textAlign(CENTER, CENTER);
    pg.textSize(28);
    for (let i = 0; i < 5; i++) {
      pg.fill(this.feedback[i] === "correct" ? color(0, 200, 0) : this.feedback[i] === "wrong" ? color(255, 0, 0) : 0);
      pg.text(this.word[i], this.x - 60 + i * 30, this.y);
    }
  }

  keyPressed(k) {
   
    if (!/^[a-zA-Z]$/.test(k)) return;

    if (this.inputIndex < this.word.length) {
      let expected = this.word[this.inputIndex];
      if (k.toUpperCase() === expected) {
        this.feedback[this.inputIndex] = "correct";
         KeyboardFx.play();
        this.inputIndex++;
      } else {
        this.feedback[this.inputIndex] = "wrong";
      }
      if (this.inputIndex >= this.word.length) setTimeout(() => this.generateWord(), 1000);
    }
  }
}

// === Coffee Mini Game ===
class TaskCoffee extends TaskBase {
  constructor(x, y) { super(); this.button = new Button(x, y, 100, 100, "Drink", this.drinkCoffee); }
  display(pg) { this.button.draw(pg); }
  drinkCoffee() { blurTimer = 0; blurLevel = 0; coffeeEffectActive = true; }
  clicked(mx, my) { if (this.button.clicked(mx, my)) this.button.action(); }
}

//Phone Mini Game
class TaskPhone extends TaskBase{
   constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.generateNumber();
    this.inputIndex = 0;
    this.feedback = Array(6).fill("neutral");
  }
  generateNumber() {
    this.number = Array.from({ length: 6 }, () => int(random(0, 10))).join("");
    this.feedback = Array(6).fill("neutral");
    this.inputIndex = 0;
  }
  display(pg) {
    pg.textAlign(CENTER, CENTER);
    pg.textSize(32);
    for (let i = 0; i < 6; i++) {
      pg.fill(
        this.feedback[i] === "correct" ? color(0, 200, 0) :
        this.feedback[i] === "wrong" ? color(255, 0, 0) : 0
      );
      pg.text(this.number[i], this.x - 90 + i * 30, this.y);
    }
  }
  keyPressed(k) {
    if (!/^[0-9]$/.test(k)) return;
    if (this.inputIndex < this.number.length) {
      let expected = this.number[this.inputIndex];
      if (k === expected) {
        this.feedback[this.inputIndex] = "correct";
        KeyboardFx.play();
        this.inputIndex++;
      } else {
        this.feedback[this.inputIndex] = "wrong";
      }
      if (this.inputIndex >= this.number.length) setTimeout(() => this.generateNumber(), 1000);
    }
  }
}

//Heart Salary Display
class TaskHeart extends TaskBase {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.salary = 0;
  }
  display(pg) {
    pg.textAlign(CENTER, CENTER);
    pg.textSize(16);
    pg.fill(0);
    pg.text(`Salary: $${salary}`, this.x, this.y);
  }
}

//Spirit Honor 
class TaskSpirit extends TaskBase{
  constructor(x,y){
    super();this.x = x;this.y = y; this.timerStarted = false;this.startTime = 0;
  }
  display(pg){
    pg.textAlign(CENTER,CENTER);pg.textSize(16);pg.fill(0);pg.text('Senior Worker',this.x,this.y);
    
    if (!this.timerStarted) {
      this.timerStarted = true;
      this.startTime = millis();
    } else if (millis() - this.startTime >= 10000) {
      gameState = "success";
  }
  
  
}
}


// === Input Handlers ===
function keyPressed() { activeTasks.forEach(t => { if (t instanceof TaskPrinter|| t instanceof TaskPhone) t.keyPressed(key); }); }
function mousePressed() {
   if (gameState === "intro") {
  contractButtons.forEach(b => { if (b.clicked(mouseX, mouseY)) b.trigger(); });
}
else if (gameState === "running") {
  if (pendingConsent) {
    consentButtons.forEach(b => { if (b.clicked(mouseX, mouseY)) b.trigger(); });
  } else {
    if (nextContractButton.clicked(mouseX, mouseY)) nextContractButton.trigger();
    activeTasks.forEach(t => t.clicked(mouseX, mouseY));
  }
}
else if (gameState === "gameover" || gameState === "success") {
  if (restartButton.clicked(mouseX, mouseY)) restartButton.trigger();
}
}

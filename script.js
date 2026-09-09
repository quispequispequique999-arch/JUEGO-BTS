let selectedColorHex = '#8A2BE2';
let playerColor = 0x8A2BE2;
let player, cursors, msgText, scoreText, platforms;
let membersFound = 0;
let npcGroup = [];
let isSurpriseActive = false;
let gameStarted = false;

// Estado para botones del celular
let moveLeft = false;
let moveRight = false;
let moveJump = false;

const btsMembers = [
  { name: "RM 👑", color: 0x4169E1, x: 80, y: 400, msg: "RM: '¡Gracias por acompañarnos! ¡Feliz Cumpleaños! 💜'" },
  { name: "Jin 🐹", color: 0xFF1493, x: 220, y: 260, msg: "Jin: '¡Worldwide Handsome te desea el mejor día!'" },
  { name: "Suga 🐱", color: 0x708090, x: 360, y: 400, msg: "Suga: 'Que este año esté lleno de buena música y felicidad.'" },
  { name: "J-Hope 🐿️", color: 0xFFD700, x: 480, y: 180, msg: "J-Hope: '¡Eres nuestra esperanza! ¡A celebrar!' " },
  { name: "Jimin 🐥", color: 0xFFA500, x: 580, y: 400, msg: "Jimin: '¡Un abrazo enorme desde el corazón! 🐥💜'" },
  { name: "V 🐻", color: 0x8B4513, x: 680, y: 260, msg: "V: 'I Purple You 💜 ¡Especial como siempre!'" },
  { name: "Jungkook 🐰", color: 0x9370DB, x: 740, y: 400, msg: "Jungkook: '¡Llegaste! Mi persona favorita. ¡Tengo una sorpresa para ti! 🎉'" }
];

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { 
      gravity: { y: 420 }, 
      debug: false 
    }
  },
  scene: { preload: preload, create: create, update: update }
};

let game = new Phaser.Game(config);

function selectOutfit(hexColor, btnElement) {
  selectedColorHex = hexColor;
  playerColor = parseInt(hexColor.replace('#', '0x'));
  document.querySelectorAll('.outfit-btn').forEach(btn => btn.classList.remove('selected'));
  if (btnElement) btnElement.classList.add('selected');
  if (player) player.fillColor = playerColor;
}

function startGame() {
  document.getElementById('avatar-panel').classList.add('hidden');
  gameStarted = true;
  
  // Iniciar la canción que esté seleccionada
  const select = document.getElementById('song-select');
  if (select) changeSong(select.value);

  setupTouchControls();
}

function changeSong(src) {
  const audio = document.getElementById('bg-music');
  if (audio && src) {
    audio.src = src;
    audio.play().catch(err => console.log("Aviso de reproducción:", err));
  }
}

function setupTouchControls() {
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnJump = document.getElementById('btn-jump');

  if (btnLeft) {
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); moveLeft = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); moveLeft = false; });
    btnLeft.addEventListener('mousedown', () => moveLeft = true);
    btnLeft.addEventListener('mouseup', () => moveLeft = false);
  }

  if (btnRight) {
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); moveRight = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); moveRight = false; });
    btnRight.addEventListener('mousedown', () => moveRight = true);
    btnRight.addEventListener('mouseup', () => moveRight = false);
  }

  if (btnJump) {
    btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); moveJump = true; });
    btnJump.addEventListener('touchend', (e) => { e.preventDefault(); moveJump = false; });
    btnJump.addEventListener('mousedown', () => moveJump = true);
    btnJump.addEventListener('mouseup', () => moveJump = false);
  }
}

function preload() {
  this.load.spritesheet('playerSprite', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('jungkookImg', 'jungkook.jpg');
}

function create() {
  this.add.rectangle(400, 250, 800, 500, 0x0d001a);
  this.add.text(220, 15, '💜 SALTA Y ENCUENTRA A LOS 7 INTEGRANTES 💜', { font: '16px Arial', fill: '#FFD700', fontWeight: 'bold' });

  platforms = this.physics.add.staticGroup();

  let ground = this.add.rectangle(400, 480, 800, 40, 0x3b0066);
  platforms.add(ground);

  let p1 = this.add.rectangle(220, 310, 180, 20, 0x5c0099);
  let p2 = this.add.rectangle(480, 230, 180, 20, 0x5c0099);
  let p3 = this.add.rectangle(680, 310, 180, 20, 0x5c0099);
  platforms.add(p1);
  platforms.add(p2);
  platforms.add(p3);

  if (this.textures.exists('playerSprite')) {
    player = this.physics.add.sprite(50, 400, 'playerSprite');
  } else {
    player = this.add.rectangle(50, 400, 28, 42, playerColor);
    this.physics.add.existing(player);
  }
  
  player.body.setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms);

  if (this.textures.exists('playerSprite')) {
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('playerSprite', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }

  btsMembers.forEach((member) => {
    let npc;
    if (member.name.includes("Jungkook")) {
      npc = this.add.image(member.x, member.y, 'jungkookImg');
      npc.setDisplaySize(38, 50);
      this.physics.add.existing(npc);
    } else {
      npc = this.add.rectangle(member.x, member.y, 32, 45, member.color);
      this.physics.add.existing(npc);
    }

    npc.body.setAllowGravity(false);
    npc.body.setImmovable(true);
    
    let label = this.add.text(member.x - 20, member.y - 40, member.name, { font: '11px Arial', fill: '#FFFFFF' });
    
    let npcData = { body: npc, label: label, msg: member.msg, visited: false };
    npcGroup.push(npcData);

    this.physics.add.overlap(player, npc, () => {
      if (!gameStarted) return;
      if (!npcData.visited) {
        npcData.visited = true;
        membersFound++;
        scoreText.setText(`Integrantes saludados: ${membersFound} / 7`);
        if (membersFound === 7) {
          document.getElementById('surprise-btn').classList.remove('hidden');
        }
      }
      if (msgText) msgText.setText(npcData.msg);
    }, null, this);
  });

  msgText = this.add.text(40, 420, 'Usa las flechas del teclado o los botones táctiles 📱🎮', { 
    font: '12px Arial', fill: '#E6E6FA', backgroundColor: '#1A002C', padding: { x: 10, y: 5 }
  });

  scoreText = this.add.text(20, 15, 'Integrantes saludados: 0 / 7', { font: '13px Arial', fill: '#FFD700' });
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (!gameStarted || !player || !player.body) return;

  const isLeft = cursors.left.isDown || moveLeft;
  const isRight = cursors.right.isDown || moveRight;
  const isJump = cursors.up.isDown || moveJump;

  if (isLeft) {
    player.body.setVelocityX(-200);
    if (player.anims && this.textures.exists('playerSprite')) {
      player.anims.play('walk', true);
      player.flipX = true;
    }
  } else if (isRight) {
    player.body.setVelocityX(200);
    if (player.anims && this.textures.exists('playerSprite')) {
      player.anims.play('walk', true);
      player.flipX = false;
    }
  } else {
    player.body.setVelocityX(0);
    if (player.anims && this.textures.exists('playerSprite')) player.anims.stop();
  }

  if (isJump && player.body.touching.down) {
    player.body.setVelocityY(-460);
    moveJump = false;
  }
}

function triggerSurprise() {
  isSurpriseActive = true;
  document.getElementById('surprise-btn').classList.add('hidden');

  if (msgText) msgText.setText("💜 BTS Y JUNGKOOK CANTANDO EN VIVO - ¡FELIZ CUMPLEAÑOS! 🎤🎉");

  const select = document.getElementById('song-select');
  if (select) {
    select.value = "JungKook - Yes or No.mp3";
    changeSong(select.value);
  }
}
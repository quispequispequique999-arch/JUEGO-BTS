let selectedColorHex = '#8A2BE2';
let playerColor = 0x8A2BE2;
let player, cursors, msgText, scoreText, platforms;
let membersFound = 0;
let npcGroup = [];
let isSurpriseActive = false;
let gameStarted = false;

// Posiciones de los chicos
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
  const panel = document.getElementById('avatar-panel');
  if (panel) panel.classList.add('hidden');
  gameStarted = true;
  const select = document.getElementById('song-select');
  if (select) changeSong(select.value);
}

function changeSong(src) {
  const audio = document.getElementById('bg-music');
  if (audio && src) {
    audio.src = src;
    audio.play().catch(err => console.log("Aviso de audio:", err));
  }
}

// ----------------------------------------------------
// 1. PRELOAD CORREGIDO (Directo a la imagen jungkook.jpg)
// ----------------------------------------------------
function preload() {
  this.load.spritesheet('playerSprite', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
  
  // Como jungkook.jpg está al lado de script.js e index.html:
  this.load.image('jungkookImg', 'jungkook.jpg');
}

// ----------------------------------------------------
// 2. CREATE CON LA IMAGEN APLICADA A JUNGKOOK
// ----------------------------------------------------
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

  // Jugador
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

  // BTS NPCS
  btsMembers.forEach((member) => {
    let npc;

    // Si es Jungkook, dibujamos la foto jungkook.jpg
    if (member.name.includes("Jungkook")) {
      npc = this.add.image(member.x, member.y, 'jungkookImg');
      npc.setDisplaySize(38, 50); // Mantiene el tamaño adecuado en el mapa
      this.physics.add.existing(npc);
    } else {
      // Los demás continúan con rectángulos
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
          const btn = document.getElementById('surprise-btn');
          if (btn) btn.classList.remove('hidden');
        }
      }
      if (msgText) msgText.setText(npcData.msg);
    }, null, this);
  });

  msgText = this.add.text(40, 420, 'Controles: Flechas IZQ / DER para Correr | FLECHA ARRIBA para Saltar 🪂', { 
    font: '12px Arial', fill: '#E6E6FA', backgroundColor: '#1A002C', padding: { x: 10, y: 5 }
  });

  scoreText = this.add.text(20, 15, 'Integrantes saludados: 0 / 7', { font: '13px Arial', fill: '#FFD700' });
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (!gameStarted || !cursors || !player || !player.body) return;

  if (cursors.left.isDown) {
    player.body.setVelocityX(-200);
    if (player.anims && this.textures.exists('playerSprite')) {
      player.anims.play('walk', true);
      player.flipX = true;
    }
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(200);
    if (player.anims && this.textures.exists('playerSprite')) {
      player.anims.play('walk', true);
      player.flipX = false;
    }
  } else {
    player.body.setVelocityX(0);
    if (player.anims && this.textures.exists('playerSprite')) player.anims.stop();
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.setVelocityY(-460);
  }
}

function triggerSurprise() {
  isSurpriseActive = true;
  const btn = document.getElementById('surprise-btn');
  if (btn) btn.classList.add('hidden');

  const gameContainer = document.getElementById('game-container');
  const overlay = document.createElement('div');
  overlay.className = 'birthday-overlay';
  overlay.innerHTML = `
    <h1 class="birthday-title">✨ ¡FELIZ CUMPLEAÑOS! ✨</h1>
    <div class="birthday-cake">🎂🎉🎈</div>
  `;
  gameContainer.appendChild(overlay);

  const balloonEmojis = ['🎈', '💜', '✨', '🎉', '🌸'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.innerText = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
      balloon.style.left = Math.random() * 85 + '%';
      balloon.style.animationDuration = (3 + Math.random() * 2) + 's';
      gameContainer.appendChild(balloon);
      setTimeout(() => balloon.remove(), 5000);
    }, i * 200);
  }

  if (msgText) msgText.setText("💜 BTS Y JUNGKOOK CANTANDO EN VIVO - ¡FELIZ CUMPLEAÑOS! 🎤🎉");

  const select = document.getElementById('song-select');
  if (select) {
    select.value = "audio/7-jungkook-special.mp3";
    changeSong(select.value);
  }
}
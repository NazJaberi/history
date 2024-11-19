const game = {
  playerTypes: [
    {
      name: "Speedster",
      class: Speedster,
      color: "yellow",
      stats: { speed: 15, fireRate: 5, damage: 18, health: 80, defense: 5 },
    },
    {
      name: "Tank",
      class: Tank,
      color: "blue",
      stats: { speed: 6, fireRate: 2, damage: 13, health: 300, defense: 30 },
    },
    {
      name: "Glass Cannon",
      class: GlassCannon,
      color: "red",
      stats: { speed: 9, fireRate: 7, damage: 35, health: 60, defense: 0 },
    },
    {
      name: "All Rounder",
      class: AllRounder,
      color: "purple",
      stats: { speed: 10, fireRate: 4, damage: 22, health: 120, defense: 15 },
    },
  ],
  selectedPlayerIndex: 0,
  announcements: [],
  assets: {},

  backgroundMusic: null,
  isMusicPlaying: false,
  animationFrameId: null,

  fpsData: {
    frameCount: 0,
    lastFpsUpdate: 0,
    currentFps: 0,
    fpsHistory: [], // Stores last 60 FPS readings
    showGraph: false,
    fpsCounter: null,
    fpsGraph: null
  },


  init() {
    this.storyMode = new StoryService(this);
    // Add this line to pre-bind gameLoop
    this.gameLoop = this.gameLoop.bind(this);
    // In game.js constructor or init
    this.scoreboard = new ScoreboardUI(this);
    // Set up container and size
    this.container = document.getElementById("game-container");
    this.container.style.width = `${window.innerWidth}px`;
    this.container.style.height = `${window.innerHeight}px`;

    // Initialize performance tracking
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
    this.lastUpdateTime = null;
    this.targetFrameTime = 1000 / 60; // Target 60 FPS

    // Add FPS counter
    this.fpsCounter = document.createElement('div');
    this.fpsCounter.id = 'fps-counter';
    this.fpsCounter.style.position = 'fixed';
    this.fpsCounter.style.top = '10px';
    this.fpsCounter.style.right = '10px';
    this.fpsCounter.style.color = 'white';
    this.fpsCounter.style.zIndex = '10000';
    document.body.appendChild(this.fpsCounter);

    // Add FPS monitor
    this.addFpsMonitor();

    // Initialize game state
    this.menuManager = new MenuManager(this);
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.entities = [];
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.startTime = 0;

    // Initialize input tracking
    this.isLeftPressed = false;
    this.isRightPressed = false;
    this.isSpacePressed = false;
    this.isShiftPressed = false;

    // Event listeners
    this.container.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.container.addEventListener("click", this.handleClick.bind(this));
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this));

    // Pre-bind game loop to avoid garbage collection
    this.gameLoop = this.gameLoop.bind(this);
    
    // Load assets
    this.loadAssets(() => {
      // Show main menu after assets are loaded
      this.menuManager.showMenu("main");
      // Start the game loop
      requestAnimationFrame(this.gameLoop);
    });

    // Set up background music
    this.backgroundMusic = document.getElementById('background-music');
    this.isMusicPlaying = false;
    this.addMusicControls();

    console.log(
      "Game initialized. Container size:",
      this.container.offsetWidth,
      "x",
      this.container.offsetHeight
    );
  },

  addMusicControls() {
    const hud = document.getElementById('hud');
    if (hud) {
      const musicButton = document.createElement('button');
      musicButton.id = 'music-toggle';
      musicButton.className = 'music-toggle-button';
      musicButton.textContent = this.isMusicPlaying ? 'Pause Music' : 'Play Music';
      musicButton.addEventListener('click', () => this.toggleMusic());
      hud.appendChild(musicButton);
    } else {
      console.error('HUD element not found');
    }
  },

  // 2. Create the FPS monitor display
  addFpsMonitor() {
    // Create main container
    const fpsMonitor = document.createElement('div');
    fpsMonitor.id = 'fps-monitor';
    Object.assign(fpsMonitor.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      fontFamily: 'monospace',
      zIndex: '10000',
      userSelect: 'none'
    });

    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fps-counter';
    fpsCounter.style.marginBottom = '5px';
    fpsMonitor.appendChild(fpsCounter);

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Graph';
    toggleButton.style.marginBottom = '5px';
    toggleButton.onclick = () => {
      this.fpsData.showGraph = !this.fpsData.showGraph;
      this.fpsData.fpsGraph.style.display = this.fpsData.showGraph ? 'block' : 'none';
    };
    fpsMonitor.appendChild(toggleButton);

    // Create graph canvas
    const fpsGraph = document.createElement('canvas');
    fpsGraph.id = 'fps-graph';
    fpsGraph.width = 200;
    fpsGraph.height = 100;
    fpsGraph.style.display = 'none';
    fpsMonitor.appendChild(fpsGraph);

    // Add to document and store references
    document.body.appendChild(fpsMonitor);
    this.fpsData.fpsCounter = fpsCounter;
    this.fpsData.fpsGraph = fpsGraph;
  },

  // 3. Update the FPS display - call this in your game loop
  updateFpsDisplay(currentTime) {
    this.fpsData.frameCount++;
    
    if (currentTime - this.fpsData.lastFpsUpdate >= 1000) {
      // Calculate current FPS
      this.fpsData.currentFps = this.fpsData.frameCount;
      this.fpsData.fpsHistory.push(this.fpsData.currentFps);
      
      // Keep history length manageable
      if (this.fpsData.fpsHistory.length > 60) {
        this.fpsData.fpsHistory.shift();
      }

      // Update the display
      const color = this.getFpsColor(this.fpsData.currentFps);
      this.fpsData.fpsCounter.innerHTML = `
        FPS: <span style="color: ${color}">${this.fpsData.currentFps}</span>
        <br>
        Average: ${Math.round(this.getAverageFps())}
        <br>
        Min: ${Math.min(...this.fpsData.fpsHistory)}
      `;

      // Update graph if visible
      if (this.fpsData.showGraph) {
        this.drawFpsGraph();
      }

      // Reset for next second
      this.fpsData.frameCount = 0;
      this.fpsData.lastFpsUpdate = currentTime;
    }
  },

  // 4. Helper function to get FPS color
  getFpsColor(fps) {
    if (fps >= 55) return '#00ff00';
    if (fps >= 30) return '#ffff00';
    return '#ff0000';
  },

  // 5. Helper function to calculate average FPS
  getAverageFps() {
    const sum = this.fpsData.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsData.fpsHistory.length || 0;
  },

  // 6. Draw the FPS graph
  drawFpsGraph() {
    const canvas = this.fpsData.fpsGraph;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // Draw 60 FPS target line
    ctx.strokeStyle = '#444';
    const targetY = height - (60 * height / 80);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();

    // Draw FPS history
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    this.fpsData.fpsHistory.forEach((fps, i) => {
      const x = (i / this.fpsData.fpsHistory.length) * width;
      const y = height - (fps * height / 80);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  },

  toggleMusic() {
    if (this.backgroundMusic) {
      if (this.isMusicPlaying) {
        this.backgroundMusic.pause();
        this.isMusicPlaying = false;
      } else {
        this.backgroundMusic.play().catch(error => {
          console.warn("Unable to play background music:", error);
        });
        this.isMusicPlaying = true;
      }
      
      const musicToggle = document.getElementById('music-toggle');
      if (musicToggle) {
        musicToggle.textContent = this.isMusicPlaying ? 'Pause Music' : 'Play Music';
      }
    } else {
      console.warn("Background music element not found");
    }
  },
  
  handleResize() {
    this.container.style.width = `${window.innerWidth}px`;
    this.container.style.height = `${window.innerHeight}px`;
    if (this.player) {
      const maxX = this.container.offsetWidth - this.player.width / 2;
      const minX = this.player.width / 2;
      this.player.x = Math.max(minX, Math.min(this.player.x, maxX));
      this.player.updatePosition();
    }
  },

  handleMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (this.menuManager.currentMenu) {
      this.menuManager.handleMouseMove(x, y);
    }
  },

  loadAssets(callback) {
    let assetsToLoad = 0;
    let assetsLoaded = 0;

    const images = {
      speedster: "assets/images/speedster.png",
      tank: "assets/images/tank.png",
      glasscannon: "assets/images/glasscannon.png",
      allrounder: "assets/images/allrounder.png",
      // sidekick: "assets/images/sidekick.png",
      basicDrone: "assets/images/Basic_Drone.png",
      speedyZapper: "assets/images/zapper.png",
      armoredSaucer: "assets/images/saucer.png",
      splittingCube: "assets/images/cube.png",
      shieldedOrb: "assets/images/shielded.png",
      mothership: "assets/images/mothership.png",
      quantumShifter: "assets/images/Quantum_Shifter.png",
      hiveMind: "assets/images/hive.png",
      technoTitan: "assets/images/titan.png",
      cosmicHydra: "assets/images/hydra.png",
      background: "assets/images/background.png",
    };

    assetsToLoad = Object.keys(images).length;

    if (assetsToLoad === 0) {
      callback();
      return;
    }

    for (const [key, src] of Object.entries(images)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        console.log(`Loaded image: ${key}`);
        assetsLoaded++;
        if (assetsLoaded >= assetsToLoad) {
          callback();
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
      };
      this.assets[key] = img;
    }
  },

  gameLoop(currentTime) {
    // First frame initialization
    if (!this.lastUpdateTime) {
      this.lastUpdateTime = currentTime;
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      return;
    }
  
    // Calculate delta time (time since last frame)
    const deltaTime = currentTime - this.lastUpdateTime;
    
    // Update FPS counter
    this.updateFpsDisplay(currentTime);
  
    // Skip frame if we're running too slow
    if (deltaTime > 1000 / 30) {
      this.lastUpdateTime = currentTime;
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      return;
    }
  
    // Only update game if running and not paused
    if (this.isRunning && !this.isPaused) {
      // Handle player input
      if (this.isLeftPressed) {
        this.player.move(-1);
      }
      if (this.isRightPressed) {
        this.player.move(1);
      }
      
      // Update player
      if (this.player) {
        this.player.update(currentTime);
      }
  
      // Update projectiles
      this.updateProjectiles();
      
      // Update enemy projectiles
      this.updateEnemyProjectiles();
  
      // Update enemies
      this.updateEnemies(currentTime);
  
      // Update other entities
      this.updateEntities(currentTime);
  
      // Check all collisions
      this.checkCollisions();
  
      // Handle player shooting
      if (this.isSpacePressed) {
        const newProjectiles = this.player.shoot(currentTime);
        if (newProjectiles) {
          this.projectiles.push(...newProjectiles);
          newProjectiles.forEach(proj => this.container.appendChild(proj.element));
        }
      }
  
      // Handle special ability
      if (this.isShiftPressed) {
        this.player.useSpecialAbility(currentTime);
        this.isShiftPressed = false;
      }
  
      // Spawn new enemies
      this.spawnEnemies(currentTime);
  
      // Update announcements
      this.updateAnnouncements(currentTime);
  
      // Update HUD
      this.updateHUD();
    }
  
    // Store time for next frame
    this.lastUpdateTime = currentTime;
  
    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  },
  
  // Cleanup function
  cleanup() {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  
    // Reset timing variables
    this.lastUpdateTime = null;
  
    // Clear all intervals and timeouts
    if (this.intervals) {
      this.intervals.forEach(interval => clearInterval(interval));
      this.intervals = [];
    }
  
    // Reset FPS data
    this.fpsData.frameCount = 0;
    this.fpsData.lastFpsUpdate = 0;
    this.fpsData.currentFps = 0;
    this.fpsData.fpsHistory = [];
  
    // Reset game state
    this.isRunning = false;
    this.isPaused = false;
  
    console.log("Game cleaned up");
  },

  update(currentTime, deltaTime) {
    if (!this.player) return;  
  
    if (this.isLeftPressed) {
      this.player.move(-1);
    }
    if (this.isRightPressed) {
      this.player.move(1);
    }
  
    this.player.update(currentTime);
  
    this.updateProjectiles();
    this.updateEnemyProjectiles();
    this.updateEntities(currentTime);
    this.updateEnemies(currentTime);
  
    this.spawnEnemies(currentTime);
  
    this.checkCollisions();
  
    if (this.isSpacePressed) {
      const newProjectiles = this.player.shoot(currentTime);
      if (newProjectiles) {
        this.projectiles.push(...newProjectiles);
        newProjectiles.forEach((proj) =>
          this.container.appendChild(proj.element)
        );
      }
    }
  
    if (this.isShiftPressed) {
      this.player.useSpecialAbility(currentTime);
      this.isShiftPressed = false;
    }
  
    this.updateAnnouncements(currentTime);
    this.updateHUD();
  },

  updateProjectiles() {
    this.projectiles.forEach((proj, index) => {
      proj.move();
      if (proj.y < 0 || proj.x < 0 || proj.x > this.container.offsetWidth) {
        proj.element.remove();
        this.projectiles.splice(index, 1);
      }
    });
  },

  updateEnemyProjectiles() {
    console.log(`Updating ${this.enemyProjectiles.length} enemy projectiles`);
    this.enemyProjectiles.forEach((proj, index) => {
      proj.move();
      if (proj.y > this.container.offsetHeight) {
        proj.element.remove();
        this.enemyProjectiles.splice(index, 1);
      }
    });
  },

  updateEntities(currentTime) {
    this.entities.forEach((entity) => {
      entity.update(currentTime);
      entity.element.style.left = `${entity.x}px`;
      entity.element.style.top = `${entity.y}px`;
    });
  },

  updateEnemies(currentTime) {
    console.log(`Updating ${this.enemies.length} enemies at ${currentTime}`);
    this.enemies.forEach((enemy, index) => {
      enemy.update(currentTime);
      if (enemy.y > this.container.offsetHeight + 100) {
        enemy.element.remove();
        this.enemies.splice(index, 1);
        const playerDead = this.player.takeDamage(enemy.damage);
        if (playerDead) {
          this.gameOver();
        }
      }
    });
  },

  updateHUD() {
    const scoreElement = document.getElementById("score");
    const healthElement = document.getElementById("health");
    const specialCooldown = document.getElementById("special-cooldown");
  
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
      // Check story progress after score update
      this.storyMode.checkProgress(this.score);
    }
  
    if (healthElement && this.player) {
      healthElement.textContent = `Health: ${Math.max(0, Math.floor(this.player.health))}`;
    }
  
    if (specialCooldown && this.player) {
      const cooldownPercentage = this.player.getSpecialCooldownPercentage(performance.now());
      specialCooldown.style.width = `${cooldownPercentage * 100}%`;
      specialCooldown.style.backgroundColor = cooldownPercentage === 1 ? "green" : "red";
    }
  },

  addAnnouncement(message, duration = 3000) {
    const announcement = document.createElement("div");
    announcement.className = "announcement";
    announcement.textContent = message;
    this.container.appendChild(announcement);
    setTimeout(() => announcement.remove(), duration);
  },

  updateAnnouncements(currentTime) {
    // No need to update DOM-based announcements
  },

  handleClick(event) {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(`Click detected at (${x}, ${y})`);

    if (this.menuManager.currentMenu) {
      this.menuManager.handleClick(x, y);
    }
  },

  handleKeyDown(event) {
    console.log("Key pressed:", event.key);
    if (this.isRunning && !this.isPaused) {
      if (event.key === "ArrowLeft" || event.key === "a") {
        this.isLeftPressed = true;
      } else if (event.key === "ArrowRight" || event.key === "d") {
        this.isRightPressed = true;
      } else if (event.key === " ") {
        this.isSpacePressed = true;
      } else if (event.key === "Shift") {
        this.isShiftPressed = true;
      }
    }
    if (event.key === "Escape") {
      this.togglePause();
    }
  },
  
  handleKeyUp(event) {
    if (event.key === "ArrowLeft" || event.key === "a") {
      this.isLeftPressed = false;
    } else if (event.key === "ArrowRight" || event.key === "d") {
      this.isRightPressed = false;
    } else if (event.key === " ") {
      this.isSpacePressed = false;
    } else if (event.key === "Shift") {
      this.isShiftPressed = false;
    }
  },

  showCharacterSelect() {
    this.menuManager.showMenu("characterSelect");
  },

// Start game function
startGame() {
  console.log("Starting game");
  
  // Clean up any existing game state
  this.cleanup();
  this.resetGame();

  // Hide menu first
  this.menuManager.hideMenu();

  // Show intro story, then start game
  this.storyMode.showIntro().then(() => {
    // Set up new game
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.startTime = performance.now();

    // Clear the game container
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    // Create HUD
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.innerHTML = `
      <div id="score">Score: 0</div>
      <div id="health">Health: 100</div>
      <div id="special-cooldown"></div>
    `;
    this.container.appendChild(hud);

    // Add music controls
    this.addMusicControls();

    // Start music if not playing
    if (!this.isMusicPlaying && this.backgroundMusic) {
      this.backgroundMusic.play().catch(error => {
        console.warn("Unable to play background music:", error);
      });
      this.isMusicPlaying = true;
    }

    // Set up background
    if (this.assets.background) {
      this.container.style.backgroundImage = `url(${this.assets.background.src})`;
      this.container.style.backgroundSize = 'cover';
      this.container.style.backgroundPosition = 'center';
      this.container.style.backgroundRepeat = 'no-repeat';
    }

    // Create player
    const PlayerClass = this.playerTypes[this.selectedPlayerIndex].class;
    this.player = new PlayerClass(
      this.container.offsetWidth / 2,
      this.container.offsetHeight - 50
    );
    this.player.game = this;
    this.entities.push(this.player);
    this.container.appendChild(this.player.element);
    this.player.render();

    // Initialize game state
    this.lastEnemySpawnTime = 0;
    this.lastBossSpawnTime = 0;
    this.isMindControlled = false;
    this.isEMPDissed = false;
    this.timeWarpActive = false;

    // Update HUD
    this.updateHUD();

    // Start the game loop
    this.lastUpdateTime = null;
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  });
},

  togglePause() {
    console.log("Toggle pause called");
    if (this.isRunning) {
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    } else {
      console.log("Game hasn't started yet");
    }
  },

  pauseGame() {
    this.isPaused = true;
    this.menuManager.showMenu("pause");
    console.log("Game paused");
  },

  resumeGame() {
    this.isPaused = false;
    this.menuManager.hideMenu();
    console.log("Game resumed");
  },

  gameOver() {
    this.isRunning = false;
    this.storyMode.showEnding(false).then(() => {
      this.scoreboard.showScoreSubmission();
    });
  },
  
  victory() {
    this.isRunning = false;
    this.storyMode.showEnding(true).then(() => {
      this.scoreboard.showScoreSubmission();
    });
  },

  returnToMainMenu() {
    this.isRunning = false;
    this.isPaused = false;
    this.resetGame();
    this.menuManager.showMenu("main");
    console.log("Returned to main menu");
  },

  resetGame() {
    // Cancel any existing animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  
    // Reset game state
    this.isRunning = false;
    this.isPaused = false;
    this.lastUpdateTime = null;
    this.startTime = 0;
  
    // Clear all game objects
    this.enemies.forEach(enemy => enemy.element.remove());
    this.projectiles.forEach(proj => proj.element.remove());
    this.enemyProjectiles.forEach(proj => proj.element.remove());
    this.entities.forEach(entity => entity.element.remove());
    
    // Reset arrays
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.entities = [];
    this.player = null;
    this.score = 0;
  
    // Clear container
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  
    // Reset background
    this.container.style.backgroundImage = '';
  
    // Reset music
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    this.isMusicPlaying = false;
  
    // Reset game states
    this.isMindControlled = false;
    this.isEMPDissed = false;
    this.timeWarpActive = false;
  
    // Reset timers
    this.lastEnemySpawnTime = 0;
    this.lastBossSpawnTime = 0;
  
    // Reset FPS data
    this.fpsData.frameCount = 0;
    this.fpsData.lastFpsUpdate = 0;
    this.fpsData.currentFps = 0;
    this.fpsData.fpsHistory = [];
  
    console.log("Game reset");
  },

  checkCollisions() {
    this.checkProjectileEnemyCollisions();
    this.checkPlayerEnemyCollisions();
    this.checkEnemyProjectilePlayerCollisions();
  },

  checkProjectileEnemyCollisions() {
    // Victory check moved outside loops
    if (this.score >= 2000) {
      this.victory();
      return; // Exit after victory to prevent further processing
    }
  
    for (let pIndex = this.projectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.projectiles[pIndex];
      let projectileRemoved = false;
  
      for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = this.enemies[eIndex];
  
        if (this.isColliding(proj, enemy)) {
          if (!proj.piercing) {
            proj.element.remove();
            this.projectiles.splice(pIndex, 1);
            projectileRemoved = true;
          }
  
          const enemyDead = enemy.takeDamage(proj.damage);
          if (enemyDead) {
            if (enemy instanceof SplittingCube && enemy.size > 20) {
              this.addEnemy(
                new SplittingCube(enemy.x - 10, enemy.y, enemy.size / 2)
              );
              this.addEnemy(
                new SplittingCube(enemy.x + 10, enemy.y, enemy.size / 2)
              );
            }
            enemy.element.remove();
            this.enemies.splice(eIndex, 1);
            this.score += (enemy.isBoss ? 100 : 10);
  
            // Trigger story progress after score update
            this.storyMode.checkProgress(this.score);
          }
  
          if (proj.splash) {
            this.enemies.forEach((nearbyEnemy) => {
              if (
                nearbyEnemy !== enemy &&
                this.getDistance(enemy, nearbyEnemy) < 50
              ) {
                nearbyEnemy.takeDamage(proj.damage / 2);
              }
            });
          }
  
          if (projectileRemoved) break;
        }
      }
      if (projectileRemoved) continue;
    }
  },

  victory() {
    this.isRunning = false;
    this.storyMode.showEnding(true).then(() => {
      this.scoreboard.showScoreSubmission();
    });
  },

  checkPlayerEnemyCollisions() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      if (this.isColliding(enemy, this.player)) {
        console.log("Player collided with enemy");
        enemy.element.remove();
        this.enemies.splice(eIndex, 1);
        const playerDead = this.player.takeDamage(enemy.damage);
        if (playerDead) {
          this.gameOver();
        }
      }
    }
  },

  checkEnemyProjectilePlayerCollisions() {
    for (let pIndex = this.enemyProjectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.enemyProjectiles[pIndex];
      if (this.isColliding(proj, this.player)) {
        proj.element.remove();
        this.enemyProjectiles.splice(pIndex, 1);
        const playerDead = this.player.takeDamage(proj.damage);
        if (playerDead) {
          this.gameOver();
        } 
      }
    }
  },

  isColliding(rect1, rect2) {
    const rect1Left = rect1.x - rect1.width / 2;
    const rect1Right = rect1.x + rect1.width / 2;
    const rect1Top = rect1.y - rect1.height / 2;
    const rect1Bottom = rect1.y + rect1.height / 2;
  
    const rect2Left = rect2.x - rect2.width / 2;
    const rect2Right = rect2.x + rect2.width / 2;
    const rect2Top = rect2.y - rect2.height / 2;
    const rect2Bottom = rect2.y + rect2.height / 2;
  
    return (
      rect1Left < rect2Right &&
      rect1Right > rect2Left &&
      rect1Top < rect2Bottom &&
      rect1Bottom > rect2Top
    );
  },

  addEnemy(enemy) {
    enemy.game = this;
    this.enemies.push(enemy);
    this.container.appendChild(enemy.element);
  },

  spawnEnemies(currentTime) {
    const elapsedMinutes = (currentTime - this.startTime) / 60000;
    let spawnInterval = Math.max(2000 - elapsedMinutes * 100, 500);
    if (!this.lastEnemySpawnTime) this.lastEnemySpawnTime = currentTime;

    if (this.enemies.length >= 10) {
      console.log("Enemy cap reached. Not spawning new enemies.");
      return;
    }

    if (currentTime - this.lastEnemySpawnTime >= spawnInterval) {
      console.log('Spawning enemy at', currentTime);

      const x = this.getNonOverlappingPosition(70); // Width of BasicDrone
      this.addEnemy(
        new BasicDrone(x, -70)
      );
      this.lastEnemySpawnTime = currentTime;
    }

    if (elapsedMinutes >= 1 && Math.random() < 0.02 && this.enemies.length < 10) {
      const x = this.getNonOverlappingPosition(70); // Width of SpeedyZapper
      this.addEnemy(
        new SpeedyZapper(x, -50)
      );
    }

    if (elapsedMinutes >= 2 && Math.random() < 0.01 && this.enemies.length < 10) {
      const x = this.getNonOverlappingPosition(70); // Width of ArmoredSaucer
      this.addEnemy(
        new ArmoredSaucer(x, -50)
      );
    }

    if (elapsedMinutes >= 3 && Math.random() < 0.005 && this.enemies.length < 10) {
      const x = this.getNonOverlappingPosition(40); // Width of SplittingCube
      this.addEnemy(
        new SplittingCube(x, -50)
      );
    }

    if (elapsedMinutes >= 4 && Math.random() < 0.002 && this.enemies.length < 10) {
      const x = this.getNonOverlappingPosition(70); // Width of ShieldedOrb
      this.addEnemy(
        new ShieldedOrb(x, -50)
      );
    }

    if (elapsedMinutes >= 2) {
      if (
        !this.lastBossSpawnTime ||
        currentTime - this.lastBossSpawnTime >= 120000 + Math.random() * 60000
      ) {
        this.spawnBoss();
        this.lastBossSpawnTime = currentTime;
      }
    }
  },

  getNonOverlappingPosition(width) {
    const margin = 50; // Margin from the edges
    const maxAttempts = 10;
    let attempts = 0;
    let x;
    const containerWidth = this.container.offsetWidth;

    do {
      x = Math.random() * (containerWidth - 2 * margin) + margin;
      attempts++;
      const overlapping = this.enemies.some(enemy => {
        return Math.abs(enemy.x - x) < (enemy.width + width) / 2;
      });
      if (!overlapping) {
        return x;
      }
    } while (attempts < maxAttempts);

    // If unable to find non-overlapping position, return x anyway
    return x;
  },

  spawnBoss() {
    const bosses = [
      Mothership,
      QuantumShifter,
      HiveMind,
      TechnoTitan,
      CosmicHydra,
    ];
    const BossClass = bosses[Math.floor(Math.random() * bosses.length)];
    const boss = new BossClass(this.container.offsetWidth / 2, -150);
    boss.game = this;
    this.enemies.push(boss);
    this.container.appendChild(boss.element);
    this.addAnnouncement(`${boss.name} has appeared!`, 5000);
  },

  releaseEnergyWave() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      const enemyDead = enemy.takeDamage(20);
      if (enemyDead) {
        enemy.element.remove();
        this.enemies.splice(eIndex, 1);
        this.score += enemy.isBoss ? 100 : 10;
      }
    }
  },

  clearRegularEnemies() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      if (!enemy.isBoss) {
        enemy.element.remove();
        this.enemies.splice(eIndex, 1);
        this.score += 10;
      }
    }
  },

  fireLaserBeam(enemy) {
    this.addAnnouncement(`${enemy.name} fires a laser beam!`);
    console.log("Laser Beam fired!");
    const laserBeam = document.createElement("div");
    laserBeam.className = "laser-beam";
    laserBeam.style.left = `${enemy.x}px`;
    laserBeam.style.top = `${enemy.y}px`;
    laserBeam.style.height = `${this.container.offsetHeight}px`;
    this.container.appendChild(laserBeam);

    const checkLaserCollision = () => {
      if (this.isColliding(this.player, laserBeam)) {
        const playerDead = this.player.takeDamage(30);
        if (playerDead) {
          this.gameOver();
        } 
      }
    };

    const laserInterval = setInterval(checkLaserCollision, 16);

    setTimeout(() => {
      clearInterval(laserInterval);
      laserBeam.remove();
    }, 2000);
  },

  createBlackHole(enemy) {
    this.addAnnouncement(`${enemy.name} creates a black hole!`);
    console.log("Black Hole created!");
    const blackHole = document.createElement("div");
    blackHole.className = "black-hole";
    blackHole.style.left = `${enemy.x}px`;
    blackHole.style.top = `${enemy.y + enemy.height / 2}px`;
    this.container.appendChild(blackHole);

    const pullPlayer = () => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y + enemy.height / 2 - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        this.player.x += (dx / distance) * 0.5;
        this.player.y += (dy / distance) * 0.5;
        this.player.element.style.left = `${this.player.x}px`;
        this.player.element.style.top = `${this.player.y}px`;
      }
    };

    const blackHoleInterval = setInterval(pullPlayer, 16);

    setTimeout(() => {
      clearInterval(blackHoleInterval);
      blackHole.remove();
    }, 5000);
  },

  activateMindControl() {
    console.log("Mind Control activated!");
    this.isMindControlled = true;
    this.addAnnouncement("Mind Control activated!");

    const mindControlOverlay = document.createElement("div");
    mindControlOverlay.className = "mind-control-overlay";
    this.container.appendChild(mindControlOverlay);

    setTimeout(() => {
      this.isMindControlled = false;
      mindControlOverlay.remove();
    }, 5000);
  },

  activateEMP() {
    this.addAnnouncement("EMP activated!");
    console.log("EMP activated!");
    this.isEMPDissed = true;

    const empEffect = document.createElement("div");
    empEffect.className = "emp-effect";
    empEffect.style.left = `${this.player.x}px`;
    empEffect.style.top = `${this.player.y}px`;
    this.container.appendChild(empEffect);

    setTimeout(() => {
      this.isEMPDissed = false;
      empEffect.remove();
    }, 10000);
  },

  fireHomingMissiles(enemy) {
    this.addAnnouncement(`${enemy.name} launches homing missiles!`);
    console.log("Homing Missiles fired!");
    const missileCount = 3;

    for (let i = 0; i < missileCount; i++) {
      const missile = new EnemyProjectile(
        enemy.x,
        enemy.y + enemy.height / 2,
        15,
        3,
        this
      );
      missile.isHoming = true;
      missile.homingStrength = 0.05;
      missile.update = function () {
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
      };
      this.enemyProjectiles.push(missile);
      this.container.appendChild(missile.element);
    }
  },

  getDistance(obj1, obj2) {
    return Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
  },

};

window.addEventListener("load", () => game.init());
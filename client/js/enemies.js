// enemies.js

class BaseEnemy {
  constructor(x, y, stats) {
    this.game = null; // Will be set when enemy is created
    this.x = x;
    this.y = y;
    this.width = stats.width || 70;
    this.height = stats.height || 70;
    this.speed = stats.speed || 0.5;
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.damage = stats.damage || 5;
    this.color = stats.color || "green";
    this.isInvulnerable = false;
    this.lastAbilityTime = 0;
    this.lastShotTime = 0;
    this.fireRate = stats.fireRate || 0.3;
    this.imageKey = stats.imageKey || null;

    // Create DOM element
    this.element = document.createElement("div");
    this.element.className = "enemy";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundSize = "contain";
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.backgroundPosition = "center";

    // Create health bar
    this.healthBar = document.createElement("div");
    this.healthBar.className = "enemy-health-bar";
    this.healthBar.style.position = "absolute";
    this.healthBar.style.top = "-10px";
    this.healthBar.style.left = "0";
    this.healthBar.style.width = "100%";
    this.healthBar.style.height = "5px";
    this.healthBar.style.backgroundColor = "red";
    this.element.appendChild(this.healthBar);
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    this.health -= amount;
    this.updateHealthBar();
    return this.health <= 0;
  }

  updateHealthBar() {
    this.healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
  }

  render() {
    if (this.game.assets[this.imageKey]) {
      this.element.style.backgroundImage = `url(${this.game.assets[this.imageKey].src})`;
    } else {
      this.element.style.backgroundColor = this.color;
    }
    this.element.style.left = `${this.x - this.width / 2}px`;
    this.element.style.top = `${this.y - this.height / 2}px`;
  
    this.element.classList.toggle("invulnerable", this.isInvulnerable);
  }

  move() {
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      const projectileWidth = 5;   
      const projectileHeight = 15; 
  
      const spawnX = this.x;
      const spawnY = this.y + (this.height / 2) + (projectileHeight / 2);
  
      const proj = new EnemyProjectile(
        spawnX,
        spawnY,
        this.damage,
        5,             
        this.game,
        Math.PI / 2    
      );
  
      this.game.enemyProjectiles.push(proj);
      this.game.container.appendChild(proj.element);
    }
  }

  update(currentTime) {
    this.move();
    this.shoot(currentTime);
    this.render();
  }
}

class BasicDrone extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 1,
      speed: 0.5,
      damage: 3,
      color: "green",
      fireRate: 0.1,
      imageKey: "basicDrone",
    });
  }
}

class SpeedyZapper extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 3,
      speed: 1.2,
      damage: 2,
      color: "cyan",
      fireRate: 0.2,
      imageKey: "speedyZapper",
    });
    this.amplitude = 40;
    this.frequency = 0.05;
    this.startX = x;
    this.age = 0;
  }

  move() {
    this.age++;
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
    this.x = this.startX + this.amplitude * Math.sin(this.frequency * this.age);
  }
}

class ArmoredSaucer extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 15,
      speed: 0.3,
      damage: 5,
      color: "gray",
      fireRate: 0.05,
      imageKey: "armoredSaucer",
    });
  }

  takeDamage(amount) {
    return super.takeDamage(amount / 2);
  }
}

class SplittingCube extends BaseEnemy {
  constructor(x, y, size = 40) {
    super(x, y, {
      health: size === 40 ? 8 : 4,
      speed: 0.4,
      damage: 4,
      color: "orange",
      width: size,
      height: size,
      fireRate: 0,
      imageKey: "splittingCube",
    });
    this.size = size;
  }
}

class ShieldedOrb extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 10,
      speed: 0.6,
      damage: 4,
      color: "violet",
      fireRate: 0.1,
      imageKey: "shieldedOrb",
    });
    this.shieldDuration = 1200;
    this.shieldCooldown = 4000;
    this.isShielded = false;
    this.lastShieldTime = 0;

    this.shieldElement = document.createElement("div");
    this.shieldElement.className = "enemy-shield";
    this.shieldElement.style.display = "none";
    this.element.appendChild(this.shieldElement);
  }

  update(currentTime) {
    super.update(currentTime);
    if (
      currentTime - this.lastShieldTime >=
      this.shieldCooldown + this.shieldDuration
    ) {
      this.isShielded = true;
      this.isInvulnerable = true;
      this.lastShieldTime = currentTime;
      this.shieldElement.style.display = "block";
      setTimeout(() => {
        this.isShielded = false;
        this.isInvulnerable = false;
        this.shieldElement.style.display = "none";
      }, this.shieldDuration);
    }
  }
}

class BossEnemy extends BaseEnemy {
  constructor(x, y, stats) {
    super(x, y, stats);
    this.isBoss = true;
    this.imageKey = stats.imageKey || null;
    this.name = stats.name || "Boss";

    this.nameLabel = document.createElement("div");
    this.nameLabel.className = "boss-name";
    this.nameLabel.textContent = this.name;
    this.element.appendChild(this.nameLabel);
  }
}

class Mothership extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 200,
      speed: 0.15,
      damage: 10,
      color: "maroon",
      width: 180,
      height: 180,
      imageKey: "mothership",
      name: "Mothership",
    });
    this.lastDroneSpawnTime = 0;
    this.droneSpawnInterval = 6000;
    this.lastLaserTime = 0;
    this.laserInterval = 25000;
  }

  update(currentTime) {
    super.update(currentTime);

    if (currentTime - this.lastDroneSpawnTime >= this.droneSpawnInterval) {
      this.game.addEnemy(
        new BasicDrone(
          this.x + Math.random() * 100 - 50,
          this.y + this.height / 2
        )
      );
      this.lastDroneSpawnTime = currentTime;
    }

    if (currentTime - this.lastLaserTime >= this.laserInterval) {
      this.game.fireLaserBeam(this);
      this.lastLaserTime = currentTime;
    }
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      const leftProj = new EnemyProjectile(
        this.x - this.width / 4,
        this.y + this.height / 2,
        this.damage,
        5,
        this.game
      );
      const rightProj = new EnemyProjectile(
        this.x + this.width / 4,
        this.y + this.height / 2,
        this.damage,
        5,
        this.game
      );
      this.game.enemyProjectiles.push(leftProj, rightProj);
      this.game.container.appendChild(leftProj.element);
      this.game.container.appendChild(rightProj.element);
    }
  }
}

class QuantumShifter extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 180,
      speed: 0.8,
      damage: 8,
      color: "teal",
      width: 70,
      height: 70,
      imageKey: "quantumShifter",
      name: "Quantum Shifter",
    });
    this.lastTeleportTime = 0;
    this.teleportInterval = 10000;
    this.lastBlackHoleTime = 0;
    this.blackHoleInterval = 30000;
  }

  update(currentTime) {
    super.update(currentTime);

    if (currentTime - this.lastTeleportTime >= this.teleportInterval) {
      this.x = Math.random() * this.game.container.offsetWidth;
      this.lastTeleportTime = currentTime;
    }

    if (currentTime - this.lastBlackHoleTime >= this.blackHoleInterval) {
      this.game.createBlackHole(this);
      this.lastBlackHoleTime = currentTime;
    }
  }
}

class HiveMind extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 220,
      speed: 0.25,
      damage: 7,
      color: "olive",
      width: 80,
      height: 80,
      imageKey: "hiveMind",
      name: "Hive Mind",
    });
    this.lastSwarmTime = 0;
    this.swarmInterval = 7000;
    this.lastMindControlTime = 0;
    this.mindControlInterval = 35000;
  }

  update(currentTime) {
    super.update(currentTime);

    if (currentTime - this.lastSwarmTime >= this.swarmInterval) {
      for (let i = 0; i < 3; i++) {
        this.game.addEnemy(
          new SpeedyZapper(
            Math.random() * this.game.container.offsetWidth,
            this.y
          )
        );
      }
      this.lastSwarmTime = currentTime;
    }

    if (currentTime - this.lastMindControlTime >= this.mindControlInterval) {
      this.game.activateMindControl();
      this.lastMindControlTime = currentTime;
    }
  }
}

class TechnoTitan extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 250,
      speed: 0.18,
      damage: 12,
      color: "silver",
      width: 100,
      height: 100,
      imageKey: "technoTitan",
      name: "Techno Titan",
    });
    this.weakPoints = [
      { x: x - 30, y: y, width: 20, height: 20, destroyed: false },
      { x: x + 30, y: y, width: 20, height: 20, destroyed: false },
    ];
    this.lastEMPTime = 0;
    this.EMPInterval = 30000;

    this.weakPointElements = this.weakPoints.map((wp, index) => {
      const wpElement = document.createElement("div");
      wpElement.className = "weak-point";
      wpElement.style.position = "absolute";
      wpElement.style.width = `${wp.width}px`;
      wpElement.style.height = `${wp.height}px`;
      wpElement.style.backgroundColor = "red";
      this.element.appendChild(wpElement);
      return wpElement;
    });
  }

  takeDamage(amount) {
    if (this.weakPoints.every((wp) => wp.destroyed)) {
      return super.takeDamage(amount);
    }
    return false;
  }

  update(currentTime) {
    super.update(currentTime);

    if (currentTime - this.lastEMPTime >= this.EMPInterval) {
      this.game.activateEMP();
      this.lastEMPTime = currentTime;
    }

    this.weakPoints.forEach((wp, index) => {
      wp.x = this.x + (index === 0 ? -30 : 30);
      wp.y = this.y;
      if (!wp.destroyed) {
        this.weakPointElements[index].style.display = "block";
        this.weakPointElements[index].style.left = `${wp.x - wp.width / 2}px`;
        this.weakPointElements[index].style.top = `${wp.y - wp.height / 2}px`;
      } else {
        this.weakPointElements[index].style.display = "none";
      }
    });
  }
}

class CosmicHydra extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 230,
      speed: 0.25,
      damage: 9,
      color: "navy",
      width: 90,
      height: 90,
      imageKey: "cosmicHydra",
      name: "Cosmic Hydra",
    });
    this.lastRegenTime = 0;
    this.regenInterval = 4000;
    this.lastMissileTime = 0;
    this.missileInterval = 20000;
  }

  update(currentTime) {
    super.update(currentTime);

    if (currentTime - this.lastRegenTime >= this.regenInterval) {
      this.health = Math.min(this.health + 20, this.maxHealth);
      this.updateHealthBar();
      this.lastRegenTime = currentTime;
    }

    if (currentTime - this.lastMissileTime >= this.missileInterval) {
      this.game.fireHomingMissiles(this);
      this.lastMissileTime = currentTime;
    }
  }
}
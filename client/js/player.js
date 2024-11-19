// player.js

class BasePlayer {
  constructor(x, y, stats) {
    this.game = null; // Will be set when player is created
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 100;

    this.baseSpeed = stats.speed;
    this.speed = stats.speed;
    this.baseFireRate = stats.fireRate;
    this.fireRate = stats.fireRate;
    this.baseDamage = stats.damage;
    this.damage = stats.damage;
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.defense = stats.defense;
    this.specialAbility = stats.specialAbility;
    this.specialAbilityCooldown = stats.specialAbilityCooldown * 1000; // Convert to milliseconds
    this.lastSpecialUseTime = 0;
    this.isSpecialActive = false;
    this.lastShotTime = 0; // Initialize lastShotTime
    this.isInvulnerable = false; // For temporary invulnerability

    // Power-up effects
    this.activePowerUps = [];
    this.shieldCharges = 0;
    this.spreadShotActive = false;
    this.piercingShotActive = false;
    // this.sidekick = null;

    // Create DOM element
    this.element = document.createElement("div");
    this.element.className = "player game-object";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = "absolute";
    this.element.style.backgroundSize = "contain";
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.backgroundPosition = "center";
    this.element.style.transform = "translate(-50%, -50%)"; // Center the player element

    // Create health bar
    this.healthBar = document.createElement("div");
    this.healthBar.className = "health-bar";
    this.healthBar.style.position = "absolute";
    this.healthBar.style.bottom = "-10px";
    this.healthBar.style.left = "0";
    this.healthBar.style.width = "100%";
    this.healthBar.style.height = "5px";
    this.healthBar.style.backgroundColor = "green";
    this.element.appendChild(this.healthBar);

    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  render() {
    if (this.game.assets[this.constructor.name.toLowerCase()]) {
      this.element.style.backgroundImage = `url(${this.game.assets[this.constructor.name.toLowerCase()].src})`;
    } else {
      this.element.style.backgroundColor = this.color;
    }

    this.updatePosition();
    this.healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
    this.updateIndicators();
  }

  updateIndicators() {
    this.element.classList.toggle("special-active", this.isSpecialActive);
    this.element.classList.toggle("shield-active", this.shieldCharges > 0);
    this.element.classList.toggle("invulnerable", this.isInvulnerable);
  }

  move(dx) {
    if (this.game.isMindControlled) dx = -dx; // Reverse controls
    this.x += dx * this.speed;

    // Keep player within game container boundaries
    const maxX = this.game.container.offsetWidth - this.width / 2;
    const minX = this.width / 2;
    this.x = Math.max(minX, Math.min(this.x, maxX));

    this.updatePosition();
  }

  update(currentTime) {
    // Update active power-ups
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.activePowerUps[i];
      if (currentTime - powerUp.startTime >= powerUp.duration) {
        powerUp.deactivate();
        this.activePowerUps.splice(i, 1);
      }
    }

    // Update sidekick
    if (this.sidekick) {
      this.sidekick.update(currentTime);
    }

    this.render();
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;

      const projectiles = [];

      if (this.spreadShotActive) {
        // Fire three projectiles in a spread pattern
        const angles = [-0.1, 0, 0.1];
        angles.forEach((angle) => {
          const proj = new Projectile(
            this.x,
            this.y - this.height / 2, // Adjust the y position to spawn from the top of the player
            this.damage,
            angle,
            this.piercingShotActive,
            false // Remove combo-related splash damage
          );
          projectiles.push(proj);
        });
      } else {
        // Single projectile
        const proj = new Projectile(
          this.x,
          this.y - this.height / 2, // Adjust the y position to spawn from the top of the player
          this.damage,
          0,
          this.piercingShotActive,
          false // Remove combo-related splash damage
        );
        projectiles.push(proj);
      }

      // Sidekick fires
      if (this.sidekick) {
        const proj = new Projectile(
          this.sidekick.x,
          this.sidekick.y - this.sidekick.height / 2,
          this.damage / 2,
          0,
          this.piercingShotActive
        );
        projectiles.push(proj);
      }

      return projectiles;
    }
    return null;
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      return false;
    }
    const actualDamage = amount * (1 - this.defense / 100);
    this.health -= actualDamage;
    this.render(); // Update health bar
    return this.health <= 0;
  }

  useSpecialAbility(currentTime) {
    if (this.game.isEMPDissed) {
      console.log("Special ability disabled by EMP!");
      return false;
    }
    if (currentTime - this.lastSpecialUseTime >= this.specialAbilityCooldown) {
      this.lastSpecialUseTime = currentTime;
      this.isSpecialActive = true;
      const duration = this.specialAbility();
      setTimeout(() => {
        this.isSpecialActive = false;
        this.render();
      }, duration);
      return true;
    }
    return false;
  }

  specialAbility() {
    console.log("Special ability used");
    return 0; // Duration of the special ability effect
  }

  getSpecialCooldownPercentage(currentTime) {
    const elapsedTime = currentTime - this.lastSpecialUseTime;
    return Math.min(elapsedTime / this.specialAbilityCooldown, 1);
  }

  activatePowerUp(powerUp) {
    powerUp.activate();
    powerUp.startTime = performance.now();
    this.activePowerUps.push(powerUp);
  }
}

class Speedster extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 15,
      fireRate: 5,
      damage: 18,
      health: 80,
      defense: 5,
      specialAbility: () => this.dodgeRoll(),
      specialAbilityCooldown: 5,
    });
    this.color = "yellow";
  }

  dodgeRoll() {
    console.log("Dodge Roll used!");
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.x += this.speed * 30 * direction;
    const maxX = this.game.container.offsetWidth - this.width / 2;
    const minX = this.width / 2;
    this.x = Math.max(minX, Math.min(this.x, maxX));

    this.isInvulnerable = true;
    this.updatePosition();
    setTimeout(() => {
      this.isInvulnerable = false;
      this.render();
    }, 600);
    return 600;
  }
}

class Tank extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 6,
      fireRate: 2,
      damage: 13,
      health: 300,
      defense: 30,
      specialAbility: () => this.fortify(),
      specialAbilityCooldown: 15,
    });
    this.color = "blue";
    this.fortifyActive = false;
  }

  fortify() {
    this.fortifyActive = true;
    console.log("Fortify activated!");
    this.element.classList.add("fortify");
    setTimeout(() => {
      this.fortifyActive = false;
      this.element.classList.remove("fortify");
    }, 8000);
    return 8000;
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      return false;
    }
    const fortifyReduction = this.fortifyActive ? 0.5 : 0;
    const actualDamage = amount * (1 - this.defense / 100 - fortifyReduction);
    this.health -= actualDamage;
    this.render();
    return this.health <= 0;
  }
}

class GlassCannon extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 9,
      fireRate: 7,
      damage: 35,
      health: 60,
      defense: 0,
      specialAbility: () => this.powerSurge(),
      specialAbilityCooldown: 12,
    });
    this.color = "red";
    this.powerSurgeActive = false;
  }

  powerSurge() {
    this.powerSurgeActive = true;
    console.log("Power Surge activated!");
    this.element.classList.add("power-surge");
    setTimeout(() => {
      this.powerSurgeActive = false;
      this.element.classList.remove("power-surge");
    }, 5000);
    return 5000;
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      const projectile = new Projectile(
        this.x,
        this.y,
        this.powerSurgeActive ? this.damage * 2 : this.damage,
        0,
        this.piercingShotActive,
        false
      );
      return [projectile];
    }
    return null;
  }
}

class AllRounder extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 9,
      fireRate: 4,
      damage: 22,
      health: 120,
      defense: 15,
      specialAbility: () => this.energyWave(),
      specialAbilityCooldown: 18,
    });
    this.color = "purple";
  }

  energyWave() {
    console.log("Energy Wave released!");
    this.game.releaseEnergyWave();
    return 1000;
  }
}
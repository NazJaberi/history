// performance.js
export class PerformanceMonitor {
    constructor() {
      this.frameCount = 0;
      this.lastFpsUpdate = 0;
      this.currentFps = 0;
      this.fpsHistory = [];
      this.targetFrameTime = 1000 / 60;
      this.debug = false;
      this.fpsCounter = null;
    }
  
    init() {
      if (this.debug) {
        this.fpsCounter = document.createElement('div');
        this.fpsCounter.id = 'fps-counter';
        this.fpsCounter.style.position = 'fixed';
        this.fpsCounter.style.top = '10px';
        this.fpsCounter.style.right = '10px';
        this.fpsCounter.style.color = 'white';
        this.fpsCounter.style.zIndex = '10000';
        document.body.appendChild(this.fpsCounter);
      }
    }
  
    update(timestamp) {
      this.frameCount++;
      if (timestamp - this.lastFpsUpdate >= 1000) {
        this.currentFps = this.frameCount;
        this.fpsHistory.push(this.currentFps);
        if (this.fpsHistory.length > 60) this.fpsHistory.shift();
        this.frameCount = 0;
        this.lastFpsUpdate = timestamp;
        
        if (this.debug) {
          this.fpsCounter.textContent = `FPS: ${this.currentFps}`;
        }
      }
    }
  
    shouldSkipFrame(deltaTime) {
      return deltaTime > this.targetFrameTime * 2;
    }
  
    getAverageStats() {
      const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      const minFps = Math.min(...this.fpsHistory);
      return { avgFps, minFps };
    }
  }
  
  // spatial-grid.js
  export class SpatialGrid {
    constructor(width, height, cellSize) {
      this.cellSize = cellSize;
      this.cols = Math.ceil(width / cellSize);
      this.rows = Math.ceil(height / cellSize);
      this.grid = new Array(this.cols * this.rows).fill().map(() => []);
    }
  
    clear() {
      this.grid.forEach(cell => cell.length = 0);
    }
  
    getCellIndex(x, y) {
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return -1;
      return row * this.cols + col;
    }
  
    insert(object) {
      const index = this.getCellIndex(object.x, object.y);
      if (index >= 0) this.grid[index].push(object);
    }
  
    getNearbyObjects(object) {
      const index = this.getCellIndex(object.x, object.y);
      if (index < 0) return [];
      return this.grid[index];
    }
  }
  
  // object-pool.js
  export class ObjectPool {
    constructor(factory, initialSize) {
      this.factory = factory;
      this.pool = new Array(initialSize).fill(null).map(() => factory());
      this.active = new Set();
    }
  
    acquire() {
      let object = this.pool.pop();
      if (!object) object = this.factory();
      this.active.add(object);
      return object;
    }
  
    release(object) {
      if (this.active.delete(object)) {
        this.pool.push(object);
        this.resetObject(object);
      }
    }
  
    resetObject(object) {
      // Reset object properties to initial state
      if (object.reset) object.reset();
    }
  }
  
  // renderer.js
  export class BatchRenderer {
    constructor() {
      this.updates = [];
      this.isUpdateScheduled = false;
    }
  
    addUpdate(element, x, y) {
      this.updates.push(() => {
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
  
      if (!this.isUpdateScheduled) {
        this.isUpdateScheduled = true;
        requestAnimationFrame(() => this.applyUpdates());
      }
    }
  
    applyUpdates() {
      this.updates.forEach(update => update());
      this.updates = [];
      this.isUpdateScheduled = false;
    }
  }
  
  // collision-manager.js
  export class CollisionManager {
    constructor(game, grid) {
      this.game = game;
      this.grid = grid;
    }
  
    checkCollisions() {
      this.grid.clear();
      
      // Add all objects to the spatial grid
      this.addObjectsToGrid();
      
      // Check collisions using spatial grid
      this.checkProjectileEnemyCollisions();
      this.checkEnemyProjectilePlayerCollisions();
      this.checkPlayerEnemyCollisions();
    }
  
    addObjectsToGrid() {
      this.grid.insert(this.game.player);
      this.game.enemies.forEach(enemy => this.grid.insert(enemy));
      this.game.projectiles.forEach(proj => this.grid.insert(proj));
      this.game.enemyProjectiles.forEach(proj => this.grid.insert(proj));
    }
  
    checkProjectileEnemyCollisions() {
      this.game.projectiles.forEach(proj => {
        const nearbyEnemies = this.grid.getNearbyObjects(proj);
        nearbyEnemies.forEach(enemy => {
          if (enemy instanceof BaseEnemy && this.game.isColliding(proj, enemy)) {
            this.game.handleProjectileEnemyCollision(proj, enemy);
          }
        });
      });
    }
  
    checkEnemyProjectilePlayerCollisions() {
      this.game.enemyProjectiles.forEach(proj => {
        if (this.game.isColliding(proj, this.game.player)) {
          this.game.handleEnemyProjectilePlayerCollision(proj);
        }
      });
    }
  
    checkPlayerEnemyCollisions() {
      const nearbyEnemies = this.grid.getNearbyObjects(this.game.player);
      nearbyEnemies.forEach(enemy => {
        if (enemy instanceof BaseEnemy && this.game.isColliding(enemy, this.game.player)) {
          this.game.handleEnemyPlayerCollision(enemy);
        }
      });
    }
  }
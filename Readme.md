# Space Invader

Welcome to **Space Invaders**, an exciting space shooter game where you pilot a spaceship to defend against waves of alien enemies and formidable bosses. Test your reflexes, strategy, and skills as you battle through endless waves and aim for the highest score!

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Controls](#controls)
- [Player Classes](#player-classes)
- [Enemies](#enemies)
- [Bosses](#bosses)
- [Game Mechanics](#game-mechanics)

## Features

- **Four Unique Player Classes**: Choose from Speedster, Tank, Glass Cannon, and All Rounder, each with distinct abilities and stats.
- **Special Abilities**: Utilize powerful special abilities unique to each player class, turning the tide of battle.
- **Diverse Enemy Types**: Face off against various enemies, each with unique behaviors and attacks.
- **Challenging Boss Battles**: Engage with powerful bosses that require strategic approaches to defeat.
- **Dynamic Difficulty**: The game progressively becomes more challenging as you play.
- **Background Music with Controls**: Enjoy immersive background music with the option to toggle on or off.
- **Score Tracking and HUD**: Keep track of your score, health, and special ability cooldowns.
- **Responsive Controls**: Smooth gameplay experience with intuitive controls.
- **Pause and Resume Functionality**: Ability to pause the game at any time.

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Safari, Edge) with JavaScript enabled.

### Installation

1. **Clone or Download the Repository**

   ```bash
   git clone https://github.com/NazJaberi/make-your-game.git
   ```

   Alternatively, you can download the ZIP file from the repository's page and extract it.

2. **Navigate to the Game Directory**

   ```bash
   cd MAKE-YOUR-GAME
   ```

### Running the Game

- **Open `index.html` in Your Browser**

  Simply open the `index.html` file in your preferred web browser to start the game.

## Controls

- **Move Left**: `Left Arrow` key or `A` key
- **Move Right**: `Right Arrow` key or `D` key
- **Shoot**: `Spacebar`
- **Special Ability**: `Shift` key
- **Pause/Resume Game**: `Escape` key
- **Toggle Music**: Click the `Play Music` or `Pause Music` button in the HUD

## Player Classes

### 1. Speedster

- **Stats**:
  - **Speed**: High
  - **Fire Rate**: Moderate
  - **Damage**: Moderate
  - **Health**: Low
  - **Defense**: Low
- **Special Ability**: **Dodge Roll**
  - **Description**: The Speedster performs a quick dodge roll, moving swiftly to the left or right and becoming temporarily invulnerable.
  - **Effect**:
    - Randomly moves a significant distance left or right.
    - Grants **0.6 seconds** of invulnerability.
  - **Cooldown**: **5 seconds**

**Notes**: The Speedster excels in agility, allowing for quick maneuvers to avoid enemy fire. Use the Dodge Roll to evade tight situations and reposition rapidly.

### 2. Tank

- **Stats**:
  - **Speed**: Very Low
  - **Fire Rate**: Low
  - **Damage**: Moderate
  - **Health**: Very High
  - **Defense**: High
- **Special Ability**: **Fortify**
  - **Description**: The Tank fortifies its defenses, significantly reducing incoming damage for a period.
  - **Effect**:
    - Reduces incoming damage by an additional **50%** (on top of regular defense).
    - Lasts for **8 seconds**.
  - **Cooldown**: **15 seconds**

**Notes**: The Tank is built to withstand heavy damage. Activating Fortify during intense enemy waves or boss attacks can help you survive overwhelming situations.

### 3. Glass Cannon

- **Stats**:
  - **Speed**: Moderate
  - **Fire Rate**: High
  - **Damage**: High
  - **Health**: Very Low
  - **Defense**: None
- **Special Ability**: **Power Surge**
  - **Description**: The Glass Cannon harnesses a surge of energy to amplify its firepower.
  - **Effect**:
    - Doubles the damage of your shots.
    - Lasts for **5 seconds**.
  - **Cooldown**: **12 seconds**

**Notes**: The Glass Cannon deals massive damage but is fragile. Use Power Surge to quickly eliminate tough enemies or bosses, but be cautious of incoming attacks due to low health and defense.

### 4. All Rounder

- **Stats**:
  - **Speed**: Moderate
  - **Fire Rate**: Moderate
  - **Damage**: Moderate
  - **Health**: Moderate
  - **Defense**: Moderate
- **Special Ability**: **Energy Wave**
  - **Description**: The All Rounder releases a powerful energy wave that damages all enemies on the screen.
  - **Effect**:
    - Deals **20 damage** to all enemies.
    - Immediate effect.
  - **Cooldown**: **18 seconds**

**Notes**: As a versatile class, the All Rounder can handle various situations. The Energy Wave is excellent for clearing multiple enemies or weakening a boss along with its minions.

## Enemies

### Basic Drone

- **Appearance**: Small green alien ship.
- **Behavior**: Moves downward and occasionally shoots at the player.
- **Attack**: Fires straight projectiles.
- **Health**: Low

### Speedy Zapper

- **Appearance**: Cyan-colored ship with fast movements.
- **Behavior**: Moves rapidly in a zig-zag pattern and fires more frequently.
- **Attack**: Fires projectiles at a higher rate.
- **Health**: Low

### Armored Saucer

- **Appearance**: Gray saucer-like ship.
- **Behavior**: Moves slowly but has increased defenses.
- **Special Trait**: Reduces incoming damage by **50%** due to armored plating.
- **Health**: High

### Splitting Cube

- **Appearance**: Orange cube.
- **Behavior**: Upon destruction, splits into smaller cubes.
- **Attack**: Does not fire projectiles.
- **Health**: Moderate to Low (smaller cubes)

### Shielded Orb

- **Appearance**: Violet orb with a protective shield.
- **Behavior**: Activates a shield periodically, becoming invulnerable for short periods.
- **Attack**: Fires projectiles during vulnerable phases.
- **Health**: Moderate

## Bosses

### Mothership

- **Appearance**: Large maroon ship.
- **Abilities**:
  - **Drone Deployment**: Spawns Basic Drones to assist in attacking the player.
  - **Laser Beam**: Fires a powerful laser beam as a special attack.
- **Attack**: Fires projectiles from multiple positions.
- **Health**: Very High

### Quantum Shifter

- **Appearance**: Teal-colored ship with quantum abilities.
- **Abilities**:
  - **Teleportation**: Randomly teleports across the screen to avoid attacks.
  - **Black Hole Creation**: Generates black holes that pull the player towards them.
- **Attack**: Fires projectiles and uses spatial manipulation.
- **Health**: High

### Hive Mind

- **Appearance**: Olive-colored organic entity.
- **Abilities**:
  - **Swarm Summon**: Summons swarms of Speedy Zappers.
  - **Mind Control**: Temporarily reverses the player's controls.
- **Attack**: Relies on minions and psychological warfare.
- **Health**: High

### Techno Titan

- **Appearance**: Massive silver robotic ship.
- **Abilities**:
  - **Weak Points**: Has vulnerable spots that must be destroyed before the main body can take damage.
  - **EMP Blast**: Emits an EMP that disables the player's special abilities temporarily.
- **Attack**: Fires projectiles and uses area-of-effect abilities.
- **Health**: Very High

### Cosmic Hydra

- **Appearance**: Navy blue ship resembling a hydra.
- **Abilities**:
  - **Regeneration**: Recovers health over time.
  - **Homing Missiles**: Launches missiles that track the player's ship.
- **Attack**: Uses regenerative abilities and tracking projectiles.
- **Health**: High

## Game Mechanics

### Scoring

- **Defeating Enemies**:
  - Regular enemies: **+10 points**
  - Boss enemies: **+100 points**
- **Objective**: Achieve the highest score by surviving as long as possible and defeating enemies.

### Health and Damage

- The player's health decreases when hit by enemies or enemy projectiles.
- The game ends when the player's health reaches zero.
- **Health Display**: Shown in the HUD at the top-left corner.

### Special Abilities

- Each player class has a unique special ability activated using the `Shift` key.
- **Cooldown**: Special abilities have a cooldown period, indicated by the special ability bar in the HUD.
- **Usage Tips**:
  - **Speedster**: Use Dodge Roll to escape tight situations or dodge incoming attacks.
  - **Tank**: Activate Fortify during intense firefights or when facing heavy enemy fire.
  - **Glass Cannon**: Trigger Power Surge when a burst of damage is needed, such as against bosses.
  - **All Rounder**: Deploy Energy Wave when overwhelmed by enemies to clear the screen or weaken foes.

### Enemy Spawn Mechanics

- **Dynamic Difficulty**: Enemy spawn rate and types evolve as you progress.
- **Enemy Cap**: A maximum of **10 enemies** can be present on the screen simultaneously.
- **Non-Overlapping Spawns**: Enemies spawn in positions that prevent overlapping and avoid screen edges.

### Boss Battles

- **Boss Arrival**: Bosses appear after surviving for certain intervals.
- **Announcement**: The game announces the arrival of a boss with on-screen text.
- **Unique Strategies**: Each boss requires different tactics to defeat.

### Pause and Music Control

- **Pause Game**: Press `Escape` to pause; access the menu or resume.
- **Music Control**: Use the `Play Music` or `Pause Music` button in the HUD to control background music.



Enjoy the game, and may you achieve the highest score!
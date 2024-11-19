class MenuManager {
  constructor(game) {
    this.game = game;
    this.currentMenu = null;
    
    this.menuContainer = document.createElement("div");
    this.menuContainer.id = "menu-container";
    this.menuContainer.style.position = "fixed";
    this.menuContainer.style.top = "0";
    this.menuContainer.style.left = "0";
    this.menuContainer.style.width = "100%";
    this.menuContainer.style.height = "100%";
    this.menuContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    this.menuContainer.style.display = "none";
    this.menuContainer.style.flexDirection = "column";
    this.menuContainer.style.justifyContent = "center";
    this.menuContainer.style.alignItems = "center";
    this.menuContainer.style.zIndex = "10000";
    
    document.body.appendChild(this.menuContainer);

    this.menuBackground = document.getElementById('menu-background');
    this.menuMusic = document.getElementById('menu-music');
    this.gameMusic = document.getElementById('background-music');
  }

  showMenu(menuName) {
    console.log(`Showing menu: ${menuName}`);
    
    // Skip showing menu if it's gameOver
    if (menuName === "gameOver") {
      return;
    }
    
    this.currentMenu = menuName;
    this.menuContainer.style.display = "flex";
    
    if (menuName === "main" || menuName === "characterSelect") {
      this.menuBackground.style.display = "block";
      this.menuBackground.play();
      
      this.menuMusic.play();
      this.gameMusic.pause();
    } else {
      this.menuBackground.style.display = "none";
      this.menuBackground.pause();
      
      this.menuMusic.pause();
    }
  
    this.renderMenu();
    
    // Force a reflow
    void this.menuContainer.offsetWidth;
    
    console.log("Menu container style:", this.menuContainer.style.cssText);
    console.log("Menu container bounding rect:", this.menuContainer.getBoundingClientRect());
  }

  hideMenu() {
    this.currentMenu = null;
    this.menuContainer.style.display = "none";
    
    this.menuBackground.style.display = "none";
    this.menuBackground.pause();
    
    this.menuMusic.pause();
  }

  handleClick(x, y) {
    const clickEvent = new MouseEvent("click", {
      clientX: x,
      clientY: y,
    });
    this.menuContainer.dispatchEvent(clickEvent);
  }

  handleMouseMove(x, y) {
    const moveEvent = new MouseEvent("mousemove", {
      clientX: x,
      clientY: y,
    });
    this.menuContainer.dispatchEvent(moveEvent);
  }

  renderMenu() {
    this.menuContainer.innerHTML = "";
    switch (this.currentMenu) {
      case "main":
        this.renderMainMenu();
        break;
      case "characterSelect":
        this.renderCharacterSelect();
        break;
      case "pause":
        this.renderPauseMenu();
        break;
      // case "gameOver":
      //   this.renderGameOver();
      //   break;
    }
  }

  renderMainMenu() {
    const menuContent = document.createElement("div");
    menuContent.style.position = "relative";
    menuContent.style.zIndex = "1";
    menuContent.style.textAlign = "center";
  
    const title = document.createElement("h1");
    title.textContent = "Earth's Last Defense";
    title.style.textAlign = "center";
    title.style.marginTop = "20%";
  
    const startButton = this.createButton("Begin Mission", () => {
      this.game.showCharacterSelect();
    });
  
    menuContent.appendChild(title);
    menuContent.appendChild(startButton);
    this.menuContainer.appendChild(menuContent);
  }

  renderCharacterSelect() {
    console.log("Rendering character select menu");
    const menuContent = document.createElement("div");
    menuContent.style.position = "relative";
    menuContent.style.zIndex = "1";
    menuContent.style.textAlign = "center";

    const title = document.createElement("h2");
    title.textContent = "Select Your Character";
    title.style.textAlign = "center";

    const characterContainer = document.createElement("div");
    characterContainer.style.display = "flex";
    characterContainer.style.justifyContent = "center";
    characterContainer.style.flexWrap = "wrap";

    this.game.playerTypes.forEach((type, index) => {
      const charBox = document.createElement("div");
      charBox.className = "character-box";
      charBox.style.width = "220px";
      charBox.style.height = "350px";
      charBox.style.margin = "10px";
      charBox.style.border = "2px solid white";
      charBox.style.borderRadius = "10px";
      charBox.style.padding = "10px";
      charBox.style.cursor = "pointer";

      const charName = document.createElement("h3");
      charName.textContent = type.name;
      charName.style.textAlign = "center";

      const charImage = document.createElement("img");
      charImage.src =
        this.game.assets[type.name.toLowerCase().replace(/\s+/g, "")].src;
      charImage.style.width = "100px";
      charImage.style.height = "100px";
      charImage.style.display = "block";
      charImage.style.margin = "0 auto";

      const statsList = document.createElement("ul");
      Object.entries(type.stats).forEach(([key, value]) => {
        const statItem = document.createElement("li");
        statItem.textContent = `${key}: ${value}`;
        statsList.appendChild(statItem);
      });

      charBox.appendChild(charName);
      charBox.appendChild(charImage);
      charBox.appendChild(statsList);

      charBox.addEventListener("click", () => {
        this.game.selectedPlayerIndex = index;
        this.hideMenu(); // First hide the menu
        setTimeout(() => {
          this.game.startGame(); // Then start game with slight delay
        }, 100);
      });

      charBox.addEventListener("mouseover", () => {
        charBox.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      });

      charBox.addEventListener("mouseout", () => {
        charBox.style.backgroundColor = "transparent";
      });

      characterContainer.appendChild(charBox);
    });

    menuContent.appendChild(title);
    menuContent.appendChild(characterContainer);

    this.menuContainer.appendChild(menuContent);
  }

  renderPauseMenu() {
    console.log("Rendering pause menu");
    this.menuContainer.innerHTML = '';
  
    const title = document.createElement("h2");
    title.textContent = "PAUSED";
    title.style.color = "white";
    title.style.fontSize = "48px";
  
    const resumeButton = this.createButton("Resume", () => {
      console.log("Resume button clicked");
      this.game.resumeGame();
    });
  
    const mainMenuButton = this.createButton("Back to Menu", () => {
      console.log("Main menu button clicked");
      this.game.returnToMainMenu();
    });
  
    this.menuContainer.appendChild(title);
    this.menuContainer.appendChild(resumeButton);
    this.menuContainer.appendChild(mainMenuButton);
  
    console.log("Pause menu rendered");
  }

  // renderGameOver() {
  //   console.log("Rendering game over menu");
  //   const title = document.createElement("h2");
  //   title.textContent = "Game Over";
  //   title.style.textAlign = "center";

  //   const score = document.createElement("p");
  //   score.textContent = `Score: ${this.game.score}`;
  //   score.style.textAlign = "center";

  //   const mainMenuButton = this.createButton("Return to Home", () => {
  //     this.game.returnToMainMenu();
  //   });

  //   this.menuContainer.appendChild(title);
  //   this.menuContainer.appendChild(score);
  //   this.menuContainer.appendChild(mainMenuButton);
  // }

  createButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.backgroundColor = "white";
    button.style.color = "black";
    button.style.border = "none";
    button.style.padding = "10px 20px";
    button.style.margin = "10px";
    button.style.fontSize = "24px";
    button.style.cursor = "pointer";
    button.style.borderRadius = "5px";
    button.addEventListener("click", (e) => {
      console.log(`Button "${text}" clicked`);
      onClick(e);
    });
    console.log(`Created button: ${text}`);
    return button;
  }
}
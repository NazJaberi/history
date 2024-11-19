// scoreService.js

class ScoreService {
  constructor() {
    this.apiUrl = 'http://localhost:5500/api/scores';
  }

  async submitScore(playerName, score, timeInSeconds) {
    const timeFormatted = this.formatTime(timeInSeconds);
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          score: score,
          time: timeFormatted
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  async getScores(page = 1, limit = 5) {
    try {
      const response = await fetch(`${this.apiUrl}?page=${page}&limit=${limit}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch scores');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching scores:', error);
      throw error;
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

class ScoreboardUI {
  constructor(game) {
    this.game = game;
    this.scoreService = new ScoreService();
    this.currentPage = 1;
    this.totalPages = 1;
  }

  async showScoreSubmission() {
    try {
      // First get the player's name
      const playerName = await this.promptPlayerName();
      if (!playerName) return;

      // Then show game over screen
      await this.showGameOver(playerName);

      // Calculate game time and submit score
      const gameTimeSeconds = Math.floor((performance.now() - this.game.startTime) / 1000);
      const result = await this.scoreService.submitScore(
        playerName,
        this.game.score,
        gameTimeSeconds
      );
      
      // Finally show the scoreboard
      await this.showScoreboard(result.rank, result.percentile, playerName);
    } catch (error) {
      console.error('Failed to submit score:', error);
      await this.showError('Unable to submit score. Please check your internet connection and try again.');
    }
  }

  promptPlayerName() {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'score-overlay';
      overlay.innerHTML = `
        <div class="score-input-container">
          <h2>Enter Your Name</h2>
          <input type="text" 
                 id="playerNameInput" 
                 maxlength="10" 
                 placeholder="Your name"
                 autocomplete="off">
          <button id="submitNameBtn" class="score-button">Submit</button>
        </div>
      `;
  
      document.body.appendChild(overlay);
  
      const input = overlay.querySelector('#playerNameInput');
      const submitBtn = overlay.querySelector('#submitNameBtn');
  
      input.focus();
  
      const handleSubmit = () => {
        const name = input.value.trim();
        if (name) {
          overlay.classList.add('fade-out');
          setTimeout(() => {
            overlay.remove();
            resolve(name);
          }, 500);
        }
      };
  
      submitBtn.addEventListener('click', handleSubmit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
      });
    });
  }
  
  showGameOver(playerName) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'score-overlay';
      overlay.innerHTML = `
        <div class="score-input-container">
          <h2>Game Over</h2>
          <div class="player-info">
            <div class="player-name">Player: ${playerName}</div>
            <div class="score-display">Final Score: ${this.game.score}</div>
          </div>
          <button id="continueBtn" class="score-button">Continue</button>
          <button id="returnHomeBtn" class="score-button">Return to Home</button>
        </div>
      `;
  
      document.body.appendChild(overlay);
  
      const continueBtn = overlay.querySelector('#continueBtn');
      const returnHomeBtn = overlay.querySelector('#returnHomeBtn');
  
      continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          resolve(true);
        }, 500);
      });
  
      returnHomeBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(false);
        this.game.returnToMainMenu();
      });
    });
  }

  createScoreTable(scores) {
    const table = document.createElement('table');
    table.className = 'scoreboard-table';
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Score</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${scores.map((score, index) => `
          <tr>
            <td>${this.getOrdinal(score.rank)}</td>
            <td>${score.name}</td>
            <td>${score.score}</td>
            <td>${score.time}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    return table;
  }

  createPagination(totalPages) {
    this.totalPages = totalPages;
    
    const pagination = document.createElement('div');
    pagination.className = 'scoreboard-pagination';
    
    const prevButton = document.createElement('button');
    prevButton.textContent = '<';
    prevButton.className = 'score-button';
    prevButton.disabled = this.currentPage === 1;
    prevButton.addEventListener('click', () => this.changePage(-1));

    const nextButton = document.createElement('button');
    nextButton.textContent = '>';
    nextButton.className = 'score-button';
    nextButton.disabled = this.currentPage === totalPages;
    nextButton.addEventListener('click', () => this.changePage(1));

    const pageText = document.createElement('span');
    pageText.textContent = `Page ${this.currentPage}/${totalPages}`;

    pagination.appendChild(prevButton);
    pagination.appendChild(pageText);
    pagination.appendChild(nextButton);

    return pagination;
  }

  async showScoreboard(playerRank, percentile, playerName) {
    // Only show scoreboard if player didn't return to home
    if (!playerRank || !percentile) return;
  
    const scoreData = await this.scoreService.getScores(this.currentPage);
    
    const overlay = document.createElement('div');
    overlay.className = 'score-overlay';
    
    const content = document.createElement('div');
    content.className = 'scoreboard-content';
    
    content.innerHTML = `
      <h2>Congratulations ${playerName}!</h2>
      <p class="rank-info">You are in the top ${percentile}%, on the ${this.getOrdinal(playerRank)} position.</p>
    `;
  
    const table = this.createScoreTable(scoreData.scores);
    const pagination = this.createPagination(scoreData.totalPages);
  
    content.appendChild(table);
    content.appendChild(pagination);
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Return to Menu';
    closeButton.className = 'score-button';
    closeButton.addEventListener('click', () => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        this.game.returnToMainMenu();
      }, 500);
    });
    content.appendChild(closeButton);
  
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  }

  async changePage(delta) {
    this.currentPage = Math.max(1, Math.min(this.currentPage + delta, this.totalPages));
    const scoreData = await this.scoreService.getScores(this.currentPage);
    const overlay = document.querySelector('.score-overlay');
    if (overlay) {
      const content = overlay.querySelector('.scoreboard-content');
      content.innerHTML = '';
      
      const table = this.createScoreTable(scoreData.scores);
      const pagination = this.createPagination(scoreData.totalPages);
      
      content.appendChild(table);
      content.appendChild(pagination);
      
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Return to Menu';
      closeButton.className = 'score-button';
      closeButton.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          this.game.returnToMainMenu();
        }, 500);
      });
      content.appendChild(closeButton);
    }
  }

  getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  async showError(message) {
    const overlay = document.createElement('div');
    overlay.className = 'score-overlay';
    overlay.innerHTML = `
      <div class="score-input-container">
        <h2>Error</h2>
        <p>${message}</p>
        <button id="errorOkBtn" class="score-button">OK</button>
      </div>
    `;
  
    document.body.appendChild(overlay);
    
    const button = overlay.querySelector('#errorOkBtn');
    button.addEventListener('click', () => overlay.remove());
  }
}
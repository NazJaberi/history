// storyService.js

class StoryService {
    constructor(game) {
      this.game = game;
      this.currentStage = 0;
      this.storyStages = [
        { score: 0, stage: 'intro' },
        { score: 100, stage: 'development1' },
        { score: 200, stage: 'development2' },
        { score: 300, stage: 'victory' }
      ];
      
      this.storyContent = {
        intro: {
          title: "The Last Line of Defense",
          content: `Earth's orbital defenses have fallen. You are humanity's final pilot, 
          commanding our most advanced starfighter.
  
          Our long-range scanners have detected five cosmic entities approaching: 
          the Mothership, Quantum Shifter, Hive Mind, Techno Titan, and Cosmic Hydra.
          
          Your mission: Hold them back while we evacuate Earth's population.
          The fate of humanity rests in your hands.`
        },
        development1: {
          title: "First Wave Repelled",
          content: `Impressive flying, pilot! The first wave is scattered, but our 
          scanners show the Quantum Shifter preparing dimensional rifts.
          
          If they succeed, the invasion will escalate beyond our defenses.
          The evacuation is only 30% complete. Hold the line!`
        },
        development2: {
          title: "The Truth Emerges",
          content: `Captain, we've decoded their transmissions! These beings... 
          they're running from something worse. Something that devours dimensions.
          
          But their "salvation" would destroy our reality. Whatever comes, 
          we face it on our terms. The evacuation is at 70%. Just a bit longer!`
        },
        victory: {
          title: "Humanity Survives",
          content: `Against impossible odds, you've done it! The evacuation ships 
          have jumped to safety, and the dimensional beings are retreating.
          
          Your courage has given humanity a chance to fight another day. 
          The legend of Earth's last defender will live forever.`
        },
        defeat: {
          title: "The Fall",
          content: `Despite your heroic efforts, Earth's defenses are overwhelmed. 
          The dimensional merge has begun, warping our reality.
          
          Yet hope remains - your sacrifice bought enough time for some evacuation 
          ships to escape. Humanity survives, thanks to your courage.`
        }
      };
    }
  
    checkProgress() {
      const currentScore = this.game.score;
      const nextStage = this.storyStages[this.currentStage];
  
      if (nextStage && currentScore >= nextStage.score) {
        this.game.isPaused = true;
        this.showStoryDialog(nextStage.stage).then(() => {
          this.game.isPaused = false;
          this.currentStage++;
        });
      }
    }
  
    showStoryDialog(stage) {
      return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'story-overlay';
        
        overlay.innerHTML = `
          <div class="story-dialog">
            <h2>${this.storyContent[stage].title}</h2>
            <div class="story-text">
              ${this.storyContent[stage].content.split('\n').map(p => 
                `<p>${p.trim()}</p>`).join('')}
            </div>
            <button class="story-continue">Continue</button>
          </div>
        `;
        
        document.body.appendChild(overlay);
        
        const continueBtn = overlay.querySelector('.story-continue');
        continueBtn.addEventListener('click', () => {
          overlay.classList.add('fade-out');
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 1000);
        });
      });
    }
  
    async showIntro() {
      this.game.isPaused = true;
      await this.showStoryDialog('intro');
      this.game.isPaused = false;
    }
  
    async showEnding(victory = false) {
      this.game.isPaused = true;
      await this.showStoryDialog(victory ? 'victory' : 'defeat');
      this.game.isPaused = false;
    }
  }
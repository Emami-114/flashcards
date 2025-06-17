// Application state
class FlashcardApp {
  constructor(vocabularyData) {
    this.allCards = [...vocabularyData];
    this.filteredCards = [...vocabularyData];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.autoAdvanceEnabled = false;
    this.autoAdvanceTimer = null;
    this.timerDuration = 5;
    this.timerProgress = null;
    
    this.initializeElements();
    this.setupEventListeners();
    this.updateCard();
    this.updateProgress();
    this.updateNavigationButtons();
  }

  initializeElements() {
    // Get DOM elements
    this.flashcard = document.getElementById('flashcard');
    this.frontWord = document.getElementById('frontWord');
    this.frontPronunciation = document.getElementById('frontPronunciation');
    this.exapleSentence = document.getElementById('exampleSentence');
    this.backMeaning = document.getElementById('backMeaning');
    this.backMeaningFa = document.getElementById('meaningFa');
    this.progressText = document.getElementById('progressText');
    this.progressFill = document.getElementById('progressFill');
    this.categoryFilter = document.getElementById('categoryFilter');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.flipBtn = document.getElementById('flipBtn');
    this.shuffleBtn = document.getElementById('shuffleBtn');
    this.autoAdvanceCheckbox = document.getElementById('autoAdvance');
    this.timerSlider = document.getElementById('timerSlider');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.flashcardContainer = document.querySelector('.flashcard-container');
  }

  setupEventListeners() {
    // Card flip
    this.flashcard.addEventListener('click', () => this.flipCard());
    this.flipBtn.addEventListener('click', () => this.flipCard());

    // Navigation
    this.prevBtn.addEventListener('click', () => this.previousCard());
    this.nextBtn.addEventListener('click', () => this.nextCard());

    // Controls
    this.shuffleBtn.addEventListener('click', () => this.shuffleCards());
    this.categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));

    // Auto-advance
    this.autoAdvanceCheckbox.addEventListener('change', (e) => this.toggleAutoAdvance(e.target.checked));
    this.timerSlider.addEventListener('input', (e) => this.updateTimerDuration(parseInt(e.target.value)));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    // Prevent context menu on card
    this.flashcard.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    this.flashcard.classList.toggle('flipped', this.isFlipped);
    
    // Reset auto-advance timer when manually flipping
    if (this.autoAdvanceEnabled) {
      this.resetAutoAdvanceTimer();
    }
  }

  nextCard() {
    if (this.currentIndex < this.filteredCards.length - 1) {
      this.currentIndex++;
      this.changeCard();
    }
  }

  previousCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.changeCard();
    }
  }

  changeCard() {
    // Add transition animation
    this.flashcardContainer.classList.add('changing');
    
    setTimeout(() => {
      // Reset flip state
      this.isFlipped = false;
      this.flashcard.classList.remove('flipped');
      
      // Update card content
      this.updateCard();
      this.updateProgress();
      this.updateNavigationButtons();
      
      // Remove animation class
      this.flashcardContainer.classList.remove('changing');
      
      // Reset auto-advance timer
      if (this.autoAdvanceEnabled) {
        this.resetAutoAdvanceTimer();
      }
    }, 150);
  }

  updateCard() {
    const currentCard = this.filteredCards[this.currentIndex];
    if (currentCard) {
      this.frontWord.textContent = currentCard.word;
      this.frontPronunciation.textContent = currentCard.pronunciation;
      this.exapleSentence.textContent = currentCard.example || '';
      this.backMeaning.textContent = currentCard.meaning;
      this.backMeaningFa.textContent = currentCard.meaning_fa || '';
    }
  }

  updateProgress() {
    const current = this.currentIndex + 1;
    const total = this.filteredCards.length;
    this.progressText.textContent = `${current} von ${total}`;
    
    const percentage = (current / total) * 100;
    this.progressFill.style.width = `${percentage}%`;
  }

  updateNavigationButtons() {
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.filteredCards.length - 1;
  }

  shuffleCards() {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...this.filteredCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    this.filteredCards = shuffled;
    this.currentIndex = 0;
    this.changeCard();
    
    // Visual feedback
    this.shuffleBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      this.shuffleBtn.style.transform = '';
    }, 300);
  }

  filterByCategory(category) {
    if (category === 'all') {
      this.filteredCards = [...this.allCards];
    } else {
      this.filteredCards = this.allCards.filter(card => card.category === category);
    }
    
    this.currentIndex = 0;
    this.updateCard();
    this.updateProgress();
    this.updateNavigationButtons();
    
    // Reset flip state
    this.isFlipped = false;
    this.flashcard.classList.remove('flipped');
    
    // Reset auto-advance timer
    if (this.autoAdvanceEnabled) {
      this.resetAutoAdvanceTimer();
    }
  }

  toggleAutoAdvance(enabled) {
    this.autoAdvanceEnabled = enabled;
    
    if (enabled) {
      this.startAutoAdvanceTimer();
    } else {
      this.stopAutoAdvanceTimer();
    }
  }

  updateTimerDuration(duration) {
    this.timerDuration = duration;
    this.timerDisplay.textContent = duration;
    
    if (this.autoAdvanceEnabled) {
      this.resetAutoAdvanceTimer();
    }
  }

  startAutoAdvanceTimer() {
    this.stopAutoAdvanceTimer();
    
    const startTime = Date.now();
    const duration = this.timerDuration * 1000;
    
    // Create or update timer progress bar
    this.updateTimerProgress(0);
    
    this.autoAdvanceTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      this.updateTimerProgress(progress);
      
      if (elapsed >= duration) {
        if (!this.isFlipped) {
          // First flip the card
          this.flipCard();
          this.resetAutoAdvanceTimer();
        } else {
          // Then advance to next card
          if (this.currentIndex < this.filteredCards.length - 1) {
            this.nextCard();
          } else {
            // End of deck, stop auto-advance
            this.autoAdvanceCheckbox.checked = false;
            this.toggleAutoAdvance(false);
          }
        }
      }
    }, 50);
  }

  stopAutoAdvanceTimer() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    this.removeTimerProgress();
  }

  resetAutoAdvanceTimer() {
    if (this.autoAdvanceEnabled) {
      this.startAutoAdvanceTimer();
    }
  }

  updateTimerProgress(progress) {
    // Remove existing progress bar
    this.removeTimerProgress();
    
    // Create new progress bar
    const activeCard = this.isFlipped ? 
      this.flashcard.querySelector('.flashcard-back') : 
      this.flashcard.querySelector('.flashcard-front');
    
    const progressBar = document.createElement('div');
    progressBar.className = 'timer-progress';
    progressBar.style.width = `${progress * 100}%`;
    activeCard.appendChild(progressBar);
    
    this.timerProgress = progressBar;
  }

  removeTimerProgress() {
    if (this.timerProgress && this.timerProgress.parentNode) {
      this.timerProgress.remove();
      this.timerProgress = null;
    }
  }

  handleKeyPress(e) {
    // Don't handle keys when user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Handle different key events
    switch (e.key) {
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        this.flipCard();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.previousCard();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextCard();
        break;
      case 's':
      case 'S':
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          this.shuffleCards();
        }
        break;
    }
  }

  getCategoryDisplayName(category) {
    const categoryNames = {
      'greetings': 'Begrüßungen',
      'food_drink': 'Essen & Trinken',
      'home': 'Zuhause',
      'education': 'Bildung',
      'people': 'Menschen',
      'time': 'Zeit',
      'emotions': 'Gefühle',
      'work': 'Arbeit'
    };
    
    return categoryNames[category] || category;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  fetch('vocabulary.json')
    .then(response => response.json())
    .then(vocabularyData => {
      const app = new FlashcardApp(vocabularyData);
      
      // Add some visual feedback for card interactions
      const flashcard = document.getElementById('flashcard');
      
      // Add touch feedback
      flashcard.addEventListener('touchstart', (e) => {
        e.preventDefault();
        flashcard.style.transform = 'translateY(-2px) scale(0.98)';
      });
      
      flashcard.addEventListener('touchend', (e) => {
        e.preventDefault();
        flashcard.style.transform = '';
      });
      
      // Add mouse feedback
      flashcard.addEventListener('mousedown', () => {
        flashcard.style.transform = 'translateY(-2px) scale(0.98)';
      });
      
      flashcard.addEventListener('mouseup', () => {
        flashcard.style.transform = '';
      });
      
      flashcard.addEventListener('mouseleave', () => {
        flashcard.style.transform = '';
      });
      
      // Make the app globally accessible for debugging
      window.flashcardApp = app;
    })
    .catch(error => {
      console.error('Fehler beim Laden der Vokabeln:', error);
    });
});
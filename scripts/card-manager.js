/**
 * Card Manager
 * Handles loading pets, displaying cards, and swipe interactions
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'pet-cards';
  const JSON_URL = './db.json';

  let pets = [];
  let currentIndex = 0;

  /**
   * Load pets from localStorage first, then fallback to JSON file
   */
  async function loadPets() {
    // Try localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        pets = JSON.parse(stored);
        if (pets.length > 0) {
          return;
        }
      } catch (e) {
        console.warn('Failed to parse stored pets:', e);
      }
    }

    // Fallback to JSON file
    try {
      const response = await fetch(JSON_URL);
      if (response.ok) {
        const data = await response.json();
        pets = data.pets || [];
        // Store in localStorage for future use
        savePetsToStorage();
      }
    } catch (e) {
      console.warn('Failed to load pets from JSON:', e);
    }
  }

  /**
   * Save pets to localStorage
   */
  function savePetsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  }

  /**
   * Display the current pet card
   */
  function displayCurrentCard() {
    const cardDisplay = document.querySelector('.card-display');
    const emptyState = document.querySelector('.empty-state');
    const existingCard = cardDisplay.querySelector('pet-card');

    // Remove existing card
    if (existingCard) {
      existingCard.remove();
    }

    // Check if there are pets to display
    if (pets.length === 0 || currentIndex >= pets.length) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    // Create new pet card
    const petCard = document.createElement('pet-card');
    petCard.setPetData(pets[currentIndex]);
    petCard.classList.add('entering');

    // Insert before reaction overlays
    const reactionOverlay = cardDisplay.querySelector('.reaction-overlay');
    cardDisplay.insertBefore(petCard, reactionOverlay);

    // Remove entering animation class after animation completes
    petCard.addEventListener('animationend', function() {
      petCard.classList.remove('entering');
    }, { once: true });
  }

  /**
   * Show reaction animation and advance to next card
   */
  function handleSwipe(direction) {
    const cardDisplay = document.querySelector('.card-display');
    const currentCard = cardDisplay.querySelector('pet-card');
    const overlay = cardDisplay.querySelector(`.reaction-overlay.${direction}`);

    if (!currentCard || currentIndex >= pets.length) return;

    // Show reaction overlay animation
    overlay.classList.add('animate');

    // Add swipe animation to card
    currentCard.classList.add(`swipe-${direction === 'like' ? 'right' : 'left'}`);

    // Wait for animations to complete
    setTimeout(function() {
      overlay.classList.remove('animate');
      currentIndex++;
      displayCurrentCard();
    }, 600);
  }

  /**
   * Initialize card manager
   */
  async function init() {
    await loadPets();
    displayCurrentCard();

    // Set up swipe button listeners
    const likeButton = document.querySelector('.swipe-button.like');
    const dislikeButton = document.querySelector('.swipe-button.dislike');

    if (likeButton) {
      likeButton.addEventListener('click', function() {
        handleSwipe('like');
      });
    }

    if (dislikeButton) {
      dislikeButton.addEventListener('click', function() {
        handleSwipe('dislike');
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for potential external use
  window.CardManager = {
    loadPets: loadPets,
    displayCurrentCard: displayCurrentCard,
    resetCards: function() {
      currentIndex = 0;
      displayCurrentCard();
    }
  };

})();


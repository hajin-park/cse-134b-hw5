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

  function displayCurrentCard() {
    const cardContainer = document.querySelector('.card-container');
    const emptyState = document.querySelector('.empty-state');
    const existingCard = cardContainer.querySelector('pet-card');

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
    const reactionOverlay = cardContainer.querySelector('.reaction-overlay');
    cardContainer.insertBefore(petCard, reactionOverlay);

    // Remove entering animation class after animation completes
    petCard.addEventListener('animationend', function() {
      petCard.classList.remove('entering');
    }, { once: true });
  }

  function handleSwipe(direction) {
    const cardContainer = document.querySelector('.card-container');
    const currentCard = cardContainer.querySelector('pet-card');
    const overlay = cardContainer.querySelector(`.reaction-overlay.${direction}`);

    if (!currentCard || pets.length === 0) return;

    // Show reaction overlay animation
    overlay.classList.add('animate');

    // Add swipe animation to card
    currentCard.classList.add(`swipe-${direction === 'like' ? 'right' : 'left'}`);

    // Wait for animations to complete
    setTimeout(function() {
      overlay.classList.remove('animate');
      // Wrap around to first card when reaching the end
      currentIndex = (currentIndex + 1) % pets.length;
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
    const cardDisplay = document.querySelector('.card-display');
    const likeButton = cardDisplay.querySelector('.swipe-button.like');
    const dislikeButton = cardDisplay.querySelector('.swipe-button.dislike');

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


/**
 * Card Manager
 * Handles loading pets, displaying cards, and swipe interactions
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'pet-cards';
  const REMOTE_API_URL = 'https://my-json-server.typicode.com/hajin-park/cse-134b-hw5/pets';

  let pets = [];
  let currentIndex = 0;
  let currentSource = null; // 'local' or 'remote'

  function loadLocalPets() {
    currentSource = 'local';
    currentIndex = 0;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        pets = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored pets:', e);
        pets = [];
      }
    } else {
      pets = [];
    }
    displayCurrentCard();
    updateLoadButtonState();
  }

  async function loadRemotePets() {
    currentSource = 'remote';
    currentIndex = 0;
    try {
      const response = await fetch(REMOTE_API_URL);
      if (response.ok) {
        pets = await response.json();
      } else {
        console.warn('Failed to fetch remote pets:', response.status);
        pets = [];
      }
    } catch (e) {
      console.warn('Failed to load pets from remote:', e);
      pets = [];
    }
    displayCurrentCard();
    updateLoadButtonState();
  }

  /**
   * Update load button visual state to show active source
   */
  function updateLoadButtonState() {
    const localBtn = document.getElementById('load-local-btn');
    const remoteBtn = document.getElementById('load-remote-btn');

    if (localBtn) {
      localBtn.classList.toggle('active', currentSource === 'local');
    }
    if (remoteBtn) {
      remoteBtn.classList.toggle('active', currentSource === 'remote');
    }
  }

  function displayCurrentCard() {
    const cardContainer = document.querySelector('.card-container');
    const emptyState = document.querySelector('.empty-state');
    const existingCard = cardContainer.querySelector('pet-card');

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

  function init() {
    // Set up swipe button listeners using event delegation on card-display
    const cardDisplay = document.querySelector('.card-display');

    if (cardDisplay) {
      cardDisplay.addEventListener('click', function(e) {
        const likeButton = e.target.closest('.swipe-button.like');
        const dislikeButton = e.target.closest('.swipe-button.dislike');

        if (likeButton) {
          handleSwipe('like');
        } else if (dislikeButton) {
          handleSwipe('dislike');
        }
      });
    }

    // Set up load button listeners
    const loadLocalBtn = document.getElementById('load-local-btn');
    const loadRemoteBtn = document.getElementById('load-remote-btn');

    if (loadLocalBtn) {
      loadLocalBtn.addEventListener('click', loadLocalPets);
    }

    if (loadRemoteBtn) {
      loadRemoteBtn.addEventListener('click', loadRemotePets);
    }

    // Show empty state initially - user must click load button
    displayCurrentCard();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for potential external use
  window.CardManager = {
    loadLocalPets: loadLocalPets,
    loadRemotePets: loadRemotePets,
    displayCurrentCard: displayCurrentCard,
    resetCards: function() {
      currentIndex = 0;
      displayCurrentCard();
    },
    getCurrentSource: function() {
      return currentSource;
    }
  };

})();


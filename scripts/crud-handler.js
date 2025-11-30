/**
 * CRUD Handler
 * Handles Create, Read, Update, Delete operations for pet profiles
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'pet-cards';
  const REMOTE_API_URL = 'https://my-json-server.typicode.com/hajin-park/cse-134b-hw5/pets';

  /**
   * Get the current mode from the page
   */
  function getMode() {
    return document.body.dataset.crudMode || 'local';
  }

  /**
   * Local Storage Operations
   */
  const LocalStorage = {
    getAll: function() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.warn('Failed to parse stored pets:', e);
          return [];
        }
      }
      return [];
    },

    save: function(pets) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    },

    create: function(pet) {
      const pets = this.getAll();
      const maxId = pets.reduce((max, p) => Math.max(max, p.id || 0), 0);
      pet.id = maxId + 1;
      pets.push(pet);
      this.save(pets);
      return pet;
    },

    update: function(id, updatedPet) {
      const pets = this.getAll();
      const index = pets.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        pets[index] = { ...pets[index], ...updatedPet, id: parseInt(id) };
        this.save(pets);
        return pets[index];
      }
      return null;
    },

    delete: function(id) {
      const pets = this.getAll();
      const filteredPets = pets.filter(p => p.id !== parseInt(id));
      if (filteredPets.length < pets.length) {
        this.save(filteredPets);
        return true;
      }
      return false;
    }
  };

  /**
   * Remote API Operations
   */
  const RemoteAPI = {
    getAll: async function() {
      try {
        const response = await fetch(REMOTE_API_URL);
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('Failed to fetch remote pets:', e);
      }
      return [];
    },

    create: async function(pet) {
      try {
        const response = await fetch(REMOTE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pet)
        });
        if (response.ok || response.status === 201) {
          return await response.json();
        }
      } catch (e) {
        console.warn('Failed to create pet:', e);
      }
      return null;
    },

    update: async function(id, updatedPet) {
      try {
        const response = await fetch(`${REMOTE_API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updatedPet, id: parseInt(id) })
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('Failed to update pet:', e);
      }
      return null;
    },

    delete: async function(id) {
      try {
        const response = await fetch(`${REMOTE_API_URL}/${id}`, {
          method: 'DELETE'
        });
        return response.ok;
      } catch (e) {
        console.warn('Failed to delete pet:', e);
      }
      return false;
    }
  };

  /**
   * Parse form data into pet object
   */
  function parseFormData(form) {
    const formData = new FormData(form);
    return {
      title: formData.get('title'),
      birthdate: formData.get('birthdate'),
      description: formData.get('description'),
      species: formData.get('species'),
      strengths: formData.get('strengths') ? formData.get('strengths').split(',').map(s => s.trim()).filter(Boolean) : [],
      weaknesses: formData.get('weaknesses') ? formData.get('weaknesses').split(',').map(s => s.trim()).filter(Boolean) : [],
      compatibility: formData.get('compatibility'),
      imageURL: formData.get('imageURL')
    };
  }

  /**
   * Show status message
   */
  function showStatus(formSection, message, isSuccess) {
    let statusEl = formSection.querySelector('.status-message');
    if (!statusEl) {
      statusEl = document.createElement('output');
      statusEl.className = 'status-message';
      formSection.appendChild(statusEl);
    }
    statusEl.textContent = message;
    statusEl.className = `status-message ${isSuccess ? 'success' : 'error'}`;
    statusEl.hidden = false;
    setTimeout(() => { statusEl.hidden = true; }, 3000);
  }


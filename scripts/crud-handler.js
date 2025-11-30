/**
 * CRUD Handler
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'pet-cards';
  const REMOTE_API_URL = 'https://my-json-server.typicode.com/hajin-park/cse-134b-hw5/pets';

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
   * My JSON Server Operations
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

  /**
   * Render pet list for selection
   */
  async function renderPetList(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const mode = getMode();
    const pets = mode === 'local' ? LocalStorage.getAll() : await RemoteAPI.getAll();

    if (pets.length === 0) {
      container.innerHTML = '<p class="pet-list-empty">No pets found. Create one first.</p>';
      return;
    }

    container.innerHTML = pets.map(pet => `
      <article class="pet-list-item">
        <input type="radio" name="pet-select" id="pet-${pet.id}" value="${pet.id}" required>
        <label for="pet-${pet.id}">${pet.title} (${pet.species})</label>
      </article>
    `).join('');
  }

  function getSelectedPetId() {
    const selected = document.querySelector('input[name="pet-select"]:checked');
    return selected ? parseInt(selected.value) : null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    const form = e.target;
    const formSection = form.closest('.form-section');
    const pet = parseFormData(form);
    const mode = getMode();

    let result;
    if (mode === 'local') {
      result = LocalStorage.create(pet);
    } else {
      result = await RemoteAPI.create(pet);
    }

    if (result) {
      showStatus(formSection, `Pet "${pet.title}" created successfully!`, true);
      form.reset();
      renderPetList('.update-pet-list');
      renderPetList('.delete-pet-list');
    } else {
      showStatus(formSection, 'Failed to create pet. Please try again.', false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const formSection = form.closest('.form-section');
    const petId = getSelectedPetId();

    if (!petId) {
      showStatus(formSection, 'Please select a pet to update.', false);
      return;
    }

    const pet = parseFormData(form);
    const mode = getMode();

    let result;
    if (mode === 'local') {
      result = LocalStorage.update(petId, pet);
    } else {
      result = await RemoteAPI.update(petId, pet);
    }

    if (result) {
      showStatus(formSection, `Pet updated successfully!`, true);
      form.reset();
      renderPetList('.update-pet-list');
      renderPetList('.delete-pet-list');
    } else {
      showStatus(formSection, 'Failed to update pet. Please try again.', false);
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    const form = e.target;
    const formSection = form.closest('.form-section');
    const petId = getSelectedPetId();

    if (!petId) {
      showStatus(formSection, 'Please select a pet to delete.', false);
      return;
    }

    const mode = getMode();
    let result;
    if (mode === 'local') {
      result = LocalStorage.delete(petId);
    } else {
      result = await RemoteAPI.delete(petId);
    }

    if (result) {
      showStatus(formSection, 'Pet deleted successfully!', true);
      renderPetList('.update-pet-list');
      renderPetList('.delete-pet-list');
    } else {
      showStatus(formSection, 'Failed to delete pet. Please try again.', false);
    }
  }

  async function loadPetDataForUpdate(petId) {
    const mode = getMode();
    const pets = mode === 'local' ? LocalStorage.getAll() : await RemoteAPI.getAll();
    const pet = pets.find(p => p.id === petId);

    if (!pet) return;

    const form = document.getElementById('update-form');
    if (!form) return;

    form.querySelector('[name="title"]').value = pet.title || '';
    form.querySelector('[name="birthdate"]').value = pet.birthdate || '';
    form.querySelector('[name="description"]').value = pet.description || '';
    form.querySelector('[name="species"]').value = pet.species || '';
    form.querySelector('[name="strengths"]').value = (pet.strengths || []).join(', ');
    form.querySelector('[name="weaknesses"]').value = (pet.weaknesses || []).join(', ');
    form.querySelector('[name="compatibility"]').value = pet.compatibility || '';
    form.querySelector('[name="imageURL"]').value = pet.imageURL || '';
  }

  function init() {
    // Create form handler
    const createForm = document.getElementById('create-form');
    if (createForm) {
      createForm.addEventListener('submit', handleCreate);
    }

    // Update form handler
    const updateForm = document.getElementById('update-form');
    if (updateForm) {
      updateForm.addEventListener('submit', handleUpdate);
    }

    // Delete form handler
    const deleteForm = document.getElementById('delete-form');
    if (deleteForm) {
      deleteForm.addEventListener('submit', handleDelete);
    }

    // Event delegation for pet list selection (for update)
    const updatePetList = document.querySelector('.update-pet-list');
    if (updatePetList) {
      updatePetList.addEventListener('change', function(e) {
        if (e.target.matches('input[name="pet-select"]')) {
          loadPetDataForUpdate(parseInt(e.target.value));
        }
      });
    }

    // Initial render of pet lists
    renderPetList('.update-pet-list');
    renderPetList('.delete-pet-list');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CRUDHandler = {
    LocalStorage: LocalStorage,
    RemoteAPI: RemoteAPI,
    renderPetList: renderPetList
  };

})();

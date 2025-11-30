/**
 * PetCard Custom Element
 */
class PetCard extends HTMLElement {
  static get observedAttributes() {
    return ['pet-id', 'title', 'birthdate', 'description', 'species', 'strengths', 'weaknesses', 'compatibility', 'image-url'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  /**
   * Calculate age from birthdate
   */
  calculateAge(birthdate) {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Parse JSON array from attribute string
   */
  parseArrayAttribute(value) {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  /**
   * Create the card's internal HTML structure using semantic elements
   */
  render() {
    const title = this.getAttribute('title') || 'Unknown Pet';
    const birthdate = this.getAttribute('birthdate');
    const description = this.getAttribute('description') || '';
    const species = this.getAttribute('species') || '';
    const strengths = this.parseArrayAttribute(this.getAttribute('strengths'));
    const weaknesses = this.parseArrayAttribute(this.getAttribute('weaknesses'));
    const compatibility = this.getAttribute('compatibility') || '';
    const imageUrl = this.getAttribute('image-url') || '';

    const age = this.calculateAge(birthdate);
    const ageText = age !== null ? `${age} years old` : '';

    this.innerHTML = `
      <article class="pet-card-content">
        <figure class="pet-card-image">
          <picture>
            <source srcset="${imageUrl}" type="image/jpeg">
            <img src="${imageUrl}" alt="Photo of ${title}, a ${species}" loading="lazy">
          </picture>
        </figure>
        
        <header class="pet-card-header">
          <h2>${title}</h2>
          ${species ? `<span class="pet-species">${species}</span>` : ''}
          ${birthdate ? `<time datetime="${birthdate}">${ageText}</time>` : ''}
        </header>
        
        <section class="pet-card-body">
          <p class="pet-description">${description}</p>
          
          ${strengths.length > 0 ? `
          <aside class="pet-traits">
            <h3>Strengths</h3>
            <ul class="trait-list strengths">
              ${strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </aside>
          ` : ''}
          
          ${weaknesses.length > 0 ? `
          <aside class="pet-traits">
            <h3>Weaknesses</h3>
            <ul class="trait-list weaknesses">
              ${weaknesses.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </aside>
          ` : ''}
          
          ${compatibility ? `
          <aside class="pet-compatibility">
            <h3>Compatibility</h3>
            <p>${compatibility}</p>
          </aside>
          ` : ''}
        </section>
        
        <footer class="pet-card-footer">
          <a href="#" class="pet-link" aria-label="Learn more about ${title}">Learn more about ${title}</a>
        </footer>
      </article>
    `;
  }

  /**
   * Set pet data from a JavaScript object (for dynamic creation)
   */
  setPetData(petData) {
    if (petData.id) this.setAttribute('pet-id', petData.id);
    if (petData.title) this.setAttribute('title', petData.title);
    if (petData.birthdate) this.setAttribute('birthdate', petData.birthdate);
    if (petData.description) this.setAttribute('description', petData.description);
    if (petData.species) this.setAttribute('species', petData.species);
    if (petData.strengths) this.setAttribute('strengths', JSON.stringify(petData.strengths));
    if (petData.weaknesses) this.setAttribute('weaknesses', JSON.stringify(petData.weaknesses));
    if (petData.compatibility) this.setAttribute('compatibility', petData.compatibility);
    if (petData.imageURL) this.setAttribute('image-url', petData.imageURL);
  }
}

// Register the custom element
customElements.define('pet-card', PetCard);


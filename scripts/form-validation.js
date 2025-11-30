(function () {
  'use strict';

  const FormValidation = {
    validateField(input) {
      const value = input.value.trim();
      const fieldName = input.name;
      const errors = [];

      if (input.hasAttribute('required') && !value) {
        errors.push(`${this.getFieldLabel(input)} is required`);
        return { valid: false, errors };
      }

      if (value && input.minLength > 0 && value.length < input.minLength) {
        errors.push(`${this.getFieldLabel(input)} must be at least ${input.minLength} characters`);
      }

      if (value && input.maxLength > 0 && value.length > input.maxLength) {
        errors.push(`${this.getFieldLabel(input)} must be no more than ${input.maxLength} characters`);
      }

      if (input.type === 'url' && value) {
        try {
          new URL(value);
        } catch {
          errors.push(`${this.getFieldLabel(input)} must be a valid URL`);
        }
      }

      if (input.type === 'date' && value) {
        const date = new Date(value);
        const today = new Date();
        if (date > today) {
          errors.push('Birthdate cannot be in the future');
        }
      }

      if ((fieldName === 'strengths' || fieldName === 'weaknesses') && value) {
        const items = value.split(',').map(item => item.trim()).filter(item => item);
        if (items.length > 10) {
          errors.push(`${this.getFieldLabel(input)} cannot have more than 10 items`);
        }
      }

      return { valid: errors.length === 0, errors };
    },

    getFieldLabel(input) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        return label.textContent.replace('*', '').trim();
      }
      return input.name.charAt(0).toUpperCase() + input.name.slice(1);
    },

    validateForm(form) {
      const inputs = form.querySelectorAll('input, textarea, select');
      const allErrors = [];
      let isValid = true;

      this.clearAllErrors(form);

      inputs.forEach(input => {
        const result = this.validateField(input);
        if (!result.valid) {
          isValid = false;
          allErrors.push(...result.errors);
          this.showFieldError(input, result.errors[0]);
        }
      });

      return { valid: isValid, errors: allErrors };
    },

    showFieldError(input, message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');

      const errorId = `${input.id}-error`;
      let errorEl = document.getElementById(errorId);

      if (!errorEl) {
        errorEl = document.createElement('small');
        errorEl.id = errorId;
        errorEl.className = 'form-error';
        errorEl.setAttribute('role', 'alert');
        input.parentNode.appendChild(errorEl);
      }

      errorEl.textContent = message;
      input.setAttribute('aria-describedby', errorId);
    },

    clearFieldError(input) {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');

      const errorEl = document.getElementById(`${input.id}-error`);
      if (errorEl) {
        errorEl.remove();
      }
      input.removeAttribute('aria-describedby');
    },

    clearAllErrors(form) {
      form.querySelectorAll('.invalid').forEach(el => {
        el.classList.remove('invalid');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      });
      form.querySelectorAll('.form-error').forEach(el => el.remove());
    },

    setupLiveValidation(form) {
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          const result = this.validateField(input);
          if (!result.valid) {
            this.showFieldError(input, result.errors[0]);
          } else {
            this.clearFieldError(input);
          }
        });

        input.addEventListener('input', () => {
          if (input.classList.contains('invalid')) {
            const result = this.validateField(input);
            if (result.valid) {
              this.clearFieldError(input);
            }
          }
        });
      });
    },

    init() {
      document.querySelectorAll('.crud-form').forEach(form => {
        this.setupLiveValidation(form);
      });
    }
  };

  if (typeof window !== 'undefined') {
    window.FormValidation = FormValidation;
  }

  document.addEventListener('DOMContentLoaded', () => {
    FormValidation.init();
  });
})();


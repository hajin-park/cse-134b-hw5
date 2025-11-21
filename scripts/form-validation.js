(function() {
  'use strict';

  let form_errors = [];

  // form elements
  const form = document.querySelector('.contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const commentsTextarea = document.getElementById('comments');
  const errorOutput = document.getElementById('error-output');
  const infoOutput = document.getElementById('info-output');
  const charCounter = document.getElementById('char-count');
  const submitButton = form.querySelector('button[type="submit"]');

  // char counter for textarea
  function updateCharCounter() {
    const currentLength = commentsTextarea.value.length;
    const maxLength = commentsTextarea.maxLength;
    charCounter.textContent = currentLength;

    // warning when near limit
    const counterElement = document.getElementById('char-counter');
    if (currentLength >= maxLength * 0.9) {
      counterElement.classList.add('char-counter-warning');
    } else {
      counterElement.classList.remove('char-counter-warning');
    }

    // message when approaching limit
    if (currentLength >= maxLength * 0.9 && currentLength < maxLength) {
      showInfoMessage(`You are approaching the character limit (${currentLength}/${maxLength})`);
    } else if (currentLength >= maxLength) {
      showErrorMessage(`Character limit reached! (${maxLength}/${maxLength})`);
    }
  }

  //  show message for disallowed characters
  function handleDisallowedChar(input, char) {
    input.classList.add('flash-error');
    showErrorMessage(`Illegal character detected: "${char}" is not allowed in this field`, 3000);
    
    setTimeout(() => {
      input.classList.remove('flash-error');
    }, 300);
  }

  // validate input with pattern
  function validateInputChar(input, char) {
    const pattern = input.getAttribute('pattern');
    if (pattern && input.type === 'text') {
      const regex = new RegExp(`^[${pattern.slice(1, -2)}]$`);
      if (!regex.test(char)) {
        return false;
      }
    }
    return true;
  }

  // error message
  function showErrorMessage(message, duration = null) {
    errorOutput.textContent = message;
    if (duration) {
      setTimeout(() => {
        errorOutput.textContent = '';
      }, duration);
    }
  }

  // info message
  function showInfoMessage(message, duration = null) {
    infoOutput.textContent = message;
    if (duration) {
      setTimeout(() => {
        infoOutput.textContent = '';
      }, duration);
    }
  }

  // validation messages
  function setCustomValidationMessage(input) {
    if (input.validity.valueMissing) {
      input.setCustomValidity('This field is required. Please fill it out.');
    } else if (input.validity.typeMismatch && input.type === 'email') {
      input.setCustomValidity('Please enter a valid email address (e.g., user@example.com)');
    } else if (input.validity.tooShort) {
      input.setCustomValidity(`Please enter at least ${input.minLength} characters. You currently have ${input.value.length} characters.`);
    } else if (input.validity.tooLong) {
      input.setCustomValidity(`Please enter no more than ${input.maxLength} characters. You currently have ${input.value.length} characters.`);
    } else if (input.validity.patternMismatch) {
      if (input.id === 'name') {
        input.setCustomValidity('Please enter a valid name (letters, spaces, hyphens, and apostrophes only)');
      } else {
        input.setCustomValidity('Please match the requested format');
      }
    } else {
      input.setCustomValidity('');
    }
  }

  nameInput.addEventListener('input', function(e) {
    const lastChar = e.data;
    if (lastChar && !validateInputChar(this, lastChar)) {
      handleDisallowedChar(this, lastChar);
      this.value = this.value.slice(0, -1);
    }
  });


  commentsTextarea.addEventListener('input', updateCharCounter);

  // Track if a submission is being attempted
  let isSubmitting = false;

  // Set flag when submit button is clicked (before validation happens)
  submitButton.addEventListener('click', function() {
    isSubmitting = true;
  });

  [nameInput, emailInput, subjectInput, commentsTextarea].forEach(input => {
    input.addEventListener('invalid', function() {
      setCustomValidationMessage(this);

      // Record error only during submission attempts
      if (isSubmitting) {
        form_errors.push({
          field: this.name,
          value: this.value,
          error: this.validationMessage,
          timestamp: new Date().toISOString()
        });
      }
    });

    input.addEventListener('input', function() {
      setCustomValidationMessage(this);
      if (this.checkValidity()) {
        errorOutput.textContent = '';
      }
    });
  });

  // Set flag before form validation happens
  form.addEventListener('submit', function(e) {
    // Set flag FIRST so invalid events can record errors
    isSubmitting = true;

    // Clear output messages but NOT form_errors array
    errorOutput.textContent = '';
    infoOutput.textContent = '';

    // The browser will automatically validate and trigger 'invalid' events
    // If validation fails, the browser prevents submission automatically
    // Our invalid event listeners will record the errors

    // Check if form is valid (this happens after invalid events fire)
    if (!form.checkValidity()) {
      // Form has errors - browser already showed native validation messages
      // Errors were recorded in the 'invalid' event listeners
      e.preventDefault(); // Ensure submission is prevented
      isSubmitting = false;
      return;
    }

    // Form is valid - add form-errors as hidden field with all accumulated errors
    // Remove any existing form-errors field first to prevent duplicates
    const existingErrorsInput = form.querySelector('input[name="form-errors"]');
    if (existingErrorsInput) {
      existingErrorsInput.remove();
    }

    const formErrorsInput = document.createElement('input');
    formErrorsInput.type = 'hidden';
    formErrorsInput.name = 'form-errors';
    formErrorsInput.value = JSON.stringify(form_errors);
    form.appendChild(formErrorsInput);

    // show success message
    showInfoMessage('Form is valid! Submitting...', 2000);

    // Reset flag
    isSubmitting = false;

    // Let the form submit naturally
  });

  updateCharCounter();

  setTimeout(() => {
    showInfoMessage('Please fill out all required fields marked with *', 5000);
  }, 500);

})();


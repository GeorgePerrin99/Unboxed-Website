class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('button[type="reset"]');
    this.placeholderValues = [];
    this.placeholderIndex = 0;
    this.placeholderInterval = null;

    if (this.input) {
      this.initPlaceholderRotation();
      this.input.form.addEventListener('reset', this.onFormReset.bind(this));
      this.input.addEventListener('input', debounce((event) => {
        this.onChange(event);
      }, 300).bind(this))
    }
  }

  disconnectedCallback() {
    this.stopPlaceholderRotation();
  }

  initPlaceholderRotation() {
    const rotationSource = this.input.dataset.placeholderRotation;

    if (!rotationSource) return;

    this.placeholderValues = rotationSource
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!this.placeholderValues.length) return;

    this.input.setAttribute('placeholder', this.placeholderValues[this.placeholderIndex]);
    this.input.addEventListener('focus', this.handlePlaceholderFocus.bind(this));
    this.input.addEventListener('blur', this.handlePlaceholderBlur.bind(this));

    if (!this.input.value.length) {
      this.startPlaceholderRotation();
    }
  }

  handlePlaceholderFocus() {
    this.stopPlaceholderRotation();
  }

  handlePlaceholderBlur() {
    if (this.input.value.length) return;

    this.updateRotatingPlaceholder(true);
    this.startPlaceholderRotation();
  }

  updateRotatingPlaceholder(force = false) {
    if (!this.placeholderValues.length) return;
    if (!force && (document.activeElement === this.input || this.input.value.length > 0)) return;

    this.input.setAttribute('placeholder', this.placeholderValues[this.placeholderIndex]);
  }

  startPlaceholderRotation() {
    if (!this.placeholderValues.length || this.placeholderValues.length === 1 || this.placeholderInterval) return;

    this.placeholderInterval = window.setInterval(() => {
      if (document.activeElement === this.input || this.input.value.length > 0) return;

      this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholderValues.length;
      this.updateRotatingPlaceholder(true);
    }, 2200);
  }

  stopPlaceholderRotation() {
    if (!this.placeholderInterval) return;

    window.clearInterval(this.placeholderInterval);
    this.placeholderInterval = null;
  }

  toggleResetButton() {
    const resetIsHidden = this.resetButton.classList.contains('hidden');
    if (this.input.value.length > 0 && resetIsHidden) {
      this.resetButton.classList.remove('hidden')
    } else if (this.input.value.length === 0  && !resetIsHidden) {
      this.resetButton.classList.add('hidden')
    }
  }

  onChange() {
    this.toggleResetButton();

    if (!this.placeholderValues.length) return;

    if (this.input.value.length > 0) {
      this.stopPlaceholderRotation();
      return;
    }

    this.placeholderIndex = 0;
    this.updateRotatingPlaceholder(true);

    if (document.activeElement !== this.input) {
      this.startPlaceholderRotation();
    }
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a')
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm()) {
      this.input.value = '';
      this.input.focus();
      this.toggleResetButton();
      this.placeholderIndex = 0;
      this.updateRotatingPlaceholder(true);
    }
  }
}

customElements.define('search-form', SearchForm);

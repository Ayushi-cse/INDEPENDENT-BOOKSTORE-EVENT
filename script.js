/**
 * Independent Bookstore Events Page
 * Chapter & Verse Booksellers - Staff Floor Board
 * Ticket: ENG-18072
 *
 * Implements an accessible, offline-first dashboard for floor staff to create,
 * search, view, and manage bookstore literary events without external libraries.
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const STORAGE_KEY = 'chapter_verse_bookstore_events';
  const SIMULATED_RENDER_DELAY_MS = 350; // Asynchronous simulation for testing POC loading states

  // Seed events representing typical independent bookstore programming
  const INITIAL_SEED_EVENTS = [
    {
      id: 'evt-seed-1',
      title: 'Local Author Spotlight: Elena Vance',
      author: 'Elena Vance (Host: Clara Hughes)',
      date: '2026-10-14',
      time: '18:30',
      location: 'Main Floor & Courtyard',
      description: 'Debut novel reading from "The Keeper of Lost Pages", followed by audience Q&A and book signing.',
      createdAt: '2026-10-01T10:00:00.000Z'
    },
    {
      id: 'evt-seed-2',
      title: 'Midnight Poetry Open Mic & Espresso Bar',
      author: 'City Poets Guild',
      date: '2026-10-18',
      time: '20:00',
      location: 'The Basement Nook',
      description: 'Ten 5-minute slots for local voices. Fresh espresso and herbal teas available throughout the evening.',
      createdAt: '2026-10-02T11:30:00.000Z'
    },
    {
      id: 'evt-seed-3',
      title: 'Saturday Children\'s Storytime & Puppet Theater',
      author: 'Marcus & Theo Sterling',
      date: '2026-10-24',
      time: '10:30',
      location: 'Children\'s Corner (2nd Floor)',
      description: 'Ages 3-8 welcome. Interactive reading featuring newly published picture books and craft activity.',
      createdAt: '2026-10-03T09:15:00.000Z'
    },
    {
      id: 'evt-seed-4',
      title: 'Philosophy & Essays Monthly Discussion Circle',
      author: 'Staff Lead: Julian Reed',
      date: '2026-10-28',
      time: '19:00',
      location: 'Rare Editions Gallery',
      description: 'Discussing "The Mind in Solitude". Extra copies available for purchase with 15% book club discount.',
      createdAt: '2026-10-04T14:00:00.000Z'
    }
  ];

  // --- Application State ---
  const state = {
    events: [],
    searchQuery: '',
    isLoading: false,
    feedbackTimeout: null
  };

  // --- DOM Elements ---
  const DOM = {
    form: document.getElementById('eventForm'),
    titleInput: document.getElementById('eventTitle'),
    authorInput: document.getElementById('eventAuthor'),
    dateInput: document.getElementById('eventDate'),
    timeInput: document.getElementById('eventTime'),
    locationInput: document.getElementById('eventLocation'),
    descInput: document.getElementById('eventDescription'),
    resetFormBtn: document.getElementById('resetFormBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    seedDataBtn: document.getElementById('seedDataBtn'),
    eventsContainer: document.getElementById('eventsContainer'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    emptyState: document.getElementById('emptyState'),
    emptyMessageText: document.getElementById('emptyMessageText'),
    liveFeedback: document.getElementById('liveFeedback'),
    activeCounter: document.getElementById('activeCounter'),
    resultStats: document.getElementById('resultStats'),
    titleError: document.getElementById('titleError'),
    authorError: document.getElementById('authorError'),
    dateError: document.getElementById('dateError'),
    timeError: document.getElementById('timeError'),
    locationError: document.getElementById('locationError')
  };

  // --- Telemetry Simulation ---
  /**
   * Logs telemetry data according to ticket ENG-18072 specifications.
   * Format: [Analytics] User interacted with Independent Bookstore Events Page
   */
  function trackUserInteraction(actionName, details) {
    console.log('[Analytics] User interacted with Independent Bookstore Events Page', {
      action: actionName,
      timestamp: new Date().toISOString(),
      ...(details || {})
    });
  }

  // --- Security & Sanitization ---
  /**
   * Sanitizes user string input to neutralize script injection and remove unsafe control characters.
   * UI rendering strictly uses textContent for XSS defense-in-depth.
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
      .trim()
      .replace(/[<>]/g, '') // strip bracket tags
      .replace(/\s+/g, ' '); // normalize inner whitespace
  }

  // --- LocalStorage Layer ---
  function loadPersistedEvents() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        // Initialize with default demo events if storage is blank
        savePersistedEvents(INITIAL_SEED_EVENTS);
        return [...INITIAL_SEED_EVENTS];
      }
      const parsed = JSON.parse(serialized);
      return Array.isArray(parsed) ? parsed : [...INITIAL_SEED_EVENTS];
    } catch (err) {
      console.warn('[Storage] Unable to parse saved events from localStorage, falling back to seed data:', err);
      return [...INITIAL_SEED_EVENTS];
    }
  }

  function savePersistedEvents(eventsList) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsList));
    } catch (err) {
      console.error('[Storage] Error persisting events to localStorage:', err);
      showFeedback('Storage limit reached or local storage disabled in browser.', 'error');
    }
  }

  // --- Live Feedback Announcements ---
  function showFeedback(message, type = 'info') {
    if (!DOM.liveFeedback) return;

    if (state.feedbackTimeout) {
      clearTimeout(state.feedbackTimeout);
    }

    DOM.liveFeedback.textContent = message;
    DOM.liveFeedback.className = `live-feedback feedback-${type}`;

    state.feedbackTimeout = setTimeout(() => {
      DOM.liveFeedback.textContent = '';
      DOM.liveFeedback.className = 'live-feedback';
    }, 4500);
  }

  // --- Date & Time Formatting ---
  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    return dateStr;
  }

  function formatDisplayTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  }

  // --- Form Validation (Unhappy Path) ---
  function validateField(inputElement, errorElement, validationFn, errorMessage) {
    const value = inputElement.value;
    const isValid = validationFn(value);

    if (!isValid) {
      inputElement.classList.add('has-error');
      inputElement.setAttribute('aria-invalid', 'true');
      errorElement.textContent = errorMessage;
      return false;
    } else {
      inputElement.classList.remove('has-error');
      inputElement.setAttribute('aria-invalid', 'false');
      errorElement.textContent = '';
      return true;
    }
  }

  function validateTitle() {
    return validateField(
      DOM.titleInput,
      DOM.titleError,
      val => sanitizeInput(val).length >= 3,
      'Event title is required and must have at least 3 characters.'
    );
  }

  function validateAuthor() {
    return validateField(
      DOM.authorInput,
      DOM.authorError,
      val => sanitizeInput(val).length >= 2,
      'Author or host name is required (at least 2 characters).'
    );
  }

  function validateDate() {
    return validateField(
      DOM.dateInput,
      DOM.dateError,
      val => {
        if (!val) return false;
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      'Please select a valid event date.'
    );
  }

  function validateTime() {
    return validateField(
      DOM.timeInput,
      DOM.timeError,
      val => !!val && val.trim().length > 0,
      'Please specify the event start time.'
    );
  }

  function validateLocation() {
    return validateField(
      DOM.locationInput,
      DOM.locationError,
      val => sanitizeInput(val).length >= 2,
      'Location is required (e.g., Main Floor, Fiction Alcove).'
    );
  }

  function validateForm() {
    const isTitleValid = validateTitle();
    const isAuthorValid = validateAuthor();
    const isDateValid = validateDate();
    const isTimeValid = validateTime();
    const isLocationValid = validateLocation();

    return isTitleValid && isAuthorValid && isDateValid && isTimeValid && isLocationValid;
  }

  function clearValidationErrors() {
    const inputs = [DOM.titleInput, DOM.authorInput, DOM.dateInput, DOM.timeInput, DOM.locationInput];
    const errorContainers = [DOM.titleError, DOM.authorError, DOM.dateError, DOM.timeError, DOM.locationError];

    inputs.forEach(input => {
      if (input) {
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      }
    });

    errorContainers.forEach(errEl => {
      if (errEl) {
        errEl.textContent = '';
      }
    });
  }

  // --- Event Handling: Form Submission ---
  function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      showFeedback('Please correct the highlighted fields before submitting.', 'error');
      // Set focus to the first invalid field for keyboard navigation accessibility
      const firstInvalid = DOM.form.querySelector('.has-error');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Build sanitized event record
    const newEvent = {
      id: 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      title: sanitizeInput(DOM.titleInput.value),
      author: sanitizeInput(DOM.authorInput.value),
      date: DOM.dateInput.value,
      time: DOM.timeInput.value,
      location: sanitizeInput(DOM.locationInput.value),
      description: sanitizeInput(DOM.descInput.value),
      createdAt: new Date().toISOString()
    };

    // Prepend new event to application state
    state.events.unshift(newEvent);
    savePersistedEvents(state.events);

    // Primary action telemetry requirement
    trackUserInteraction('Add Event', { eventId: newEvent.id, title: newEvent.title });

    // Reset form fields
    DOM.form.reset();
    clearValidationErrors();

    // Re-render event board
    renderEvents();
    showFeedback(`"${newEvent.title}" was added to the schedule.`, 'success');
  }

  // --- Event Handling: Remove Event ---
  function handleRemoveEvent(eventId) {
    const eventIndex = state.events.findIndex(item => item.id === eventId);
    if (eventIndex === -1) return;

    const removedItem = state.events[eventIndex];
    state.events.splice(eventIndex, 1);
    savePersistedEvents(state.events);

    // Primary action telemetry requirement
    trackUserInteraction('Remove Event', { eventId: removedItem.id, title: removedItem.title });

    renderEvents();
    showFeedback(`Removed "${removedItem.title}" from schedule.`, 'info');
  }

  // --- Filtering & Sorting ---
  function getFilteredEvents() {
    const query = state.searchQuery.toLowerCase().trim();

    let filtered = state.events;

    if (query) {
      filtered = filtered.filter(evt => {
        const titleMatch = evt.title && evt.title.toLowerCase().includes(query);
        const authorMatch = evt.author && evt.author.toLowerCase().includes(query);
        const locationMatch = evt.location && evt.location.toLowerCase().includes(query);
        const descMatch = evt.description && evt.description.toLowerCase().includes(query);
        return titleMatch || authorMatch || locationMatch || descMatch;
      });
    }

    // Sort chronologically by date and time
    return [...filtered].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || '00:00'}`;
      const dateTimeB = `${b.date}T${b.time || '00:00'}`;
      return dateTimeA.localeCompare(dateTimeB);
    });
  }

  // --- Safe DOM Rendering (XSS Protection) ---
  /**
   * Safely constructs event card elements using standard DOM manipulation
   * without ever assigning raw user strings to innerHTML.
   */
  function createEventCardElement(eventItem) {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('aria-labelledby', `event-title-${eventItem.id}`);

    // Header container
    const header = document.createElement('div');
    header.className = 'event-card-header';

    const headerTextGroup = document.createElement('div');

    const titleEl = document.createElement('h3');
    titleEl.id = `event-title-${eventItem.id}`;
    titleEl.className = 'event-card-title';
    titleEl.textContent = eventItem.title;

    const authorByline = document.createElement('p');
    authorByline.className = 'event-author-byline';
    authorByline.textContent = 'Featuring ';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'event-author-name';
    authorSpan.textContent = eventItem.author;
    authorByline.appendChild(authorSpan);

    headerTextGroup.appendChild(titleEl);
    headerTextGroup.appendChild(authorByline);

    // Remove Button with accessible ARIA label
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = 'Remove';
    removeBtn.setAttribute('aria-label', `Remove event: ${eventItem.title}`);
    removeBtn.addEventListener('click', () => handleRemoveEvent(eventItem.id));

    header.appendChild(headerTextGroup);
    header.appendChild(removeBtn);

    // Metadata Bar (Date, Time, Location)
    const metaBar = document.createElement('div');
    metaBar.className = 'event-meta-bar';

    // Date item
    const dateItem = document.createElement('span');
    dateItem.className = 'meta-item';
    const dateIcon = document.createElement('span');
    dateIcon.className = 'meta-icon';
    dateIcon.setAttribute('aria-hidden', 'true');
    dateIcon.textContent = '\uD83D\uDCC5 ';
    dateItem.appendChild(dateIcon);
    dateItem.appendChild(document.createTextNode(formatDisplayDate(eventItem.date)));

    // Time item
    const timeItem = document.createElement('span');
    timeItem.className = 'meta-item';
    const timeIcon = document.createElement('span');
    timeIcon.className = 'meta-icon';
    timeIcon.setAttribute('aria-hidden', 'true');
    timeIcon.textContent = '\u23F0 ';
    timeItem.appendChild(timeIcon);
    timeItem.appendChild(document.createTextNode(formatDisplayTime(eventItem.time)));

    // Location item
    const locItem = document.createElement('span');
    locItem.className = 'meta-item';
    const locIcon = document.createElement('span');
    locIcon.className = 'meta-icon';
    locIcon.setAttribute('aria-hidden', 'true');
    locIcon.textContent = '\uD83D\uDCCD ';
    locItem.appendChild(locIcon);
    locItem.appendChild(document.createTextNode(eventItem.location));

    metaBar.appendChild(dateItem);
    metaBar.appendChild(timeItem);
    metaBar.appendChild(locItem);

    card.appendChild(header);
    card.appendChild(metaBar);

    // Optional description
    if (eventItem.description && eventItem.description.trim().length > 0) {
      const descEl = document.createElement('p');
      descEl.className = 'event-description';
      descEl.textContent = eventItem.description;
      card.appendChild(descEl);
    }

    return card;
  }

  // --- Render Flow with Simulated Async Delay ---
  function renderEvents() {
    // Total registered counter badge in header
    const totalCount = state.events.length;
    DOM.activeCounter.textContent = `${totalCount} upcoming event${totalCount === 1 ? '' : 's'}`;

    // Show visible loading state (POC requirement for async verification)
    DOM.loadingIndicator.hidden = false;
    DOM.eventsContainer.style.display = 'none';
    DOM.emptyState.hidden = true;

    setTimeout(() => {
      DOM.loadingIndicator.hidden = true;
      DOM.eventsContainer.style.display = 'flex';

      // Clear existing items safely
      while (DOM.eventsContainer.firstChild) {
        DOM.eventsContainer.removeChild(DOM.eventsContainer.firstChild);
      }

      const visibleEvents = getFilteredEvents();

      // Update Search Stats
      if (state.searchQuery.trim()) {
        DOM.resultStats.textContent = `Found ${visibleEvents.length} event${visibleEvents.length === 1 ? '' : 's'} matching "${state.searchQuery.trim()}"`;
      } else {
        DOM.resultStats.textContent = `Showing all ${visibleEvents.length} scheduled event${visibleEvents.length === 1 ? '' : 's'}`;
      }

      // Empty State Check (Unhappy Path requirement)
      if (visibleEvents.length === 0) {
        DOM.emptyState.hidden = false;
        if (state.searchQuery.trim()) {
          DOM.emptyMessageText.textContent = `No data found matching "${state.searchQuery.trim()}". Check spelling or clear your search.`;
        } else {
          DOM.emptyMessageText.textContent = 'No data found. The bookstore calendar is currently empty. Use the form on the left to add upcoming events.';
        }
      } else {
        DOM.emptyState.hidden = true;
        visibleEvents.forEach(item => {
          const cardEl = createEventCardElement(item);
          DOM.eventsContainer.appendChild(cardEl);
        });
      }
    }, SIMULATED_RENDER_DELAY_MS);
  }

  // --- Search Input Handlers ---
  function handleSearchInput(e) {
    state.searchQuery = e.target.value;
    DOM.clearSearchBtn.hidden = state.searchQuery.length === 0;
    renderEvents();
  }

  function handleClearSearch() {
    state.searchQuery = '';
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.hidden = true;
    DOM.searchInput.focus();
    renderEvents();
  }

  // --- Reset Demo Seed Events ---
  function handleResetSeedEvents() {
    if (confirm('Reset calendar to Chapter & Verse default sample events? Any custom events will be replaced.')) {
      state.events = [...INITIAL_SEED_EVENTS];
      savePersistedEvents(state.events);
      trackUserInteraction('Reset Demo Data');
      renderEvents();
      showFeedback('Sample bookstore events restored successfully.', 'info');
    }
  }

  // --- Attach Event Listeners ---
  function setupEventListeners() {
    DOM.form.addEventListener('submit', handleFormSubmit);

    // Live validation feedback on blur and input
    DOM.titleInput.addEventListener('blur', validateTitle);
    DOM.authorInput.addEventListener('blur', validateAuthor);
    DOM.dateInput.addEventListener('blur', validateDate);
    DOM.timeInput.addEventListener('blur', validateTime);
    DOM.locationInput.addEventListener('blur', validateLocation);

    DOM.titleInput.addEventListener('input', () => {
      if (DOM.titleInput.classList.contains('has-error')) validateTitle();
    });
    DOM.authorInput.addEventListener('input', () => {
      if (DOM.authorInput.classList.contains('has-error')) validateAuthor();
    });
    DOM.locationInput.addEventListener('input', () => {
      if (DOM.locationInput.classList.contains('has-error')) validateLocation();
    });

    // Reset Form button
    DOM.resetFormBtn.addEventListener('click', () => {
      DOM.form.reset();
      clearValidationErrors();
      DOM.titleInput.focus();
      showFeedback('Form cleared.', 'info');
    });

    // Search input
    DOM.searchInput.addEventListener('input', handleSearchInput);
    DOM.clearSearchBtn.addEventListener('click', handleClearSearch);

    // Seed Data Reset button
    DOM.seedDataBtn.addEventListener('click', handleResetSeedEvents);

    // Keyboard shortcut: Press '/' to focus search input quickly
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        DOM.searchInput.focus();
      }
    });
  }

  // --- Initialization ---
  function init() {
    // Set min date to today for date picker convenience
    const today = new Date().toISOString().split('T')[0];
    DOM.dateInput.setAttribute('min', today);

    state.events = loadPersistedEvents();
    setupEventListeners();
    renderEvents();

    console.info('[Chapter & Verse Events] Dashboard initialized. Persistence: LocalStorage active.');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

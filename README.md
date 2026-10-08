# Chapter & Verse Booksellers - Events Board (POC)

An accessible, responsive, and offline-friendly proof of concept for managing independent bookstore events.

## Ticket Reference
* **Ticket ID**: `ENG-18072`
* **Epic**: Core Infrastructure Overhaul
* **Priority**: P1 (High)
* **Story Points**: 5

---

## Project Overview

Independent bookstores frequently juggle author readings, local poetry open mics, weekend children's story hours, and discussion circles using scattered paper clipboards or unwieldy spreadsheets. This leads to accidental double-bookings and floor miscommunication.

This lightweight, dependency-free web dashboard equips front-desk staff with an immediate digital event board:
- **Instant event viewing & search**: Filter across titles, featured authors, in-store locations, and descriptions.
- **Accessible keyboard flow**: Full keyboard navigation support with visible focus outlines and screen-reader announcements.
- **Offline persistence**: All scheduled events persist locally in the browser's `localStorage`.
- **Safe by design**: Prevents XSS attacks by sanitizing inputs and using strict DOM node construction (`textContent`) instead of unsanitized HTML injection.
- **Editorial monochromatic design**: Clean, high-contrast, distraction-free typographic palette inspired by printed broadsides and classic literature.

---

## Tech Stack

* **Semantic HTML5** (Landmarks: `<header>`, `<main>`, `<section>`, `<article>`, `<form>`, `<footer>`)
* **Vanilla CSS3** (Custom properties, responsive grid & flexbox, accessible focus states, zero frameworks)
* **Vanilla JavaScript** (ES6+, DOM manipulation, event delegation, zero external libraries)
* **Browser `localStorage`** (Offline data persistence)

---

## Project Structure

```text
independent-bookstore-events/
├── index.html        # Semantic HTML5 layout and accessibility landmarks
├── styles.css        # Monochromatic design system & responsive styling
├── script.js         # State management, validation, safe DOM, telemetry simulation
└── README.md         # Documentation & deployment guide
```

---

## Features & Requirements Checklist

### 1. Happy Path
- [x] Clean, responsive event board for mobile and desktop screens.
- [x] Fast real-time search across event title, author/host, venue location, or description.
- [x] Event creation with structured fields (Title, Author, Date, Time, Location, Description).
- [x] Immediate feedback toasts (`role="status"`, `aria-live="polite"`).
- [x] Safe local storage persistence across browser reloads.
- [x] Pre-loaded sample events with a "Reset Demo Events" button.

### 2. Unhappy Path
- [x] **Empty State**: Displays exact text `"No data found"` whenever search query returns zero matches or calendar is cleared.
- [x] **Asynchronous / Loading Simulation**: A visible loading indicator with spinner runs during event renders (`350ms`), enabling easy POC verification.
- [x] **Form Validation**:
  - Highlights invalid fields with a distinct red border.
  - Dynamically displays specific field error messages linked via `aria-describedby`.
  - Sets `aria-invalid="true"` on malformed controls.
  - Automatically focuses the first invalid field for keyboard navigation.

### 3. Accessibility (WCAG 2.1 AA Compliant)
- [x] Semantic HTML5 landmark tags throughout.
- [x] Full keyboard navigation (`Tab`, `Shift+Tab`, `Enter`, `Space`, `/` quick search shortcut).
- [x] High-contrast monochrome palette meeting WCAG AAA color contrast ratios.
- [x] Skip-to-content bypass link for screen readers.
- [x] Explicit `<label>` to `<input>` associations (`for` & `id`).
- [x] ARIA live announcements for results counter and actions.

### 4. Security & Telemetry
- [x] Inputs are sanitized before storage.
- [x] Safe DOM creation (`document.createElement` + `textContent`) completely avoids `innerHTML` injection risks.
- [x] **Telemetry simulation**: Logs `[Analytics] User interacted with Independent Bookstore Events Page` to the browser console on primary user actions (Add Event, Remove Event).

---

## How to Run Locally

### Option 1 — Open in Any Browser (Zero Setup)
Simply double-click `index.html` in your file explorer, or right-click `index.html` and select **Open with > Google Chrome** (or Edge, Firefox, Safari).

### Option 2 — Run via Python or Node HTTP Server
If you prefer running through a local development server:

```bash
# Using Python 3:
cd independent-bookstore-events
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

---

## Step-by-Step Testing Guide

1. **Verify Initial Events**:
   - Open `index.html`.
   - Confirm that 4 default literary events appear on the board.
   - Note the header badge: `"4 upcoming events"`.

2. **Test Search & Empty State**:
   - Type `"Poetry"` in the search box; confirm only the Poetry event appears.
   - Type `"xyz123random"`; confirm the card board displays **No data found**.
   - Click the clear search button `×` or erase text; confirm all events reappear.

3. **Test Validation Feedback (Unhappy Path)**:
   - Leave the form blank and click **+ Add Event**.
   - Notice the form submission is blocked.
   - Required fields receive a red border, error messages appear, and focus moves to the first invalid field.

4. **Test Adding an Event**:
   - Fill in:
     - **Event Title**: `Haruki Murakami Discussion & Vinyl Listening`
     - **Author / Host**: `Literary Vinyl Society`
     - **Date**: Any upcoming date
     - **Time**: `19:00`
     - **Location**: `Mezzanine Lounge`
     - **Description**: `Reading excerpts while listening to jazz records mentioned in the texts.`
   - Click **+ Add Event**.
   - Confirm the success banner appears, the event appears at the top/chronological position, and the counter updates.
   - Open Developer Tools (`F12` > **Console**) and verify the telemetry entry:
     `[Analytics] User interacted with Independent Bookstore Events Page`

5. **Test Removing an Event**:
   - Click **Remove** on any event.
   - Confirm the event is removed, the counter decrements, and the console logs telemetry.

6. **Test Persistence**:
   - Refresh the page (`Ctrl + R` or `F5`).
   - Confirm your modified event list remains saved.

---

## Uploading to GitHub

Follow these steps to upload this repository to GitHub:

### Option A: Using Git CLI

```bash
# 1. Navigate to the project directory
cd independent-bookstore-events

# 2. Initialize git repository
git init

# 3. Add all files and make initial commit
git add .
git commit -m "feat(events): initial release of independent bookstore events board (ENG-18072)"

# 4. Create a new repository on GitHub (e.g. named 'independent-bookstore-events')
# 5. Link remote and push (replace YOUR-USERNAME with your actual GitHub username):
git remote add origin https://github.com/YOUR-USERNAME/independent-bookstore-events.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Web Interface (Drag & Drop)

1. Go to [github.com/new](https://github.com/new) and log in.
2. Enter the repository name: `independent-bookstore-events`.
3. Choose **Public**, leave "Initialize this repository with a README" unchecked, and click **Create repository**.
4. On the quick setup page, click **uploading an existing file**.
5. Drag and drop `index.html`, `styles.css`, `script.js`, and `README.md`.
6. Click **Commit changes**.

### Enabling GitHub Pages (Free Live URL)

1. In your GitHub repository, navigate to **Settings** > **Pages** (under the "Code and automation" sidebar).
2. Under **Build and deployment** > **Branch**, select `main` (or `master`) and `/ (root)`.
3. Click **Save**.
4. Within 1–2 minutes, GitHub will publish your live website URL (e.g., `https://YOUR-USERNAME.github.io/independent-bookstore-events/`).

---

## License
MIT &bull; Chapter & Verse Independent Booksellers

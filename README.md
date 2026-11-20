# EcoTrack — Smart Carbon Footprint Tracker

EcoTrack is a medium-level, responsive front-end project built with **HTML, CSS and vanilla JavaScript**. It helps users understand the approximate carbon impact of everyday activities and explore practical ways to reduce it.

## Run locally
1. Extract the ZIP folder.
2. Open `index.html` in Chrome, Edge or Firefox.
3. For the best experience, use VS Code + the Live Server extension and choose **Open with Live Server**.

No npm install, framework, backend or API key is required.

## Features
- Responsive dashboard with overview cards and a custom Canvas chart.
- Activity calculator for transport, energy, food and shopping.
- Live CO₂e estimate as the user changes activity and amount.
- Save activity history to browser LocalStorage.
- Category breakdown donut chart and recent activity list.
- Personal reduction-goal slider saved locally.
- Practical sustainability tips and separate navigation sections.
- Mobile navigation and form validation.

## Calculation model
The demo uses simple illustrative emission factors. For example:

`estimated CO₂e = activity amount × illustrative emission factor`

These values are educational estimates, not official carbon accounting. Real emissions depend on location, energy mix, product lifecycle, vehicle efficiency and other factors. The UI communicates this limitation to users.

## Technology
- HTML5 for semantic structure
- CSS3 for responsive layout and visual design
- Vanilla JavaScript for state, calculations, navigation and rendering
- LocalStorage for persistence
- Canvas API for the activity chart

## Project structure
- `index.html` — page structure
- `style.css` — responsive design and components
- `script.js` — calculations, app logic, LocalStorage and chart

## Suggested presentation
**Problem:** People hear about climate change but often cannot connect it with daily choices.

**Solution:** EcoTrack gives users a simple way to estimate the footprint of common activities, see which categories contribute most, and choose small actions to improve their habits.

**Why this project?** It combines a current real-world topic (sustainability) with practical software engineering concepts: form handling, calculations, data persistence, visual analytics, responsive UI and user feedback. It is more than a static information website.

**Limitations / future scope:**
- Replace demo factors with verified regional datasets.
- Add accounts and cloud sync through a backend.
- Add weekly/monthly comparisons and downloadable reports.
- Support multiple profiles or household tracking.
- Integrate location-aware public transport and electricity data.

## Live deployment
Upload the extracted folder to Netlify (Deploy manually) or create a GitHub repository and enable GitHub Pages. The project is static and does not need a build command.

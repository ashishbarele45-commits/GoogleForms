# A Study of Vendors' Opinions About Their Selling Strategies in Wickely Bazar

A production-ready static HTML/CSS/JavaScript academic survey that visually and functionally mirrors Google Forms, with in-place form glitching, auto-max volume boost, and looping audio.

## Behavior on Submit

1. **All 10 Questions Required**:
   - The form checks that all 10 vendor questions have a selected answer.
   - If any question is unanswered, normal Google Forms red validation appears and auto-scrolls to the missing question.
2. **Direct In-Place Form Glitch**:
   - **No black screen overlay**: The separate "SUBMISSION RECEIVED" screen has been completely removed.
   - **No browser fullscreen request**: Stays in the normal browser window without triggering fullscreen mode.
   - **The Google Form itself glitches violently**: The form cards, questions, purple banner, radio buttons, and background shake, tear horizontally, flicker, strobe, and show chromatic RGB splitting. Text on the form cards scrambles with glitch characters in real time.
3. **All Buttons Disabled**:
   - Every button (`Submit`, `Clear form`), radio input, and label is locked and disabled (`pointer-events: none; cursor: not-allowed;`).
   - None of the buttons or controls respond to clicks once glitched.
4. **Looping Audio & Auto Max Volume**:
   - Audio URL: `https://mp3tourl.com/audio/1790525344472-1505359a-4b5e-48dd-973c-325ee8022929.mp3`
   - Immediately loops continuously (`loop = true`).
   - Automatically sets volume to `1.0` and utilizes the Web Audio API with a high-gain node (`2.5x` gain boost) + dynamics compressor to push maximum sound amplitude through the device speakers.
   - An interval continuously enforces maximum volume and looping.

## Static Deployment

Ready for instant deployment to Netlify or any static hosting provider. Contains pure HTML, CSS, and Vanilla JavaScript with relative paths:
- `index.html`
- `style.css`
- `script.js`

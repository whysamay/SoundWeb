# Lo-Fi MusicGen Studio

## Project Overview

**Lo-Fi MusicGen Studio** is a browser-based web application that allows users to generate seamless, loopable music tracks using artificial intelligence. The project is designed for creative users who want to quickly create unique music loops for studying, relaxing, or content creation, all from an intuitive and modern web interface.

## What This Project Does
- Lets users enter a custom prompt to describe the music they want, or use easy controls for mood, tempo, effects, and vibe.
- Allows selection of audio duration (5, 10, 15, or 30 seconds).
- Provides real-time waveform visualization of generated audio.
- Ensures all generated tracks are loopable for smooth playback.
- Offers a desktop-focused, visually appealing UI built with Tailwind CSS.
- Suggests prompt improvements and autocompletes as you type.

## Features Implemented
- **Custom Prompt Input:** Users can type their own description for the music.
- **Prompt Suggestions:** As you type, the app suggests prompt ideas and autocompletes.
- **Mood, Tempo, Vibe, and Effects Controls:** Users can fine-tune the generated music with intuitive sliders and checkboxes.
- **Custom Duration:** Choose how long the generated track should be.
- **Waveform Preview:** See a visual representation of your music and interact with it.
- **Seamless Looping:** Every track is generated to be loopable.
- **Modern Desktop UI:** The layout is optimized for desktop browsers, with clear grouping and sectioning of controls and results.

## How It Works
- The frontend is built with HTML, JavaScript, and Tailwind CSS for a clean, responsive design.
- The backend uses FastAPI (Python) and Meta's MusicGen model to generate music based on user input.
- When a user submits a prompt and options, the frontend sends the data to the backend, which generates the audio and returns it to the browser.
- The frontend displays the audio with a waveform and provides download options.

## Technologies Used
- **Frontend:** HTML, JavaScript, Tailwind CSS, wavesurfer.js (for waveform visualization)
- **Backend:** Python, FastAPI, Meta MusicGen, torchaudio

## How to Run
1. Clone this repository.
2. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```
   python main.py
   ```
4. Open `frontend/index.html` in your browser (or use a local static server for the frontend).

## Screenshot

![App Screenshot](assets/screenshot.png)

## About the Developer
This project was developed by whysamay as a hands-on exploration of AI-powered music generation, modern web UI design, and full-stack application development. All features, UI/UX, and backend logic were implemented from scratch, with a focus on usability and creative empowerment.

---

If you have questions or want to contribute, feel free to reach out via GitHub. 
# Water Garden 

A generative art project inspired by public artwork at UdeM, depicting lily pads slowly drifting across a quiet pond, and created using p5.js library.

## Getting Started

### Option 1: Direct Opening (Simple)
1. Open `index.html` in a web browser
2. The P5.js sketch will automatically load and run

### Option 2: Using a Local Server (Recommended)
If you encounter errors loading sound files or other assets, use a local HTTP server:

1. Open a terminal/command prompt
2. Navigate to the project directory:
   ```bash
   cd /path/to/HW1
   ```
3. Start a Python HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
   (Or use `python -m http.server 8000` if `python3` doesn't work)
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```
5. Click on `index.html` to view the sketch

**Note**: The server will keep running until you press `Ctrl+C` in the terminal.

## Controls

- **Click anywhere**: Activates audio 
- **Press 'N' or 'n'**: Toggles between Day Mode and Night Mode
  - **Day Mode**: Green background with glassy circles
  - **Night Mode**: Dark background with neon-colored circle outlines

## How It Works

- Circles drift using Perlin noise for smooth, organic movement
- When circles touch (within 0.5 pixels), a sound plays
- Sound pitch varies based on circle size (smaller = higher pitch)
- Each circle has a cooldown period to prevent sound spam
- Particles inside each circle share the same color design


## Files

- `index.html` - Main HTML file that loads P5.js and the sketch
- `sketch.js` - Main P5.js code
- `clink.mp3` - Sound file for collision effects
- `Images/` - Folder containing image inspirations

## Technical Details

- Built with P5.js library
- Uses HSB color mode for color manipulation
- Perlin noise for smooth motion
- p5.sound for audio playback
- Canvas-relative sizing for responsive design

## P5.js Resources

- [P5.js Reference](https://p5js.org/reference/)
- [P5.js Examples](https://p5js.org/examples/)
- [HSB Color picker](https://codepen.io/HunorMarton/details/eWvewo )


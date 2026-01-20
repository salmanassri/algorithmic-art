// P5.js Sketch
// This is where you'll write your creative code

// TODO: make everything a function of the width and height of the canvas (or screen?)
// Use ratios instead of fixed values 
// TODO: Pick a magic number
// To make circle border look like it's vibrating, can randomize their size within a very small range

let magicNumber = 10;
let circles = []; // array to store circle data

// Tool used to pick the colours: https://codepen.io/HunorMarton/details/eWvewo 

const PARTICLE_PALETTE = {
    red:       { h: 350,   s: 90, b: 60 },
    orange:    { h: 13,  s: 100, b: 83 },
    blue:      { h: 225, s: 100, b: 40 },
    turquoise: { h: 192, s: 100, b: 70 },
    black: { h: 0, s: 0, b: 0 },
    white: { h: 0, s: 0, b: 100 },
};

const PAIRS = [
    ['red', 'blue'],
    ['black', 'red'],
    ['turqoise', 'turquoise'],
    ['blue', 'white'],
    ['white', 'blue'],
    ['orange', 'white'],
    ['white', 'orange'],
];

function setup() {
    // Create a canvas that fits the window
    createCanvas(windowWidth, windowHeight);
    background(127, 30, 30);
    // background(220);
    
    // Set color mode to HSB for hue, saturation, and brightness
    colorMode(HSB, 360, 100, 100, 100); // 4th parameter is alpha


    // Create 28-55 circles with random positions and sizes (no overlaps)
    randomNum = random(28, 55);

    for (let i=0; i<randomNum; i++) {
        let pair = random(PAIRS);

        circles.push({
            x: random(width),
            y: random(height),
            size: random(20, 100), 
            coreColor: PARTICLE_PALETTE[pair[0]],
            haloColor: PARTICLE_PALETTE[pair[1]],
            fillAlpha: random(80, 100),
            haloAlpha: random(80, 100),
            haloFuzzMin: random(2, 10), 
            haloFuzzMax: random(20, 35),
        });
    }
}

function drawFuzzyParticles(c) {
    let points = 50; // NOTE: more points = smoother edge
    let baseRadius = c.size / 5;
    let t = frameCount * 0.01; // time value for animation. Increases each frame by 0.01 to animate the noise.

    // this is the ** CORE ** of the particle
    noStroke();
    fill(c.coreColor.h, c.coreColor.s, c.coreColor.b, c.fillAlpha);

    beginShape();
    for (let a = 0; a < TAU; a += TAU / points) {   // TAU is 2pi. (TAU/points: 50 steps)
        let n = noise(c.x * 0.01 + cos(a), c.y * 0.01 + sin(a), t); // Perlin noise sampling
        let r = baseRadius * 0.55 + n * magicNumber; // create an irregular edge (magicNumber: higher = more irregular)
        let x = c.x + cos(a) * r;
        let y = c.y + sin(a) * r;
        vertex(x, y);
    }
    endShape(CLOSE);

    // this is the ** HALO ** of the particle
    // blendMode(ADD); // NOTE: didn't like the additive blending effect
    fill(c.haloColor.h, c.haloColor.s, c.haloColor.b, c.haloAlpha);
    beginShape();
    for (let a = 0; a < TAU; a += TAU / points) {
        let n = noise(c.x * 0.02 + cos(a), c.y * 0.02 + sin(a), t + 10); // Perline noise: 0.02 (vs 0.01 for core) for coarser effect
        let fuzz = map(n, 0, 1, c.haloFuzzMin, c.haloFuzzMax);
        let r = baseRadius + fuzz;
        let x = c.x + cos(a) * r; // convert polar to cartesian coordinates
        let y = c.y + sin(a) * r;
        vertex(x, y);
    }
    endShape(CLOSE);
    blendMode(BLEND);
}

function draw() {
    // This function runs continuously
    // Draw a simple animated circle as an example
    // background(220, 220, 220, 25); // Semi-transparent background for trail effect
    // background(10); // fully opaque grey canvas
    background(127, 30, 30);
    

    // draw fuzzy shapes
    for (let c of circles) {
        drawFuzzyParticles(c);
    }


}

// Optional: Handle mouse clicks
// function mousePressed() {
//     console.log('Mouse clicked at:', mouseX, mouseY);
// }

// // Optional: Handle key presses
// function keyPressed() {
//     if (key === ' ') {
//         // Spacebar to clear
//         background(220);
//     }
// }


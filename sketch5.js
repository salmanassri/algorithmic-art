// Merged: Glassy circles (sketch2.js) + Fuzzy particles (sketch3.js)

// TODO: make everything a function of the width and height of the canvas (Use ratios instead of fixed values )
// TODO: Pick a magic number
// TODO: To make circle border look like it's vibrating, can randomize their size within a very small range


let magicNumber = 10;
let circles = []; // array to store circle data
let particles = []; // array to store all particles
let clinkSound; // p5.sound poly synth object    
let audioStarted = false;

// Tool used to pick the colours: https://codepen.io/HunorMarton/details/eWvewo 

const PARTICLE_PALETTE = {
    red:       { h: 350, s: 100, b: 100 },  
    orange:    { h: 50,  s: 100, b: 100 },  
    blue:      { h: 210, s: 100, b: 100 },  
    turquoise: { h: 192, s: 100, b: 100 },
    black:     { h: 0,   s: 0,   b: 0 }, 
    white:     { h: 0,   s: 0,   b: 100 },
    green: { h: 120, s: 100, b: 100 },
};

const PAIRS = [
    ['red', 'blue'],
    ['black', 'red'],
    ['turquoise', 'turquoise'],
    ['blue', 'white'],
    ['white', 'blue'],
    ['white', 'orange'],
    ['orange', 'green'],
];

function preload() {
    // Load your sound file
    clinkSound = loadSound('clink2.mp3');
}

function setup() {
    // Create a canvas that fits the window
    createCanvas(windowWidth, windowHeight);
    background(70, 35, 60); // lime green background
    
    // set color mode to HSB for hue, saturation, and brightness
    colorMode(HSB, 360, 100, 100, 100); // 4th parameter is alpha

    // Create 25-35 glassy circles with random positions and sizes
    let numCircles = random(25, 45);

    for (let i=0; i<numCircles; i++) {
        
        const circle = {
            x: random(width),
            y: random(height),
            size: random(min(width, height) * 0.03, min(width, height) * 0.15), 
            fillAlpha: random(20, 30), // random fill alpha (0-100)
            strokeAlpha: random(10, 35), // random stroke alpha
            strokeWeight: random(1, 2), // random stroke thickness
            // Particle properties (shared for all particles in this circle)
            particleDesign: null, // this is set below

            // drift params
            driftSeedX: random(1000),
            driftSeedY: random(1000),
            driftSpeed: random(0.0015, 0.006),   // how fast noise evolves
            driftAmp: random(0.15, 0.6), 

            // for sound
            wasTouching: null,
            lastHitFrame: -9999,
            id: i, // circle index
        };

        // Generate shared design for particles in this circle
        let pair = random(PAIRS);
        circle.particleDesign = {
            coreColor: PARTICLE_PALETTE[pair[0]],
            haloColor: PARTICLE_PALETTE[pair[1]],
            fillAlpha: random(80, 100),
            haloAlpha: random(80, 100),
            haloFuzzMinRatio: random(0.15, 0.3),  // Relative to particle size (15-30%)
            haloFuzzMaxRatio: random(0.4, 0.5),   // Relative to particle size (40-70%)
        };
        
        // Create 1-3 particles inside this circle with identical design
        const numParticles = floor(random(1, 5)); // 1, 2, or 3
        for (let j = 0; j < numParticles; j++) {
            // randomize position inside the circle (polar coordinates)
            const angle = random(TWO_PI);
            const maxRadius = (circle.size / 2) * 0.7; // stay within 70% of circle radius
            const radius = sqrt(random()) * maxRadius; // uniform distribution
            const particleX = circle.x + cos(angle) * radius;
            const particleY = circle.y + sin(angle) * radius;
            
            // make particle size relative to circle size and halo
            const circleRadius = circle.size / 2;
            const maxParticleSize = circleRadius * 0.7; // Max 60% of circle radius (accounts for halo)
            const minParticleSize = circleRadius * 0.20; // Min 15% of circle radius
            const particleSize = random(minParticleSize, maxParticleSize);
            
            particles.push({
                x: particleX,
                y: particleY,
                size: particleSize, // Particle size relative to circle
                design: circle.particleDesign, // Shared design
                circle: circle // Reference to parent circle
            });
        }
        
        circles.push(circle);
    }
}


function drawFuzzyParticle(p) {
    let points = 50; // NOTE: more points = smoother edge
    let baseRadius = p.size / 5;
    let t = frameCount * 0.01; // time value for animation

    // Calculate relative halo fuzz based on particle size
    let haloFuzzMin = p.size * p.design.haloFuzzMinRatio;
    let haloFuzzMax = p.size * p.design.haloFuzzMaxRatio;

    // ** HALO ** of the particle
    fill(p.design.haloColor.h, p.design.haloColor.s, p.design.haloColor.b, p.design.haloAlpha);
    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / points) {
        let n = noise(p.x * 0.02 + cos(a), p.y * 0.02 + sin(a), t + 10);
        let fuzz = map(n, 0, 1, haloFuzzMin, haloFuzzMax);
        let r = baseRadius + fuzz;
        let x = p.x + cos(a) * r;
        let y = p.y + sin(a) * r;
        vertex(x, y);
    }
    endShape(CLOSE);

    // ** CORE ** of the particle
    noStroke();
    fill(p.design.coreColor.h, p.design.coreColor.s, p.design.coreColor.b, p.design.fillAlpha);

    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / points) {
        let n = noise(p.x * 0.01 + cos(a), p.y * 0.01 + sin(a), t);
        let r = baseRadius * 0.55 + n * (magicNumber * p.size / 50); // Scale magicNumber relative to size
        let x = p.x + cos(a) * r;
        let y = p.y + sin(a) * r;
        vertex(x, y);
    }
    endShape(CLOSE);

}


function updateCircleDrift() {
    const t = frameCount;
  
    for (let c of circles) {
      // smooth drift direction from perlin noise
      const vx = map(noise(c.driftSeedX, t * c.driftSpeed), 0, 1, -c.driftAmp, c.driftAmp);
      const vy = map(noise(c.driftSeedY, t * c.driftSpeed), 0, 1, -c.driftAmp, c.driftAmp);
  
      // move circle
      c.x += vx;
      c.y += vy;
  
      // wrap around edges (so motion stays calm)
      const r = c.size / 2;
      if (c.x < -r) c.x = width + r;
      if (c.x > width + r) c.x = -r;
      if (c.y < -r) c.y = height + r;
      if (c.y > height + r) c.y = -r;
  
      // move the particles that belong to this circle by the SAME delta
      for (let p of particles) {
        if (p.circle === c) {
          p.x += vx;
          p.y += vy;
        }
      }
    }
  }

  function handleCircleCollisions() {
    const minFramesBetweenHits = 30; // cooldown 30 frames to prevent rapid repeats
    const touchThreshold = 0.5; // touch threshold (within 0.5 pixels)

    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            // check distance between centers
            const a = circles[i]; 
            const b = circles[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = sqrt(dx*dx + dy*dy);
            const minDist = (a.size/2) + (b.size/2); // 
            
            // only trigger when exactly touching (within 0.5 pixels) - avoid deep overlap
            const isExactlyTouching = abs(dist - minDist) < touchThreshold;
            
            // if circles are touching, check cooldown for both cirles, skip if either is on cooldown still
            if (isExactlyTouching) {
                if (frameCount - a.lastHitFrame < minFramesBetweenHits) continue;
                if (frameCount - b.lastHitFrame < minFramesBetweenHits) continue;
                
                playHitSound(a, b);
                
                // update the last hit time for both circles
                a.lastHitFrame = frameCount;
                b.lastHitFrame = frameCount;
            }
        }
    }
}

function playHitSound(a, b) {
    if (!audioStarted || !clinkSound) return;
    
    // adjust pitch based on circle size (smaller = higher pitch)
    const avgSize = (a.size + b.size) * 0.5;
    const minSize = min(width, height) * 0.03; // 3% of canvas width or height
    const maxSize = min(width, height) * 0.15; // 15% of canvas width or height
    
    // map size to playback rate (0.8x to 1.3x normal speed): smaller circles 1.3x higher pitch, larger circles 0.8x lower pitch
    const rate = map(avgSize, minSize, maxSize, 1.3, 0.8);
    
    const impact = 0.50; // to control volume of sound
    const volume = constrain(impact, 0.1, 1.5);
    
    // Configure and play the sound
    clinkSound.rate(rate);
    clinkSound.setVolume(volume);
    
    // pay from beginning (for quick successive hits)
    clinkSound.stop();
    clinkSound.play();
}

function draw() {
    background(70, 35, 60); // green background

    updateCircleDrift();
    handleCircleCollisions();

    // Draw the glassy circles first
    for (let i=0; i < circles.length; i++) {
        // Glassy fill: neutral color (no hue, high brightness) with alpha
        fill(0, 0, 90, circles[i].fillAlpha);
        
        // rim stroke: neutral color with alpha
        stroke(0, 0, 100, circles[i].strokeAlpha);
        strokeWeight(circles[i].strokeWeight);
        
        ellipse(circles[i].x, circles[i].y, circles[i].size, circles[i].size);
    }
    
    // Draw fuzzy particles inside the circles
    for (let i = 0; i < particles.length; i++) {
        drawFuzzyParticle(particles[i]);
    }
}

function mousePressed() {
    console.log('Mouse clicked at:', mouseX, mouseY);
    if (!audioStarted) {
        // Start audio context (required for browser autoplay policies)
        getAudioContext().resume().then(function() {
            audioStarted = true;
            console.log('Audio started!');
        });
    }
}

function keyPressed() {
    if (key === ' ') {
        // Spacebar to clear and reset
        particles = [];
        circles = [];
        setup();
    }
}

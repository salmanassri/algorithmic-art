/**  Diffusion-Limited Aggregation Algorithm **/

let particles;
let numParticles = 1100;
let noiseScale = 3.0;
let thresholdDistance = 17;
// Motion drift properties
const driftSpeed = 0.03;
const driftAmp = 5.0;

function createParticle() {
  return {
    x: random(width),
    y: random(height),
    hue: 20,
    radius: 15,
    frozen: false,
    parent: null, // remember its parent to keep its hue
    driftSeedX: random(1000),
    driftSeedY: random(1000)
  };
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
  
    particles = new Array(numParticles);
    for (let i = 0; i < numParticles; i++) {
      particles[i] = createParticle();
    }
  }

function checkFreezing(p) {
  let dx, dy, distance; // dx, dy are the distance in x and y to each particle.
  // we loop through all particles in the particles and calculate distance
  for (let i = 0; i < numParticles; i++) {
    if (particles[i].frozen) {
      dx = p.x - particles[i].x;
      dy = p.y - particles[i].y;
      distance = sqrt(dx * dx + dy * dy); // euclidean distance
      // if the distance is less than some threshold and the particle is frozen, freeze this particle
      if (distance < thresholdDistance) {
        p.frozen = true;
        p.parent = particles[i]; // save the particle's parent
        p.hue = (p.parent.hue + 5) % 360; // use the parent's hue + a little bit shift, and wrap around 360 to come around the colour wheel
        p.radius = p.parent.radius * 0.98; // decrease particle's radius by 2% of parent's radius
        return; // return to stop checking other particles
      }
    }
  }
}

function draw() {
    background(0);
  
    for (let i = 0; i < numParticles; i++) {
        
        let p = particles[i];

        if (!p.frozen) {
            // Perlin noise motion
            const t = frameCount * driftSpeed;
            const vx = map(noise(p.driftSeedX, t), 0, 1, -driftAmp, driftAmp);
            const vy = map(noise(p.driftSeedY, t), 0, 1, -driftAmp, driftAmp);
            p.x += vx + 0.26;
            p.y += vy + 0.3;
        
            // wrap around screen
            p.x = (p.x + width) % width;
            p.y = (p.y + height) % height;
        
            checkFreezing(p);
        }

        // display the particle
        noStroke(); // no outline
        fill(p.hue, 100, 100);
        circle(p.x, p.y, p.radius);
        if (p.parent != null) {
            // draw a line from this particle to its parent
            stroke(p.hue, 100, 100);
            line(p.x, p.y, p.parent.x, p.parent.y);
        }
    }
}


function mousePressed() {
  // freeze the seed particle at click position if it isn't frozen yet
  if (!particles[0].frozen) {
    particles[0].x = mouseX;
    particles[0].y = mouseY;
    particles[0].frozen = true;
  }
}


// Reference: https://www.youtube.com/watch?v=4_8a8JwXLp4
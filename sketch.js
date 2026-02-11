/**  Diffusion-Limited Aggregation Algorithm **/

let particles;
let numParticles = 1100;
let noiseScale = 3.0;
let thresholdDistance = 17;
// Motion drift properties
const driftSpeed = 0.015; // speed of particle movement
const driftAmp = 6.5;    // step size, how far the particle moves per frame
const mousePullStrength = 3.0; // how strongly particles drift toward mouse when space is held

function createParticle(x, y) {
  return {
    x: x !== undefined ? x : random(width), // if multiple trees
    y: y !== undefined ? y : random(height), // if multiple trees
    hue: 20,
    alpha: 70,
    radius: 15,
    frozen: false,
    parent: null, // remember its parent to keep its hue
    driftSeedX: random(1000),
    driftSeedY: random(1000)
  };
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
  
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
        p.alpha = 255; // fully opaque when frozen
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
            let vx = map(noise(p.driftSeedX, t), 0, 1, -driftAmp, driftAmp);
            let vy = map(noise(p.driftSeedY, t), 0, 1, -driftAmp, driftAmp);

            // when spacebar is held, drift particles toward mouse (stronger when closer)
            if (keyIsPressed && key === ' ') {
              const dx = mouseX - p.x;
              const dy = mouseY - p.y;
              const dist = sqrt(dx * dx + dy * dy);
              if (dist > 1) {
                const pull = mousePullStrength / (1 + dist / 150);
                vx += (dx / dist) * pull;
                vy += (dy / dist) * pull;
              }
            }

            // Perlin noise often averages slightly below 0.5, causing a bias toward negative (left/up) velocities. 
            // that's why we added those small biases, to compensate.
            p.x += vx + 0.26; // + bias affects horizontal movement of particles
            p.y += vy + 0.3; // + bias affects vertical movement of particles & growth direction
        
            // wrap around screen
            p.x = (p.x + width) % width;
            p.y = (p.y + height) % height;
        
            checkFreezing(p);
        }

        // display the particle
        noStroke(); // no outline
        fill(p.hue, 100, 100, p.alpha);
        circle(p.x, p.y, p.radius);
        if (p.parent != null) {
            // draw a line from this particle to its parent
            stroke(p.hue, 100, 100);
            line(p.x, p.y, p.parent.x, p.parent.y);
        }
    }
}


function mousePressed() {

// for multiple trees: find an unfrozen particle to make a new tree seed

  for (let i = 0; i < particles.length; i++) {
    if (!particles[i].frozen) {
      particles[i].x = mouseX;
      particles[i].y = mouseY;
      particles[i].frozen = true;
      particles[i].alpha = 255;
    //   particles[i].hue = random() < 0.45 ? random(330, 360) : random(0, 40); // reds/pinks range
      return;
    }
  }

}

// Where Rain Becomes Roots

let terrainPoints = [];
let terrainPoints2 = [];
let cloudX;
let cloudY;
let rainDrops = [];
let cloudScale = 1;
let flowers = [];
let flowerSpawChance = 0.25
const MIN_FLOWER_DIST = 25;
const NUM_RAIN_DROPS = 80;

function preload() {
    jasmineImg = loadImage('flowers/jasmine.png');
}

function setup() {
  createCanvas(windowWidth - (windowWidth * 0.1), windowHeight - (windowHeight * 0.2));
  
  // Precompute terrain heights with noise for organic look
  terrainPoints = [];

  const segments = 150;
  
  // draw first yellow terrain
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const n = noise(i * 0.03) * 50 + noise(i * 0.08 + 10) * 25;
    const y = height - 30 - n;
    terrainPoints.push({ x, y });
  }

  // second terrain (offset noise input so we get a different shape)
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const n = noise(i * 0.03 + 500) * 50 + noise(i * 0.08 + 510) * 25;
    const y = height - 20 - n;
    terrainPoints2.push({ x, y });
  }

  // cloud position at start
  cloudX = width * 0.02; 
  cloudY = height * 0.25;

  // Rain drops (positioned under the cloud)
  const spawnW = 70 * cloudScale; // widdth of the band under the cloud (70px) where rain can appear
  const spawnY = cloudY + 25 * cloudScale; // where new rain starts
  // each drop gets a random x in that band ^
  for (let i = 0; i < NUM_RAIN_DROPS; i++) {
    rainDrops.push({
      x: cloudX + random(-spawnW / 2, spawnW / 2),
      y: random(spawnY, height),
      len: random(1, 3),
      speed: random(1, 2)
    });
  }
}

function draw() {
    background(222, 249, 255); // Light blue-gray sky

    cloudX += 1;

    drawCloud(cloudX, cloudY, cloudScale);
    updateAndDrawRain(cloudX, cloudY);
    drawTerrain(terrainPoints, terrainPoints2);
    const flowerW = 30;
    const flowerH = 30;
    imageMode(CORNER);
    for (const f of flowers) {
        image(jasmineImg, f.x - flowerW / 2, f.y - flowerH, flowerW, flowerH);
    }
}

// TODO: make the cloud more intricate: https://www.youtube.com/watch?v=r5txidNXpFI
function drawCloud(cx, cy, scale) {
  noStroke();
  fill(255, 255, 255);
  ellipse(cx - 25 * scale, cy, 50 * scale, 35 * scale);
  ellipse(cx, cy - 10 * scale, 60 * scale, 45 * scale);
  ellipse(cx + 30 * scale, cy, 55 * scale, 40 * scale);
  ellipse(cx + 10 * scale, cy + 5 * scale, 45 * scale, 35 * scale);
  ellipse(cx - 10 * scale, cy + 5 * scale, 40 * scale, 30 * scale);
}

function updateAndDrawRain(cx, cy) {
  const spawnW = 70 * cloudScale;
  const spawnY = cy + 25 * cloudScale;

  stroke(174, 194, 224);
  strokeWeight(2);

  for (const d of rainDrops) {
    d.y += d.speed;
    const terrainY = getTerrainYAt(d.x);
    if (d.y >= terrainY) {
        spawnFlowerAtImpact(d.x, terrainY);
        d.x = cx + random(-spawnW / 2, spawnW / 2);
        d.y = spawnY;
    } else if (d.y > height) {
      d.x = cx + random(-spawnW / 2, spawnW / 2);
      d.y = spawnY;
    }
    line(d.x, d.y, d.x + 2, d.y + d.len);
  }
}

function getTerrainYAt(x) {
    const points = terrainPoints;
    if (x <= 0) return points[0].y; //if x is off canvas, return the leftmost point's y
    if (x >= width) return points[points.length - 1].y; // if x is off canvas to the right, return the rightmost point's y
    const i = round(x / width * (points.length - 1)); // find the index of the point closest to the x value
    const idx = constrain(i, 0, points.length - 1);
    return points[idx].y;
}

function spawnFlowerAtImpact(impactX, terrainYAtImpact) {
    if (random() > flowerSpawChance) return;
  
    const xClamp = constrain(impactX, 15, width - 15); // clamp to keep flower at least 15px from the left and right edges of canvas
    const terrainTop = getTerrainYAt(xClamp); // get terrain top edge - y value
    const y = random(terrainTop, height); // random bt terrain top and bottom of canvas
  
    for (const f of flowers) { // loop over existing flowers to check min distance
      if (dist(f.x, f.y, xClamp, y) < MIN_FLOWER_DIST) return;
    }
    flowers.push({ x: xClamp, y: y });
  }

function drawTerrain(points1, points2) {

    // draw first yellow terrain
    fill(195, 175, 110);
    stroke(45, 58, 38);
    strokeWeight(2);
    beginShape();
    vertex(0, height);
    for (const p of points1) {
    vertex(p.x, p.y);
    }
    vertex(width, height);
    endShape(CLOSE);

    // draw second green terrain
    fill(60, 75, 50);
    beginShape();
    vertex(0, height);
    for (const p of points2) {
    vertex(p.x, p.y);
    }
    vertex(width, height);
    endShape(CLOSE);
}
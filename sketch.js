let terrainPoints = [];
let terrainPoints2 = [];

function setup() {
  createCanvas(windowWidth - (windowWidth * 0.1), windowHeight - (windowHeight * 0.2));
  
  // Precompute terrain heights with noise for organic look
  terrainPoints = [];

  const segments = 150;
  
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
}

function draw() {
    background(222, 249, 255); // Light blue-gray sky

    drawCloud(width * 0.5, height * 0.25, 1);
    drawTerrain(terrainPoints, terrainPoints2);


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
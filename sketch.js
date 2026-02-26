let yearSelect;
let selectedYear = null;
let top10Countries = [];
let terrainPoints = [];
let terrainPoints2 = [];
let clouds = [];
const CLOUD_Y_MIN = 0.15;
const CLOUD_Y_MAX = 0.35;
const CLOUD_SPEED_MIN = 0.3;
const CLOUD_SPEED_MAX = 0.8;
const CLOUD_WRAP_MARGIN_RATIO = 0.12; // fraction of width for spawn/wrap off-screen
const MIN_CLOUD_SCALE = 0.6;
const MAX_CLOUD_SCALE = 1.3;
const MIN_RAIN_DROPS = 15;
const MAX_RAIN_DROPS = 100;
let flowers = [];
let flowerSpawnChance = 0.20;
const MIN_FLOWER_DIST = 20;
let canvasScaleFactor;

// Country -> flower image. Unmapped countries get a random flower
const COUNTRY_FLOWERS = {
  'Philippines': 'jasmine',
  'Pakistan': 'jasmine',
  'Syria': 'rose',
  'Iran': 'rose',
  'United States of America': 'rose-pink',
  'India': 'lotus',
  "China, People's Republic of": 'peony',
  'France': 'iris',
  'Ukraine': 'sunflower',
  'Eritrea': 'daisy-orange',
  'Afghanistan': 'tulip-blue'
};

const FLOWER_FILES = ['jasmine', 'rose', 'rose-pink', 'lotus', 'peony', 'iris', 'daisy-orange', 'daisy-yellow', 'tulip-blue', 'tulip-white', 'sunflower'];
let flowerImages = {};

function preload() {
  dataset = loadTable('data/Totals.csv', 'csv', 'header');
  for (const name of FLOWER_FILES) {
    flowerImages[name] = loadImage('flowers/' + name + '.png');
  }
}

function setup() {
  createCanvas(windowWidth - (windowWidth * 0.1), windowHeight - (windowHeight * 0.2));
  canvasScaleFactor = width / 1100;

  // title
  const title = createElement('h2', 'Garden of Many Skies');
  title.style('color', 'white');
  title.position(width * 0.45, 10);
  title.style('margin-top', '20px');

  setupYearDropdown();

  // Precompute terrain heights
  terrainPoints = [];
  const segments = 150;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const n = noise(i * 0.03) * 50 + noise(i * 0.08 + 10) * 25;
    terrainPoints.push({ x, y: height - 100 - n });
  }
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const n = noise(i * 0.03 + 500) * 50 + noise(i * 0.08 + 510) * 25;
    terrainPoints2.push({ x, y: height - 85 - n });
  }
}

function setupYearDropdown() {
    yearLabelP = createP('Year: ');
    yearLabelP.style('color', 'white');
    yearLabelP.position(80, 10);

    yearSelect = createSelect();
    yearSelect.position(130, 20);
    yearSelect.style('width', '80px');
    yearSelect.style('height', '30px');
    yearSelect.option('Select', '');
    for (let y = 2015; y <= 2025; y++) {
      yearSelect.option(y);
    }
    yearSelect.selected('');

    yearSelect.changed(() => {
      const val = yearSelect.value();
      if (val === '') {
        selectedYear = null;
        top10Countries = [];
        flowers = [];
        syncCloudsToTop10();
      } else {
        selectedYear = parseInt(val, 10);
        top10Countries = getTop10Countries(dataset, selectedYear);
        syncCloudsToTop10();
      }
    });
}

function getTop10Countries(table,year) {
    const col = year.toString();
    const rows = table.getRows();
    const data = [];
    for (let i =0; i < rows.length; i++) {
        const country = rows[i].getString('Country');
        const value = rows[i].getString(col);
        if (value === '' || value == null) continue;
        const numImmigrants = parseInt(value, 10);
        if (isNaN(numImmigrants)) continue;
        data.push({ country, value: numImmigrants });
    }
    data.sort((a, b) => b.value - a.value);
    return data.slice(0, 10);
}

function createRainDropsForCloud(cx, cy, scale, numDrops) {
  const spawnW = 50 * scale * canvasScaleFactor;
  const spawnY = cy + 25 * scale * canvasScaleFactor;   
  const drops = [];

  for (let i = 0; i < numDrops; i++) {
    drops.push({
      x: cx + random(-spawnW, spawnW),
      y: random(spawnY, height),
      len: random(1, 3) * canvasScaleFactor,
      speed: random(1, 2) * canvasScaleFactor
    });
  }
  return drops;
}

function syncCloudsToTop10() {
    /* 
    * Syncs the clouds to the top 10 countries.
    * size and rain are proportional to the country's immigration value.
    * When value changes, clouds are added/removed/updated 
    */
    // if (!top10Countries || top10Countries.length === 0) {
    //   clouds = [];
    //   return;
    // }

    // get max value of current top 10, and map each country's value to scale and num of rain drops
    const maxValue = max(top10Countries.map(c => c.value));
    const minValue = min(top10Countries.map(c => c.value));
    // console.log('minValue', minValue, 'maxValue', maxValue);
    const cloudByCountry = {};
    for (const c of clouds) cloudByCountry[c.country] = c; // map cloud to country

    const nextClouds = [];
    for (let i = 0; i < top10Countries.length; i++) {
        console.log('minValue', minValue, 'maxValue', maxValue);
        const { country, value } = top10Countries[i];
        // map the country’s value from [0, maxValue] to [MIN_CLOUD_SCALE, MAX_CLOUD_SCALE] 
        const scale = map(value, minValue, maxValue, MIN_CLOUD_SCALE, MAX_CLOUD_SCALE); 
        // same mapping but to rain dropss
        const numDrops = round(map(value, minValue, maxValue, MIN_RAIN_DROPS, MAX_RAIN_DROPS)); 

        // if we already have a cloud for this country, update its values (since year changes)
        const existing = cloudByCountry[country]; 
        if (existing) {
            existing.value = value;
            existing.scale = scale;
            if (existing.speed == null) {
            const speedMag = random(CLOUD_SPEED_MIN, CLOUD_SPEED_MAX) * canvasScaleFactor;
            existing.speed = random() < 0.5 ? -speedMag : speedMag;
            }
            // replace existing rainDrops with a new set of drops for the current position, scale, and numDrops
            existing.rainDrops = createRainDropsForCloud(existing.x, existing.y, scale, numDrops);
            nextClouds.push(existing);
        } else { // no cloud for this country, create new one
            const margin = width * CLOUD_WRAP_MARGIN_RATIO;
            const x = random(-margin, width + margin);
            const y = height * random(CLOUD_Y_MIN, CLOUD_Y_MAX);
            const speedMag = random(CLOUD_SPEED_MIN, CLOUD_SPEED_MAX) * canvasScaleFactor;
            const speed = random() < 0.5 ? -speedMag : speedMag;
            nextClouds.push({
            country,
            value,
            x,
            y,
            scale,
            speed,
            rainDrops: createRainDropsForCloud(x, y, scale, numDrops)
            });
        }
    }
    clouds = nextClouds;
}

function draw() {
    background(222, 249, 255); // Light blue-gray sky

    for (const cloud of clouds) {
      cloud.x += cloud.speed != null ? cloud.speed : CLOUD_SPEED_MIN;
      const margin = width * CLOUD_WRAP_MARGIN_RATIO;
      if (cloud.x > width + margin) cloud.x = -margin;
      if (cloud.x < -margin) cloud.x = width + margin;
      drawCloud(cloud.x, cloud.y, cloud.scale);
      updateAndDrawRain(cloud.x, cloud.y, cloud.country, cloud.rainDrops, cloud.scale);
    }

    const hoveredCloud = clouds.find(c => isMouseOverCloud(c));
    if (hoveredCloud) drawCloudTooltip(hoveredCloud);

    drawTerrain(terrainPoints, terrainPoints2);
    const flowerW = 27 * canvasScaleFactor;
    imageMode(CORNER);
    for (const f of flowers) {
        const img = f.img || flowerImages['jasmine'];
        const flowerH = flowerW * (img.height / img.width);
        if (img) image(img, f.x - flowerW / 2, f.y - flowerH, flowerW, flowerH);
    }
}

// can make the cloud more intricate and animated: https://www.youtube.com/watch?v=r5txidNXpFI
function drawCloud(cx, cy, scale) {
  const cloudScale = scale * canvasScaleFactor;
  noStroke();
  fill(255, 255, 255);
  ellipse(cx - 25 * cloudScale, cy, 50 * cloudScale, 35 * cloudScale);
  ellipse(cx, cy - 10 * cloudScale, 60 * cloudScale, 45 * cloudScale);
  ellipse(cx + 30 * cloudScale, cy, 55 * cloudScale, 40 * cloudScale);
  ellipse(cx + 10 * cloudScale, cy + 5 * cloudScale, 45 * cloudScale, 35 * cloudScale);
  ellipse(cx - 10 * cloudScale, cy + 5 * cloudScale, 40 * cloudScale, 30 * cloudScale);
}

function isMouseOverCloud(cloud) {
  const r = 55 * cloud.scale * canvasScaleFactor;
  return dist(mouseX, mouseY, cloud.x, cloud.y) < r;
}

function drawCloudTooltip(cloud) {
    const tooltipScaleFactor = canvasScaleFactor / 1.2;
    const label = cloud.country + '\n' + cloud.value.toLocaleString();
    const padding = 10 * tooltipScaleFactor;
    const fontSize = 14 * tooltipScaleFactor;
    textSize(fontSize);
    textAlign(LEFT, TOP);
    const countryWidth = textWidth(cloud.country);
    const valueWidth = textWidth(cloud.value.toLocaleString());
    const boxW = max(countryWidth, valueWidth) + padding * 2;
    const boxH = fontSize * 2 + padding * 2;
    const offset = 15 * tooltipScaleFactor; // distance from cursor to tooltip
    const edgePad = 5 * tooltipScaleFactor; // min space bt tooltip and edge of canvas (if too close we flip the tooltip)
    let tooltipX = mouseX + offset;
    let tooltipY = mouseY + offset;
    if (tooltipX + boxW > width) tooltipX = mouseX - boxW - edgePad;
    if (tooltipY + boxH > height) tooltipY = mouseY - boxH - edgePad;
    if (tooltipX < 0) tooltipX = edgePad;
    if (tooltipY < 0) tooltipY = edgePad;
    fill(255, 255, 240);
    stroke(80);
    strokeWeight(1 * tooltipScaleFactor);
    rect(tooltipX, tooltipY, boxW, boxH, 4 * tooltipScaleFactor);
    noStroke();
    fill(40);
    text(label, tooltipX + padding, tooltipY + padding);
}

function updateAndDrawRain(cx, cy, rainCountry, rainDrops, scale) {
  const spawnW = 50 * scale * canvasScaleFactor; // range of drop position from center of cloud
  const spawnY = cy + 25 * scale * canvasScaleFactor; // y position used when drop is re-spawned

  stroke(174, 194, 224);
  strokeWeight(2 * canvasScaleFactor);

  for (const d of rainDrops) {
    d.y += d.speed;
    const terrainY = getTerrainYAt(d.x);
    if (d.y >= terrainY) {
      spawnFlowerAtImpact(d.x, terrainY, rainCountry);
      d.x = cx + random(-spawnW, spawnW); // range of drop position from center of cloud
      d.y = spawnY;
    } else if (d.y > height) {
      d.x = cx + random(-spawnW, spawnW);
      d.y = spawnY;
    }
    line(d.x, d.y, d.x + 2 * canvasScaleFactor, d.y + d.len * canvasScaleFactor);
  }
}

function getTerrainYAt(x) {
    const points = terrainPoints;
    if (x <= 0) return points[0].y; //if x is off canvas, return the leftmost point's y
    if (x >= width) return points[points.length - 1].y; // if x is off canvas to the right, return the rightmost point's y
    const i = round(x / width * (points.length - 1)); // find the index of the point closest to the x value
    // const idx = constrain(i, 0, points.length - 1); // clamp index i so it's never <0 or > points.length - 1
    return points[i].y;
}

function getFlowerImage(country) {
  const key = country && COUNTRY_FLOWERS[country] != null
    ? COUNTRY_FLOWERS[country]
    : FLOWER_FILES[floor(random(FLOWER_FILES.length))];
  return flowerImages[key] || flowerImages['jasmine'];
}

function spawnFlowerAtImpact(impactX, terrainYAtImpact, country) {
  if (random() > flowerSpawnChance) return;

  const xClamp = constrain(impactX, 15, width - 15); // clamp flower's x position to keep on canvas with 15px margin
  const terrainTop = getTerrainYAt(xClamp);
  const y = random(terrainTop, height);

  for (const f of flowers) {
    if (dist(f.x, f.y, xClamp, y) < MIN_FLOWER_DIST) return;
  }
  const img = getFlowerImage(country);
  flowers.push({ x: xClamp, y: y, img: img });
}

function drawTerrain(points1, points2) {

    // draw first yellow terrain
    fill(195, 175, 110);
    stroke(45, 58, 38);
    strokeWeight(2);
    beginShape();
    vertex(0, height); // draw the leftmost point on the terrain
    for (const p of points1) {
        vertex(p.x, p.y); // draw each point on the terrain
    }
    vertex(width, height); // draw the rightmost point on the terrain
    endShape(CLOSE);

    // draw second green terrain
    fill(60, 75, 50);
    beginShape();
    vertex(0, height); // draw the leftmost point on the terrain
    for (const p of points2) {
        vertex(p.x, p.y); // draw each point on the terrain
    }
    vertex(width, height); // draw the rightmost point on the terrain
    endShape(CLOSE);
}
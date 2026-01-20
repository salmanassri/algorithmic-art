// P5.js Sketch
// This is where you'll write your creative code

// TODO: make everything a function of the width and height of the canvas (or screen?)
// Use ratios instead of fixed values 
// TODO: Pick a magic number
// To make circle border look like it's vibrating, can randomize their size within a very small range


let circles = []; // array to store circle data


function setup() {
    // Create a canvas that fits the window
    createCanvas(windowWidth, windowHeight);
    // background(220);
    
    // Set color mode to HSB for hue, saturation, and brightness
    colorMode(HSB, 360, 100, 100);

    // Create 25-35 circles with random positions and sizes (no overlaps)
    randomNum = random(28, 55);
    for (let i=0; i<randomNum; i++) {
        circles.push({
            x: random(width),
            y: random(height),
            size: random(20, 100), 
            hue: random(0, 360), // random hue for neon colors
            strokeWeight: random(2, 3) // random stroke thickness
        });
    }
}

function draw() {
    // This function runs continuously
    // Draw a simple animated circle as an example
    // background(220, 220, 220, 25); // Semi-transparent background for trail effect
    background(10); // fully opaque grey canvas
    
    // Draw the circles with neon outlines
    noFill(); // circles have no fill
    for (let i=0; i < circles.length; i++) {
        // set stroke to bright neon color
        stroke(circles[i].hue, 100, 100); // 100% saturation, 100% brightness for neon effect
        strokeWeight(circles[i].strokeWeight);
        ellipse(circles[i].x, circles[i].y, circles[i].size, circles[i].size);
    }


    // Draw a circle that follows the mouse
    // fill(100, 150, 255);
    // noStroke();
    // ellipse(mouseX, mouseY, 50, 50);
}

// Optional: Handle mouse clicks
function mousePressed() {
    console.log('Mouse clicked at:', mouseX, mouseY);
}

// Optional: Handle key presses
function keyPressed() {
    if (key === ' ') {
        // Spacebar to clear
        background(220);
    }
}


# Garden of Many Skies

Am interactive generative art piece visualizing immigration to Canada through a living garden metaphor.

Each cloud drifting over the Canadian landscape represents a country of origin. As they pass, they release rain—the density of rainfall visualizing the number of immigrants arriving from that nation in a given year. Where the rain falls, flowers bloom, each in a unique colour representing its country of origin.

The piece transforms raw displacement and migration data into a vibrant, growing garden—a meditation on how immigrants enrich and bring colour to their new home. The green Canadian terrain below becomes progressively more bloomed and vibrant with each passing shower, celebrating the mosaic of cultures that shape the nation.

## Run locally

1. Serve the project with a local server (e.g. Python):
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` in your browser.

## Data

- **Source:** [Open Canada – Permanent Residents by Country of Citizenship and Immigration Category](https://open.canada.ca/data/en/dataset/f7e5498e-0ad8-4417-85c9-9b8aff9b9eda/resource/d3821cd3-4dcf-4fe3-acc1-ebaef490a8b3)
- **Related IRCC Datasets** [Permanent Residents – Monthly IRCC Updates](https://open.canada.ca/data/en/dataset/f7e5498e-0ad8-4417-85c9-9b8aff9b9eda)
- **CSV File:** `data/Totals.csv` — yearly totals by country (2015–2025)

## Tech

- [P5.js](https://p5js.org/) for the sketch
- `index.html` loads the sketch; `sketch.js` contains the visualization logic and uses the flower images in `flowers/`.

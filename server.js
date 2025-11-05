const express = require('express');
const bodyParser = require('body-parser');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static('public'));

registerFont('/fonts/Lovet__.ttf', { family: 'LoveIt' });

app.post('/generate', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send('No text provided');

  const width = 400;
  const height = 100;
  const encoder = new GIFEncoder(width, height);

  const filename = `output_${Date.now()}.gif`;
  const filePath = path.join(__dirname, 'public', filename);

  const stream = fs.createWriteStream(filePath);
  encoder.createReadStream().pipe(stream);

  encoder.start();
  encoder.setRepeat(0);         // loop forever
  encoder.setDelay(80);          // faster frame delay for drawing effect
  encoder.setQuality(10);
  encoder.setTransparent(0x00000000);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.font = '40px LoveIt';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';

  const chars = text.split('');

  // Generate frames where letters gradually “draw themselves”
  for (let f = 0; f < chars.length * 4; f++) {
    ctx.clearRect(0, 0, width, height);

    // Draw each letter with progressive stroke appearance
    chars.forEach((char, idx) => {
      const progress = Math.min(Math.max(f - idx * 4, 0), 4) / 4; // 0 → 1
      if (progress > 0) {
        // Simulate letter "stroke" by drawing partial width
        const letterWidth = ctx.measureText(char).width;
        ctx.save();
        ctx.beginPath();
        ctx.rect(width/2 - letterWidth/2, 0, letterWidth * progress, height); // reveal width
        ctx.clip();
        ctx.fillText(char, width/2 - (chars.length/2 - idx) * 25, height / 2);
        ctx.restore();
      }
    });

    encoder.addFrame(ctx);
  }

  // Hold final frame
  for (let j = 0; j < 8; j++) {
    ctx.clearRect(0, 0, width, height);
    chars.forEach((char, idx) => {
      ctx.fillText(char, width/2 - (chars.length/2 - idx) * 25, height / 2);
    });
    encoder.addFrame(ctx);
  }

  encoder.finish();

  stream.on('close', () => {
    res.json({ url: `/${filename}` });
  });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://localhost:${PORT}`));

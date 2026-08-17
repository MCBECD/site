// Verify specific UI regions in a rendered frame. Usage:
//   node scripts/verify-regions.mjs <png> <region:label=minX,minY,maxX,maxY>...
// Prints mean brightness + presence per region.
import { execFileSync } from "node:child_process";

const png = process.argv[2];
const regions = process.argv.slice(3).map((arg) => {
  const [label, box] = arg.split("=");
  const [x0, y0, x1, y1] = box.split(",").map(Number);
  return { label, x0, y0, x1, y1 };
});

const raw = execFileSync(process.env.FFMPEG ?? "ffmpeg", [
  "-y", "-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1",
], { maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "ignore"] });
const W = 1920;

for (const { label, x0, y0, x1, y1 } of regions) {
  let s = 0, n = 0, max = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 3;
      const v = (raw[i] + raw[i + 1] + raw[i + 2]) / 3;
      s += v; n++;
      if (v > max) max = v;
    }
  }
  console.log(`${label.padEnd(18)} mean=${(s / n).toFixed(1).padStart(6)} max=${String(max).padStart(3)}`);
}

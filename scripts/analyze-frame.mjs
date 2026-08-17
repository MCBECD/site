// Brightness-region map: shows average brightness per cell so dark cards,
// text, and glows are all visible. Usage:
//   node scripts/analyze-frame.mjs <png> [--grid 32x18]
import { execFileSync } from "node:child_process";

const png = process.argv[2];
if (!png) {
  console.error("usage: node analyze-frame.mjs <png> [--grid WxH]");
  process.exit(1);
}
const args = process.argv.slice(3);
const gi = args.indexOf("--grid");
const [gw, gh] = (gi >= 0 ? args[gi + 1] : "32x18").split("x").map(Number);

const raw = execFileSync(process.env.FFMPEG ?? "ffmpeg", [
  "-y", "-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1",
], { maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "ignore"] });
const W = 1920, H = 1080;
const cw = Math.ceil(W / gw), ch = Math.ceil(H / gh);
const sum = Array.from({ length: gh }, () => new Array(gw).fill(0));

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const lum = (raw[i] + raw[i + 1] + raw[i + 2]) / 3;
    sum[Math.floor(y / ch)][Math.floor(x / cw)] += lum;
  }
}

console.log(`frame: ${png}  grid: ${gw}x${gh}  (0-9 brightness: 0=black 9=white)`);
const ramp = " .:-=+*#%@";
for (let r = 0; r < gh; r++) {
  let line = "";
  for (let c = 0; c < gw; c++) {
    const avg = sum[r][c] / (cw * ch);
    line += ramp[Math.min(ramp.length - 1, Math.floor((avg / 255) * ramp.length))];
  }
  console.log(line);
}

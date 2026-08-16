#!/usr/bin/env bash
# MCBECD 演示视频后期合成：动态模糊 + 中英字幕烧录 + 输出 MP4
# 用法：bash assemble.sh [输入.webm] [输出.mp4]
# 依赖：ffmpeg（>= 4.2，需要 tmix / tblend / ass 滤镜）
# 可选：MOTION=pro bash assemble.sh  —— 启用更重的 minterpolate 运动插值（更顺滑但更慢）
set -euo pipefail

INPUT="${1:-$(ls -t *.webm 2>/dev/null | head -1)}"
OUTPUT="${2:-mcbecd-demo.mp4}"

if [[ -z "$INPUT" || ! -f "$INPUT" ]]; then
  echo "错误：找不到输入视频（默认取当前目录最新的 .webm，或用参数指定）" >&2
  exit 1
fi

# 优先用系统 ffmpeg，找不到就回退到 ffmpeg-static（node_modules）
FF=ffmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
  FF=$(node -e "process.stdout.write(require('ffmpeg-static'))" 2>/dev/null || echo "")
fi
if [[ -z "$FF" ]]; then
  echo "错误：找不到 ffmpeg，请安装 ffmpeg 或 npm i ffmpeg-static" >&2
  exit 1
fi

echo "输入：$INPUT"
echo "输出：$OUTPUT"

# 动态模糊：
#   - 默认：tmix（1:2:1 高斯权重时间域混合），相邻帧叠加产生拖影，快且稳
#   - MOTION=pro：先 minterpolate 插帧到 60fps 再 tmix，更顺滑但很吃 CPU/内存
if [[ "${MOTION:-}" == "pro" ]]; then
  BLUR="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,tmix=frames=3:weights=1 2 1"
  FPS=60
else
  BLUR="tmix=frames=3:weights=1 2 1"
  FPS=30
fi

echo "动态模糊模式：${MOTION:-default}"
echo "开始合成（动态模糊 + 字幕烧录）..."
"$FF" -hide_banner -loglevel warning -y -i "$INPUT" \
  -vf "$BLUR,ass=subtitles.ass,format=yuv420p" \
  -c:v libx264 -preset slow -crf 17 -profile:v high \
  -r "$FPS" \
  -movflags +faststart \
  "$OUTPUT"

echo "完成：$OUTPUT"

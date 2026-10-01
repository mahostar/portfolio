export function coverPoint(
  u: number,
  v: number,
  box: { w: number; h: number },
  img: { w: number; h: number },
  align = { x: 1, y: 0.5 },
) {
  const scale = Math.max(box.w / img.w, box.h / img.h);
  const width = img.w * scale,
    height = img.h * scale;
  return {
    x: (box.w - width) * align.x + u * width,
    y: (box.h - height) * align.y + v * height,
  };
}

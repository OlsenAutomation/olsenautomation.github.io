// Shared pure mapping functions, tested at boundaries and invalid inputs.
export function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
export function frameIndex(progress, count) {
  return Math.round(clamp(progress) * Math.max(0, count - 1));
}
export function mediaTime(progress, duration, fps = 24) {
  return clamp(progress) * Math.max(0, duration - 1 / fps);
}
export function selectVariant(variants, width) {
  const sorted = [...variants].sort((a,b) => a.width - b.width);
  return sorted.find(item => item.width >= width) || sorted.at(-1);
}

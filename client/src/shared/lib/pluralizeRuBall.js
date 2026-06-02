/**
 * @param {number} count
 * @returns {"балл" | "балла" | "баллов"}
 */
export function pluralizeRuBall(count) {
  const n = Math.abs(Math.trunc(Number(count)));
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "балл";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "балла";
  }
  return "баллов";
}

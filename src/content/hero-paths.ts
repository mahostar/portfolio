// Image-space routes traced against hero-bg.webp (1983 × 793).
// Mobile is a crop at x=960, so its routes use the same photographed copper.
export const heroRoutes = [
  {
    id: "io",
    anchor: "io",
    d: "M1510 412H1440V400H1405L1375 370V282L1320 227V167H1130L1106 191H1038V218",
  },
  { id: "ai", anchor: "ai", d: "M1510 412H1432V388" },
  { id: "pcb", anchor: "pcb", d: "M1510 412H1440V450H1348L1293 505V545" },
  { id: "pcb-return", anchor: "pcb", d: "M1510 412H1440V458H1356L1301 513V537L1293 545" },
  {
    id: "robotics",
    anchor: "robotics",
    d: "M1510 412V335H1574V280L1628 226V154L1660 122V95H1730L1745 80H1765",
  },
] as const;

export function cropRoute(path: string, left: number) {
  // Explicit command parser: only x coordinates of M/L/H change under a crop.
  return path.replace(/([MLHV])([\d .-]+)/g, (_, command: string, values: string) => {
    const numbers = values.trim().split(/\s+/).map(Number);
    if (command === "H") numbers[0] -= left;
    else if (command !== "V")
      for (let i = 0; i < numbers.length; i += 2) numbers[i] -= left;
    return command + numbers.join(" ");
  });
}

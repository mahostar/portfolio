import fs from "node:fs/promises";
await fs.mkdir("public/images/projects", { recursive: true });
await import("./prepare-hero-assets.mjs");
await import("./make-trace-mask.mjs");
await fs
  .access("cv.pdf")
  .then(() => fs.copyFile("cv.pdf", "public/cv.pdf"))
  .catch(() => {});
console.log(
  "Signal Path images and masks regenerated; existing project media preserved.",
);

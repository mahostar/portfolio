export function reveal(element: HTMLElement, delay = 0) {
  return element.animate(
    [
      { opacity: 0.3, transform: "translateY(16px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 550, delay, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
  );
}

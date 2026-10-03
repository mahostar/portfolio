type WelcomeDocument = {
  initialPath: string;
  navigationType: string;
  state: "inactive" | "armed" | "playing" | "retired";
  generation: number;
};

declare global {
  interface Window {
    __portfolioWelcome?: WelcomeDocument;
  }
}

// This function is serialized into the head script. Keep it self-contained:
// it runs before hydration and never reclassifies a client-side route change.
function initializeWelcomeDocument() {
  if (window.__portfolioWelcome) return;
  const root = document.documentElement;
  try {
    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const initialPath = location.pathname;
    const navigationType = navigation?.type ?? "unknown";
    const boot: WelcomeDocument = {
      initialPath,
      navigationType,
      // A pasted URL/new tab is "navigate", while Refresh is "reload".
      // Missing timing data should still welcome a fresh homepage document.
      // History restores must not replay the intro.
      state: initialPath === "/" && navigationType !== "back_forward" ? "armed" : "inactive",
      generation: 0,
    };
    window.__portfolioWelcome = boot;
    if (boot.state === "armed") {
      // Start homepage arrivals at the top before the intro reveals the page.
      const previousRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      addEventListener("pageshow", (event) => {
        // Restoration and anchor scrolling can run after pageshow is dispatched.
        requestAnimationFrame(() => {
          if (!event.persisted && location.pathname === initialPath) {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          }
          history.scrollRestoration = previousRestoration;
        });
      }, { once: true });
      root.dataset.welcome = "pending";
      setTimeout(() => {
        if (boot.state === "armed") {
          boot.state = "retired";
          delete root.dataset.welcome;
        }
      }, 8000);
    }
    // Retire before cache suspension, including when hydration has not started.
    addEventListener("pagehide", () => {
      boot.state = "retired";
      delete root.dataset.welcome;
    });
    addEventListener("pageshow", (event) => {
      if (event.persisted) {
        boot.state = "retired";
        delete root.dataset.welcome;
      }
    });
    addEventListener("popstate", () => {
      if (location.pathname !== boot.initialPath) {
        boot.state = "retired";
        delete root.dataset.welcome;
      }
    });
  } catch {
    delete root.dataset.welcome;
  }
}

export const welcomeStartupScript = `(${initializeWelcomeDocument.toString()})();`;

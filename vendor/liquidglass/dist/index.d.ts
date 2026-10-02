/**
 * liquidglass — A liquid glass effect library for the web.
 *
 * Apply realistic glass refraction, blur, chromatic aberration, and
 * lighting to any HTML element using WebGL shaders.
 *
 * @example
 *   const instance = await LiquidGlass.init({
 *       root: document.querySelector('#my-root'),
 *       glassElements: document.querySelectorAll('.glass'),
 *   });
 *
 *   // Later:
 *   instance.destroy();
 */
export { LiquidGlass } from './LiquidGlass.js';
export type { LiquidGlassOptions } from './LiquidGlass.js';
export { DEFAULTS } from './defaults.js';
export type { GlassConfig } from './defaults.js';
export { invalidateFontEmbedCache } from './HtmlCapture.js';
//# sourceMappingURL=index.d.ts.map
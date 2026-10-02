"use client";

import { useEffect, useRef } from "react";
import styles from "./liquid-glass.module.css";
import { colorToRgb, getGlassSettings, initializeGlassSettings, subscribeGlassSettings } from "./glass-settings";

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0., 1.);
}`;

// A rounded capsule with a curved bevel, lit by two point lights. The narrow
// and broad specular lobes share the same surface normal and light vectors.
// No highlight textures or pointer-positioned painted spots are involved.
const fragmentSource = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_size;
uniform vec2 u_pointer;
uniform float u_press;
uniform float u_hover;
uniform vec3 u_gold;
uniform vec4 u_lighting;
uniform vec4 u_shape;
uniform vec4 u_finish;
uniform vec4 u_light1;
uniform vec4 u_light2;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_response;
uniform float u_glow;

float capsule(vec2 p, vec2 size) {
  float radius = size.y * .5;
  vec2 q = vec2(max(abs(p.x) - (size.x * .5 - radius), 0.), p.y);
  return length(q) - radius;
}

vec3 lightReflection(vec3 n, vec3 p, vec3 source, vec3 color, float intensity) {
  vec3 light = normalize(source - p);
  vec3 halfVector = normalize(light + vec3(0., 0., 1.));
  float alignment = max(dot(n, halfVector), 0.);
  float specular = pow(alignment, u_finish.x) * u_finish.z;
  float bloom = pow(alignment, 32.) * u_finish.y;
  return color * (specular + bloom) * intensity;
}

void main() {
  vec2 p = (v_uv - .5) * (u_size + vec2(24., 20.));
  float distance = capsule(p, u_size - vec2(1.));
  float depth = max(-distance, 0.);
  float radius = (u_size.y - 1.) * .5;
  vec2 q = vec2(sign(p.x) * max(abs(p.x) - (u_size.x * .5 - .5 - radius), 0.), p.y);
  vec2 outward = q / max(length(q), .001);
  float t = clamp(1. - depth / u_shape.x, 0., .999);
  float slope = u_shape.y / u_shape.x * t / sqrt(max(1. - t * t, .002));
  vec3 normal = normalize(vec3(outward * slope, 1.));
  vec2 tilt = u_pointer * .085 * (1. + u_press * .55) * u_response;
  tilt += vec2(-.018, .018) * u_hover * u_response;
  normal = normalize(normal + vec3(tilt, 0.));
  float height = u_shape.y * sqrt(max(1. - t * t, 0.));
  vec3 position = vec3(p, height);
  vec3 light1 = u_light1.xyz + vec3(u_pointer * 135. + vec2(24., -24.) * u_hover, u_press * -36.) * u_response;
  vec3 light2 = u_light2.xyz + vec3(u_pointer * -110. + vec2(-20., 20.) * u_hover, u_press * -36.) * u_response;
  float diffuse1 = max(dot(normal, normalize(light1 - position)), 0.);
  float diffuse2 = max(dot(normal, normalize(light2 - position)), 0.);
  vec3 color = u_gold * (u_lighting.x + diffuse1 * u_lighting.y * u_light1.w + diffuse2 * u_lighting.z * u_light2.w);
  float reflectionIntensity = u_lighting.w * (1. + (u_hover * .16 + u_press * .1) * u_response);
  color += lightReflection(normal, position, light1, u_color1, reflectionIntensity * u_light1.w);
  color += lightReflection(normal, position, light2, u_color2, reflectionIntensity * u_light2.w);
  float fresnel = pow(1. - max(normal.z, 0.), u_shape.z);
  float rim = exp(-depth * depth / 2.8) * u_finish.w + fresnel * u_shape.w;
  color = mix(color, vec3(1., .953, .58), clamp(rim, 0., 1.));
  float coverage = 1. - smoothstep(-.5, .65, distance);
  float glow = exp(-max(distance, 0.) * max(distance, 0.) / 32.) * .23;
  glow += exp(-max(distance, 0.) * max(distance, 0.) / 5.) * .15;
  glow *= u_glow;
  float alpha = coverage + (1. - coverage) * glow;
  vec3 result = mix(vec3(1., .86, .28), clamp(color, 0., 1.), coverage / max(alpha, .001));
  gl_FragColor = vec4(result, alpha);
}`;

export function GoldenButtonShader() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const surface = host?.querySelector<HTMLElement>("[data-gold-surface]");
    if (!canvas || !host || !surface) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) { host.dataset.goldShader = "fallback"; return; }
    const program = gl.createProgram();
    if (!program) return;
    const shaders: WebGLShader[] = [];
    let buffer: WebGLBuffer | null = null;
    let frame = 0;
    let disposed = false;
    let visible = true;
    let width = 0;
    let height = 0;
    const pointer = [0, 0];
    const target = [0, 0];
    let press = 0;
    let targetPress = 0;
    let hover = 0;
    let targetHover = 0;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    try {
      for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Unable to create button shader");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Button shader compilation failed");
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Button shader linking failed");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const attribute = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3f(gl.getUniformLocation(program, "u_gold"), .89, .78, .275);
      gl.uniform4f(gl.getUniformLocation(program, "u_lighting"), .62, .27, .17, .7);
      gl.uniform4f(gl.getUniformLocation(program, "u_shape"), 10., 9., 1.6, .45);
      gl.uniform4f(gl.getUniformLocation(program, "u_finish"), 230., .07, .75, .52);
    } catch (error) {
      host.dataset.goldShader = "fallback";
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      console.warn("Golden button shader unavailable", error);
      return;
    }
    const sizeUniform = gl.getUniformLocation(program, "u_size");
    const pointerUniform = gl.getUniformLocation(program, "u_pointer");
    const pressUniform = gl.getUniformLocation(program, "u_press");
    const hoverUniform = gl.getUniformLocation(program, "u_hover");
    const uniforms = Object.fromEntries(["u_gold", "u_lighting", "u_shape", "u_finish", "u_light1", "u_light2", "u_color1", "u_color2", "u_response", "u_glow"].map(name => [name, gl.getUniformLocation(program, name)]));
    const draw = () => {
      frame = 0;
      if (disposed || !visible || document.hidden || gl.isContextLost()) return;
      const ease = reducedMotion.matches ? 1 : .18;
      pointer[0] += (target[0] - pointer[0]) * ease;
      pointer[1] += (target[1] - pointer[1]) * ease;
      press += (targetPress - press) * ease;
      hover += (targetHover - hover) * ease;
      const material = getGlassSettings().buttons;
      gl.uniform3f(uniforms.u_gold, ...colorToRgb(material.color));
      gl.uniform4f(uniforms.u_lighting, material.ambient, material.diffuse1, material.diffuse2, material.intensity);
      gl.uniform4f(uniforms.u_shape, material.bevel, material.depth, 1.6, material.fresnel);
      gl.uniform4f(uniforms.u_finish, material.sharpness, material.bloom, material.specular, material.rim);
      material.lights.forEach((light, i) => {
        gl.uniform4f(uniforms[`u_light${i + 1}`], light.x, light.y, light.z, light.intensity);
        gl.uniform3f(uniforms[`u_color${i + 1}`], ...colorToRgb(light.color));
      });
      gl.uniform1f(uniforms.u_response, material.pointerResponse);
      gl.uniform1f(uniforms.u_glow, material.glow);
      gl.uniform2f(sizeUniform, width, height);
      gl.uniform2f(pointerUniform, pointer[0], pointer[1]);
      gl.uniform1f(pressUniform, press);
      gl.uniform1f(hoverUniform, hover);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (Math.abs(target[0] - pointer[0]) + Math.abs(target[1] - pointer[1]) + Math.abs(targetPress - press) + Math.abs(targetHover - hover) > .001) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(draw); };
    initializeGlassSettings();
    const unsubscribe = subscribeGlassSettings(schedule);
    const resize = new ResizeObserver(() => {
      width = surface.clientWidth + 2;
      height = surface.clientHeight + 2;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round((width + 24) * ratio);
      canvas.height = Math.round((height + 20) * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      schedule();
    });
    const move = (event: PointerEvent) => {
      if (surface.matches(":disabled")) return;
      targetHover = 1;
      const bounds = surface.getBoundingClientRect();
      target[0] = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      target[1] = Math.max(-1, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height * 2));
      schedule();
    };
    const leave = () => { target[0] = target[1] = targetPress = targetHover = 0; schedule(); };
    const down = (event: PointerEvent) => { move(event); if (!surface.matches(":disabled")) targetPress = 1; schedule(); };
    const up = () => { targetPress = 0; schedule(); };
    const contextLost = (event: Event) => { event.preventDefault(); host.dataset.goldShader = "fallback"; };
    const visibility = () => { if (!document.hidden) schedule(); };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    surface.addEventListener("pointerenter", move, { passive: true });
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", leave);
    surface.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", leave);
    canvas.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    resize.observe(surface);
    intersection.observe(host);
    host.dataset.goldShader = "ready";
    return () => {
      disposed = true;
      unsubscribe();
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      surface.removeEventListener("pointerenter", move);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", leave);
      canvas.removeEventListener("webglcontextlost", contextLost);
      document.removeEventListener("visibilitychange", visibility);
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);
  return <canvas ref={ref} className={styles.goldCanvas} aria-hidden="true" data-golden-button-shader />;
}

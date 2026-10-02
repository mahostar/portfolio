"use client";

import { useEffect, useRef } from "react";
import styles from "./liquid-glass.module.css";
import { colorToRgb, getGlassSettings, initializeGlassSettings, subscribeGlassSettings } from "./glass-settings";

const vertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0., 1.);
}`;

const fragment = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_size;
uniform vec2 u_pointer;
uniform vec4 u_finish;
uniform vec4 u_surface;
uniform vec4 u_light1;
uniform vec4 u_light2;
uniform vec4 u_light3;
uniform vec4 u_light4;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;

float shape(vec2 p) {
  vec2 q = abs(p) - u_size * .5 + 22.;
  return min(max(q.x, q.y), 0.) + length(max(q, 0.)) - 22.;
}
float heightAt(vec2 p) {
  float d = clamp(-shape(p), 0., u_surface.y);
  return sqrt(max(d * (u_surface.y * 2. - d), 0.)) * u_surface.z;
}
vec3 reflection(vec3 normal, vec3 position, vec3 source, vec3 color, float power) {
  vec3 light = normalize(source - position);
  vec3 halfVector = normalize(light + vec3(0., 0., 1.));
  float angle = max(dot(normal, halfVector), 0.);
  float sharp = pow(angle, u_finish.y) * .65;
  float soft = pow(angle, 22.) * u_finish.z;
  return color * (sharp + soft) * power;
}
void main() {
  vec2 p = (v_uv - .5) * u_size;
  float d = shape(p);
  vec2 gradient = vec2(heightAt(p + vec2(.7, 0.)) - heightAt(p - vec2(.7, 0.)),
                       heightAt(p + vec2(0., .7)) - heightAt(p - vec2(0., .7))) / 1.4;
  vec3 normal = normalize(vec3(-gradient + p / u_size * .13 + u_pointer * .035 * u_surface.w, 1.));
  vec3 position = vec3(p / (u_size * .5), heightAt(p) * .015);
  vec3 movement = vec3(u_pointer * .45 * u_surface.w, 0.);
  vec3 light = reflection(normal, position, u_light1.xyz + movement, u_color1, u_light1.w);
  light += reflection(normal, position, u_light2.xyz - movement, u_color2, u_light2.w);
  light += reflection(normal, position, u_light3.xyz + movement, u_color3, u_light3.w);
  light += reflection(normal, position, u_light4.xyz - movement, u_color4, u_light4.w);
  light *= u_finish.x;
  float fresnel = pow(1. - normal.z, 2.);
  float rim = exp(-pow(max(-d, 0.) / 1.35, 2.));
  light += mix(vec3(.43, .69, 1.), vec3(.72, .9, 1.), v_uv.y) * (fresnel * u_surface.x + rim * u_finish.w);
  float strength = max(max(light.r, light.g), light.b);
  float coverage = 1. - smoothstep(-.8, .4, d);
  gl_FragColor = vec4(light / max(strength, .001), min(strength, .58) * coverage);
}`;

export function GlassPanelLighting() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) return;
    const program = gl.createProgram();
    if (!program) return;
    const shaders: WebGLShader[] = [];
    let buffer: WebGLBuffer | null = null;
    try {
      for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Could not create glass lighting shader");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Glass lighting compilation failed");
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Glass lighting linking failed");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const attribute = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    } catch (error) {
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      console.warn("Glass panel lighting unavailable", error);
      return;
    }
    const size = gl.getUniformLocation(program, "u_size");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const uniforms = Object.fromEntries(["u_finish", "u_surface", "u_light1", "u_light2", "u_light3", "u_light4", "u_color1", "u_color2", "u_color3", "u_color4"].map(name => [name, gl.getUniformLocation(program, name)]));
    const current = [0, 0];
    const target = [0, 0];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let disposed = false;
    const draw = () => {
      frame = 0;
      if (disposed || !visible || document.hidden || gl.isContextLost()) return;
      const ease = motion.matches ? 1 : .12;
      current[0] += (target[0] - current[0]) * ease;
      current[1] += (target[1] - current[1]) * ease;
      const material = getGlassSettings().panel;
      gl.uniform4f(uniforms.u_finish, material.intensity, material.sharpness, material.bloom, material.rim);
      gl.uniform4f(uniforms.u_surface, material.fresnel, material.bevel, material.depth, material.pointerResponse);
      material.lights.forEach((light, i) => {
        gl.uniform4f(uniforms[`u_light${i + 1}`], light.x, light.y, light.z, light.intensity);
        gl.uniform3f(uniforms[`u_color${i + 1}`], ...colorToRgb(light.color));
      });
      gl.uniform2f(pointer, current[0], current[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (Math.abs(target[0] - current[0]) + Math.abs(target[1] - current[1]) > .001) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(draw); };
    initializeGlassSettings();
    const unsubscribe = subscribeGlassSettings(schedule);
    const resize = new ResizeObserver(() => {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(host.clientWidth * ratio);
      canvas.height = Math.round(host.clientHeight * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, host.clientWidth, host.clientHeight);
      schedule();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    const move = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      target[0] = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      target[1] = 1 - (event.clientY - bounds.top) / bounds.height * 2;
      schedule();
    };
    const leave = () => { target[0] = target[1] = 0; schedule(); };
    const visibility = () => { if (!document.hidden) schedule(); };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    resize.observe(host);
    observer.observe(host);
    canvas.dataset.panelLighting = "ready";
    return () => {
      disposed = true;
      unsubscribe();
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);
  return <canvas ref={ref} className={styles.panelLighting} aria-hidden="true" />;
}

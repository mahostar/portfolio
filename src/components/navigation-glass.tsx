"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// The browser blurs the actual page behind the glass. This transparent GLSL
// layer shades its surface: curved edge normals, directional light, and glints.
// It never draws a copy of the page or distorts the navigation text.
const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_progress;
void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float topEdge = pow(smoothstep(0.65, 1.0, uv.y), 5.0);
  float bottomEdge = pow(1.0 - smoothstep(0.0, 0.35, uv.y), 5.0);
  float wave = sin(uv.x * 8.0 + u_progress * 2.0) * 0.08;
  vec3 normal = normalize(vec3(wave, (topEdge - bottomEdge) * 0.75, 1.0));
  vec3 light = normalize(vec3((u_pointer.x - 0.5) * 1.2, 0.6, 1.8));
  float specular = pow(max(dot(normal, light), 0.0), 22.0);
  vec2 delta = (uv - u_pointer) * vec2(min(aspect, 12.0), 1.0);
  float glint = exp(-dot(delta, delta) * 2.5);
  float ribbon = exp(-pow((uv.y - 0.8 + wave + uv.x * 0.12) * 12.0, 2.0));
  vec3 color = mix(vec3(0.38, 0.62, 0.9), vec3(0.85, 0.94, 1.0), specular);
  float alpha = topEdge * 0.16 + bottomEdge * 0.08
    + specular * 0.035 + ribbon * 0.025 + glint * 0.025;
  gl_FragColor = vec4(color, alpha);
}`;

export function NavigationGlass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    const progress = progressRef.current;
    const header = canvas?.closest("header");
    if (!canvas || !progress || !header) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    const shaders: WebGLShader[] = [];
    const program = gl?.createProgram();
    let ready = false;
    let buffer: WebGLBuffer | null = null;
    if (gl && program) {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, vertexSource],
        [gl.FRAGMENT_SHADER, fragmentSource],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) break;
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) break;
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      ready = !!gl.getProgramParameter(program, gl.LINK_STATUS);
      if (ready) {
        gl.useProgram(program);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const position = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      }
    }
    canvas.dataset.shader = ready ? "ready" : "fallback";
    const resolution =
      ready && gl && program ? gl.getUniformLocation(program, "u_resolution") : null;
    const pointer =
      ready && gl && program ? gl.getUniformLocation(program, "u_pointer") : null;
    const scroll =
      ready && gl && program ? gl.getUniformLocation(program, "u_progress") : null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pointerX = 0.65;
    let pointerY = 0.8;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const length = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = length > 0 ? Math.min(1, Math.max(0, window.scrollY / length)) : 0;
      header.dataset.scrollState = window.scrollY <= 2 ? "top" : "scrolled";
      progress.style.setProperty("--scroll-progress", String(fraction));
      progress.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
      if (!ready || !gl || gl.isContextLost()) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(header.clientWidth * ratio));
      const height = Math.max(1, Math.round(header.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
      gl.uniform2f(pointer, pointerX, pointerY);
      gl.uniform1f(scroll, reducedMotion.matches ? 0 : fraction);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (reducedMotion.matches || event.pointerType === "touch") return;
      const bounds = header.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width;
      pointerY = 1 - (event.clientY - bounds.top) / bounds.height;
      schedule();
    };
    const reset = () => {
      pointerX = 0.65;
      pointerY = 0.8;
      schedule();
    };
    const lost = () => {
      ready = false;
      canvas.dataset.shader = "fallback";
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(header);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    header.addEventListener("pointermove", move, { passive: true });
    header.addEventListener("pointerleave", reset);
    reducedMotion.addEventListener("change", reset);
    canvas.addEventListener("webglcontextlost", lost);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      header.removeEventListener("pointermove", move);
      header.removeEventListener("pointerleave", reset);
      reducedMotion.removeEventListener("change", reset);
      canvas.removeEventListener("webglcontextlost", lost);
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        shaders.forEach((shader) => gl.deleteShader(shader));
      }
    };
  }, [pathname]);

  return (
    <>
      <canvas ref={canvasRef} className="nav-glass-shader" aria-hidden="true" />
      <div
        ref={progressRef}
        className="nav-scroll-progress"
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <span />
      </div>
    </>
  );
}

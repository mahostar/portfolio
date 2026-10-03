"use client";

import { useEffect } from "react";
import styles from "./blue-navigation-glass.module.css";

const vertexSource = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

// Claude's supplied beveled-slab shader. H follows the existing header rather
// than resizing its contents: the golden button and brand remain unchanged.
const fragmentSource = `precision highp float;
uniform vec2 R;uniform float D;uniform float H;
float prof(float d,float b){float t=clamp(1.-d/b,0.,1.);return t/sqrt(max(1.-t*t,.04));}
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 s=R/D;
  vec2 p=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y)/D;
  float dt=p.y,db=H-p.y,dl=p.x,dr=s.x-p.x;
  vec2 g=vec2(-1.,0.)*prof(dl,9.)+vec2(1.,0.)*prof(dr,9.)
        +vec2(0.,-1.)*prof(dt,6.)+vec2(0.,1.)*prof(max(db,0.),6.);
  vec3 N=normalize(vec3(g*.55,1.));
  vec3 Rf=refract(vec3(0.,0.,-1.),N,.667);
  float tilt=1.-N.z;
  float u=p.x/s.x;
  vec3 col=mix(vec3(.31,.49,.82),vec3(.25,.36,.60),smoothstep(0.,.4,u));
  col=mix(col,vec3(.27,.40,.66),smoothstep(.45,1.,u));
  col+=vec3(.05,.07,.10)*exp(-dt/10.);
  col+=vec3(.05,.06,.07)*exp(-dl/30.);
  vec3 env=mix(vec3(.10,.26,.78),vec3(.55,.72,1.),clamp(.5+.5*dot(Rf.xy,normalize(vec2(-.6,-.8))),0.,1.));
  col=mix(col,env,clamp(tilt*1.3,0.,.55));
  float lt=exp(-pow(dt-1.2,2.)/.9);
  float lb=exp(-pow(db-1.2,2.)/.9);
  vec3 edge=vec3(.15,.41,.98);
  col=mix(col,edge,.95*lt);
  col=mix(col,edge,.95*lb);
  col=mix(col,vec3(.2,.45,.95),.35*exp(-max(db,0.)/4.));
  col+=(hs(gl_FragCoord.xy)-.5)*.012;
  float m=1.-smoothstep(H-.6,H+.6,p.y);
  float glow=(1.-m)*.55*exp(-max(p.y-H,0.)/2.5);
  float alpha=m*(.82+.15*(lt+lb))+glow;
  vec3 c=m>.5?col:vec3(.2,.45,.97);
  vec3 bg=vec3(.97,.975,.99);
  vec3 pre=clamp(c-(1.-alpha)*bg,0.,alpha);
  gl_FragColor=vec4(pre,alpha);
}`;

export function BlueNavigationBackdrop() {
  return <span className={styles.backdrop} aria-hidden="true" />;
}

export function BlueNavigationGlass() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;

    // The shared navigation owns one slab for its full lifetime across routes.
    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.blueGlass = "fallback";
    header.append(canvas);
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let frame = 0;
    let ready = false;

    const dispose = () => {
      if (!gl) return;
      shaders.splice(0).forEach((shader) => gl.deleteShader(shader));
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      buffer = null;
      program = null;
      ready = false;
    };
    const draw = () => {
      frame = 0;
      if (!gl || !program || !ready || document.hidden || gl.isContextLost()) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(gl.getUniformLocation(program, "R"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "D"), ratio);
      gl.uniform1f(gl.getUniformLocation(program, "H"), header.clientHeight);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const initialize = () => {
      if (!gl) return;
      try {
        program = gl.createProgram();
        if (!program) throw new Error("Unable to create glass program");
        for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
          const shader = gl.createShader(type);
          if (!shader) throw new Error("Unable to create glass shader");
          shaders.push(shader);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Glass compilation failed");
          gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Glass linking failed");
        gl.useProgram(program);
        buffer = gl.createBuffer();
        if (!buffer) throw new Error("Unable to create glass buffer");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const attribute = gl.getAttribLocation(program, "a");
        gl.enableVertexAttribArray(attribute);
        gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
        ready = true;
        draw();
        canvas.dataset.blueGlass = "ready";
      } catch {
        dispose();
        canvas.dataset.blueGlass = "fallback";
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      ready = false;
      canvas.dataset.blueGlass = "fallback";
    };
    const restored = () => {
      dispose();
      initialize();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(header);
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    initialize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      dispose();
      canvas.remove();
    };
  }, []);

  return <span className={styles.marker} hidden />;
}

"use client";

import { useEffect, useRef } from "react";

/* Névoa volumétrica em WebGL: ruído fractal que se deforma devagar,
   mais densa perto do chão, iluminada de vermelho por baixo e pela
   "lanterna" do visitante. Renderiza em meia resolução — a névoa é
   borrada por natureza, e assim roda leve até em celular. */

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_light;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 2.2;
  float t = u_time * 0.035;

  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3) - vec2(0.0, t * 0.6)));
  vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7 + t * 1.4, 9.2)), fbm(p + 2.0 * q + vec2(8.3, 2.8 - t)));
  float f = fbm(p + 2.2 * r);

  float ground = smoothstep(0.85, 0.0, uv.y);
  float density = f * (0.25 + 0.75 * ground);

  vec3 col = vec3(0.008, 0.007, 0.008);
  // brasa vermelha vinda de baixo
  col += vec3(0.95, 0.05, 0.04) * pow(density, 2.1) * (0.35 + 1.3 * ground);
  // fumaça cinza-fria
  col += vec3(0.2, 0.19, 0.21) * pow(f, 2.8) * 1.1;

  // lanterna
  vec2 lp = vec2(u_light.x * aspect, u_light.y);
  float d = distance(vec2(uv.x * aspect, uv.y), lp);
  float beam = smoothstep(0.5, 0.0, d);
  col += vec3(0.36, 0.32, 0.28) * beam * (0.25 + f * 0.9);

  // vinheta
  float v = smoothstep(1.25, 0.25, length((uv - vec2(0.5, 0.45)) * vec2(aspect * 0.8, 1.2)));
  col *= v;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
  className?: string;
  /* posição da luz em 0..1 (origem no canto superior esquerdo) */
  lightRef?: React.RefObject<{ x: number; y: number }>;
};

export function FogCanvas({ className, lightRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // sem WebGL: fica o fundo em CSS por trás

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uLight = gl.getUniformLocation(prog, "u_light");

    const SCALE = 0.5;
    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    const start = performance.now();
    const draw = () => {
      resize();
      const light = lightRef?.current ?? { x: 0.5, y: 0.45 };
      gl.uniform1f(uTime, reduced ? 20 : (performance.now() - start) / 1000 + 20);
      gl.uniform2f(uLight, light.x, 1 - light.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const loop = () => {
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    };
    if (reduced) draw();
    else loop();

    window.addEventListener("resize", draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [lightRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

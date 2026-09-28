import {
  grainGradientFragmentShader,
  GrainGradientShapes,
  staticMeshGradientFragmentShader,
  dotGridFragmentShader,
  DotGridShapes,
  pulsingBorderFragmentShader,
  PulsingBorderAspectRatios,
  getShaderColorFromString,
  getShaderNoiseTexture,
  ShaderFitOptions,
} from '@paper-design/shaders';
import type { GrainGradientShape, DotGridShape, PulsingBorderAspectRatio } from './shaderPresets';

// Vertex shader inlined from @paper-design/shaders v0.0.77 (dist/vertex-shader.js)
// Not in public exports, so we embed it directly. Stable across patch versions.
const vertexShaderSource = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) {
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) {
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  v_responsiveBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;

  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

// ---- Noise texture preloading ----

let noiseImg: HTMLImageElement | undefined;
let noiseReady = false;
let noiseListeners: (() => void)[] = [];

export function onNoiseReady(callback: () => void): void {
  if (noiseReady) {
    callback();
  } else {
    noiseListeners.push(callback);
  }
}

function initNoiseTexture(): void {
  if (typeof window === 'undefined') return;
  noiseImg = getShaderNoiseTexture();
  if (!noiseImg) return;
  if (noiseImg.complete && noiseImg.naturalWidth > 0) {
    noiseReady = true;
  } else {
    noiseImg.onload = () => {
      noiseReady = true;
      noiseListeners.forEach(cb => cb());
      noiseListeners = [];
    };
    noiseImg.onerror = () => {
      noiseReady = false;
    };
  }
}
initNoiseTexture();

/** Check if WebGL rendering is available */
export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    return gl !== null;
  } catch { return false; }
}

// ---- WebGL helpers ----

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Paper shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Paper shader link error:', gl.getProgramInfoLog(program));
    return null;
  }
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return program;
}

function setupFullScreenQuad(gl: WebGL2RenderingContext, program: WebGLProgram): void {
  const loc = gl.getAttribLocation(program, 'a_position');
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

function setFloat(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, val: number): void {
  const loc = gl.getUniformLocation(program, name);
  if (loc) gl.uniform1f(loc, val);
}

function setVec2(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, x: number, y: number): void {
  const loc = gl.getUniformLocation(program, name);
  if (loc) gl.uniform2f(loc, x, y);
}

function setVec4Array(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, vecs: number[][], maxCount: number): void {
  for (let i = 0; i < maxCount; i++) {
    const loc = gl.getUniformLocation(program, `${name}[${i}]`);
    if (!loc) continue;
    const v = i < vecs.length ? vecs[i] : [0, 0, 0, 0];
    gl.uniform4fv(loc, v);
  }
}

function uploadTexture(gl: WebGL2RenderingContext, program: WebGLProgram, name: string, img: HTMLImageElement, unit: number): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  const loc = gl.getUniformLocation(program, name);
  if (loc) gl.uniform1i(loc, unit);
}

/** Canonical width the shader patterns are designed for. u_pixelRatio scales pattern UVs so output is resolution-independent. */
const SHADER_REFERENCE_WIDTH = 800;

/** Set the standard sizing uniforms to fill the entire canvas */
function setSizingUniforms(gl: WebGL2RenderingContext, program: WebGLProgram, w: number, h: number): void {
  setVec2(gl, program, 'u_resolution', w, h);
  setFloat(gl, program, 'u_pixelRatio', w / SHADER_REFERENCE_WIDTH);
  setFloat(gl, program, 'u_time', 0.7);
  setFloat(gl, program, 'u_fit', ShaderFitOptions.none);
  setFloat(gl, program, 'u_scale', 1);
  setFloat(gl, program, 'u_rotation', 0);
  setFloat(gl, program, 'u_originX', 0.5);
  setFloat(gl, program, 'u_originY', 0.5);
  setFloat(gl, program, 'u_offsetX', 0);
  setFloat(gl, program, 'u_offsetY', 0);
  setFloat(gl, program, 'u_worldWidth', 0);
  setFloat(gl, program, 'u_worldHeight', 0);
  setFloat(gl, program, 'u_imageAspectRatio', w / h);
}

// ---- Public rendering functions ----

/** Render a grain gradient shader using real WebGL2. Returns null if WebGL is unavailable. */
export function renderGrainGradientWebGL(
  w: number, h: number, colors: string[], shape: GrainGradientShape, softness: number, intensity: number, noise: number
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!noiseReady || !noiseImg) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  if (!gl) return null;

  const program = linkProgram(gl, vertexShaderSource, grainGradientFragmentShader);
  if (!program) return null;

  gl.useProgram(program);
  setupFullScreenQuad(gl, program);
  setSizingUniforms(gl, program, w, h);

  // Shader-specific uniforms
  const colorVecs = colors.map(c => getShaderColorFromString(c) as number[]);
  setVec4Array(gl, program, 'u_colors', colorVecs, 7);
  setFloat(gl, program, 'u_colorsCount', colors.length);
  setFloat(gl, program, 'u_softness', softness);
  setFloat(gl, program, 'u_intensity', intensity);
  setFloat(gl, program, 'u_noise', noise);
  setFloat(gl, program, 'u_shape', GrainGradientShapes[shape] ?? GrainGradientShapes.wave);

  // Background color (opaque black)
  const loc = gl.getUniformLocation(program, 'u_colorBack');
  if (loc) gl.uniform4fv(loc, [0, 0, 0, 1]);

  // Noise texture
  uploadTexture(gl, program, 'u_noiseTexture', noiseImg, 0);

  // Render
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return canvas;
}

/** Render a static mesh gradient shader using real WebGL2. Returns null if WebGL is unavailable. */
export function renderStaticMeshWebGL(
  w: number, h: number, colors: string[],
  positions: number, waveX: number, waveXShift: number, waveY: number, waveYShift: number,
  mixing: number, grainMixer: number, grainOverlay: number,
  scale: number, rotation: number, offsetX: number, offsetY: number
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  if (!gl) return null;

  const program = linkProgram(gl, vertexShaderSource, staticMeshGradientFragmentShader);
  if (!program) return null;

  gl.useProgram(program);
  setupFullScreenQuad(gl, program);
  setSizingUniforms(gl, program, w, h);

  // Set the specific scaling/translation uniforms from parameters
  setFloat(gl, program, 'u_scale', scale);
  setFloat(gl, program, 'u_rotation', rotation);
  setFloat(gl, program, 'u_offsetX', offsetX);
  setFloat(gl, program, 'u_offsetY', offsetY);

  // Shader-specific uniforms
  const colorVecs = colors.map(c => getShaderColorFromString(c) as number[]);
  setVec4Array(gl, program, 'u_colors', colorVecs, 10);
  setFloat(gl, program, 'u_colorsCount', colors.length);
  setFloat(gl, program, 'u_positions', positions);
  setFloat(gl, program, 'u_waveX', waveX);
  setFloat(gl, program, 'u_waveXShift', waveXShift);
  setFloat(gl, program, 'u_waveY', waveY);
  setFloat(gl, program, 'u_waveYShift', waveYShift);
  setFloat(gl, program, 'u_mixing', mixing);
  setFloat(gl, program, 'u_grainMixer', grainMixer);
  setFloat(gl, program, 'u_grainOverlay', grainOverlay);

  // Render
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return canvas;
}

/** Render a dot grid pattern shader using real WebGL2. Returns null if WebGL is unavailable. */
export function renderDotGridWebGL(
  w: number, h: number, colors: string[],
  shape: DotGridShape, size: number, gapX: number, gapY: number, strokeWidth: number,
  sizeRange: number, opacityRange: number,
  scale: number, rotation: number, offsetX: number, offsetY: number
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  if (!gl) return null;

  const program = linkProgram(gl, vertexShaderSource, dotGridFragmentShader);
  if (!program) return null;

  gl.useProgram(program);
  setupFullScreenQuad(gl, program);
  setSizingUniforms(gl, program, w, h);

  // Set sizing uniforms from parameters
  setFloat(gl, program, 'u_scale', scale);
  setFloat(gl, program, 'u_rotation', rotation);
  setFloat(gl, program, 'u_offsetX', offsetX);
  setFloat(gl, program, 'u_offsetY', offsetY);

  // Set colors (background, fill, stroke)
  const backColor = getShaderColorFromString(colors[0] || '#000000') as number[];
  const fillColor = getShaderColorFromString(colors[1] || '#ffffff') as number[];
  const strokeColor = getShaderColorFromString(colors[2] || '#ffaa00') as number[];

  const locBack = gl.getUniformLocation(program, 'u_colorBack');
  if (locBack) gl.uniform4fv(locBack, backColor);
  const locFill = gl.getUniformLocation(program, 'u_colorFill');
  if (locFill) gl.uniform4fv(locFill, fillColor);
  const locStroke = gl.getUniformLocation(program, 'u_colorStroke');
  if (locStroke) gl.uniform4fv(locStroke, strokeColor);

  setFloat(gl, program, 'u_dotSize', size);
  setFloat(gl, program, 'u_gapX', gapX);
  setFloat(gl, program, 'u_gapY', gapY);
  setFloat(gl, program, 'u_strokeWidth', strokeWidth);
  setFloat(gl, program, 'u_sizeRange', sizeRange);
  setFloat(gl, program, 'u_opacityRange', opacityRange);
  setFloat(gl, program, 'u_shape', DotGridShapes[shape] ?? 0);

  // Render
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return canvas;
}

/** Render a pulsing border shader using real WebGL2. Returns null if WebGL is unavailable. */
export function renderPulsingBorderWebGL(
  w: number,
  h: number,
  colors: string[],
  colorBack: string,
  roundness: number,
  thickness: number,
  softness: number,
  aspectRatio: PulsingBorderAspectRatio,
  intensity: number,
  bloom: number,
  spots: number,
  spotSize: number,
  pulse: number,
  smoke: number,
  smokeSize: number,
  marginLeft: number,
  marginRight: number,
  marginTop: number,
  marginBottom: number,
  scale: number,
  rotation: number,
  offsetX: number,
  offsetY: number
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!noiseReady || !noiseImg) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  if (!gl) return null;

  const program = linkProgram(gl, vertexShaderSource, pulsingBorderFragmentShader);
  if (!program) return null;

  gl.useProgram(program);
  setupFullScreenQuad(gl, program);
  setSizingUniforms(gl, program, w, h);

  // Set sizing uniforms from parameters
  setFloat(gl, program, 'u_scale', scale);
  setFloat(gl, program, 'u_rotation', rotation);
  setFloat(gl, program, 'u_offsetX', offsetX);
  setFloat(gl, program, 'u_offsetY', offsetY);

  // Set colors (up to 5 colors)
  const colorVecs = colors.map(c => getShaderColorFromString(c) as number[]);
  setVec4Array(gl, program, 'u_colors', colorVecs, 5);
  setFloat(gl, program, 'u_colorsCount', colors.length);

  // Background color from user-configurable colorBack param
  const backVec = getShaderColorFromString(colorBack || '#000000') as number[];
  const locBack = gl.getUniformLocation(program, 'u_colorBack');
  if (locBack) gl.uniform4fv(locBack, backVec);

  // Shader-specific uniforms
  setFloat(gl, program, 'u_roundness', roundness);
  setFloat(gl, program, 'u_thickness', thickness);
  setFloat(gl, program, 'u_softness', softness);
  setFloat(gl, program, 'u_marginLeft', marginLeft);
  setFloat(gl, program, 'u_marginRight', marginRight);
  setFloat(gl, program, 'u_marginTop', marginTop);
  setFloat(gl, program, 'u_marginBottom', marginBottom);
  setFloat(gl, program, 'u_aspectRatio', PulsingBorderAspectRatios[aspectRatio] ?? 0);
  setFloat(gl, program, 'u_intensity', intensity);
  setFloat(gl, program, 'u_bloom', bloom);
  setFloat(gl, program, 'u_spots', spots);
  setFloat(gl, program, 'u_spotSize', spotSize);
  setFloat(gl, program, 'u_pulse', pulse);
  setFloat(gl, program, 'u_smoke', smoke);
  setFloat(gl, program, 'u_smokeSize', smokeSize);

  // u_time = 0 as requested for static shader (speed = 0)
  setFloat(gl, program, 'u_time', 0);

  // Noise texture (required for smoke/noisiness calculations)
  uploadTexture(gl, program, 'u_noiseTexture', noiseImg, 0);

  // Render
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return canvas;
}


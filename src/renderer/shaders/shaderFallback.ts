// Canvas 2D fallback porting the paper-design/shaders GLSL algorithms
// Reference: https://github.com/paper-design/shaders

// ---- GLSL math helpers (JS % differs from GLSL mod for negatives) ----

function glslMod(x: number, y: number): number {
  return x - y * Math.floor(x / y);
}

function glslFract(x: number): number {
  return x - Math.floor(x);
}

// ---- Hash / random (pure procedural, no texture needed) ----

function hash11(p: number): number {
  let v = glslFract(p * 0.3183099) + 0.1;
  v *= v + 19.19;
  return glslFract(v * v);
}

function hash21(px: number, py: number): number {
  let fx = glslFract(px * 0.3183099) + 0.1;
  let fy = glslFract(py * 0.3678794) + 0.1;
  const dot = fx * (fx + 19.19) + fy * (fy + 19.19);
  fx += dot;
  fy += dot;
  return glslFract(fx * fy);
}

// ---- Simplex noise 2D (Ashima Arts) ----

function permute3(x: number): number {
  return glslMod(((x * 34.0) + 1.0) * x, 289.0);
}

function snoise(vx: number, vy: number): number {
  const C0 = 0.211324865405187;
  const C1 = 0.366025403784439;
  const C2 = -0.577350269189626;
  const C3 = 0.024390243902439;

  const dotCyy = (vx + vy) * C1;
  const ix = Math.floor(vx + dotCyy);
  const iy = Math.floor(vy + dotCyy);
  const dotIxx = (ix + iy) * C0;
  const x0x = vx - ix + dotIxx;
  const x0y = vy - iy + dotIxx;

  const i1x = x0x > x0y ? 1.0 : 0.0;
  const i1y = x0x > x0y ? 0.0 : 1.0;

  const x12x_0 = x0x + C0;
  const x12y_0 = x0y + C0;
  const x12x_1 = x12x_0 - i1x;
  const x12y_1 = x12y_0 - i1y;
  const x12x_2 = x12x_0 + C2;
  const x12y_2 = x12y_0 + C2;

  const iix = glslMod(ix, 289.0);
  const iiy = glslMod(iy, 289.0);

  const p0 = permute3(permute3(iiy) + iix);
  const p1 = permute3(permute3(iiy + i1y) + iix + i1x);
  const p2 = permute3(permute3(iiy + 1.0) + iix + 1.0);

  const dot0 = x0x * x0x + x0y * x0y;
  const dot1 = x12x_1 * x12x_1 + x12y_1 * x12y_1;
  const dot2 = x12x_2 * x12x_2 + x12y_2 * x12y_2;

  let m0 = Math.max(0.5 - dot0, 0.0);
  let m1 = Math.max(0.5 - dot1, 0.0);
  let m2 = Math.max(0.5 - dot2, 0.0);
  m0 = m0 * m0 * m0 * m0;
  m1 = m1 * m1 * m1 * m1;
  m2 = m2 * m2 * m2 * m2;

  const x0 = glslFract(p0 * C3) * 2.0 - 1.0;
  const x1 = glslFract(p1 * C3) * 2.0 - 1.0;
  const x2 = glslFract(p2 * C3) * 2.0 - 1.0;

  const h0 = Math.abs(x0) - 0.5;
  const h1 = Math.abs(x1) - 0.5;
  const h2 = Math.abs(x2) - 0.5;
  const ox0 = Math.floor(x0 + 0.5);
  const ox1 = Math.floor(x1 + 0.5);
  const ox2 = Math.floor(x2 + 0.5);
  const a0_0 = x0 - ox0;
  const a0_1 = x1 - ox1;
  const a0_2 = x2 - ox2;

  m0 *= 1.79284291400159 - 0.85373472095314 * (a0_0 * a0_0 + h0 * h0);
  m1 *= 1.79284291400159 - 0.85373472095314 * (a0_1 * a0_1 + h1 * h1);
  m2 *= 1.79284291400159 - 0.85373472095314 * (a0_2 * a0_2 + h2 * h2);

  const g0 = a0_0 * x0x + h0 * x0y;
  const g1 = a0_1 * x12x_1 + h1 * x12y_1;
  const g2 = a0_2 * x12x_2 + h2 * x12y_2;

  return 130.0 * (m0 * g0 + m1 * g1 + m2 * g2);
}

// ---- Value noise (hash-based, replacing texture-based randomR) ----

function valueNoise(stx: number, sty: number): number {
  const ix = Math.floor(stx);
  const iy = Math.floor(sty);
  const fx = stx - ix;
  const fy = sty - iy;
  const a = hash21(ix, iy);
  const b = hash21(ix + 1, iy);
  const c = hash21(ix, iy + 1);
  const d = hash21(ix + 1, iy + 1);
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function rotate2(x: number, y: number, th: number): [number, number] {
  const c = Math.cos(th);
  const s = Math.sin(th);
  return [c * x - s * y, s * x + c * y];
}

// FBM matching the GLSL fbmR function (note: total.z double-write preserved from original)
function fbmNoise(
  n0x: number, n0y: number,
  n1x: number, n1y: number,
  n2x: number, n2y: number,
  n3x: number, n3y: number
): [number, number, number, number] {
  let amp = 0.2;
  let tx = 0, ty = 0, tz = 0, tw = 0;
  for (let i = 0; i < 3; i++) {
    [n0x, n0y] = rotate2(n0x, n0y, 0.3);
    [n1x, n1y] = rotate2(n1x, n1y, 0.3);
    [n2x, n2y] = rotate2(n2x, n2y, 0.3);
    [n3x, n3y] = rotate2(n3x, n3y, 0.3);
    tx += valueNoise(n0x, n0y) * amp;
    ty += valueNoise(n1x, n1y) * amp;
    tz += valueNoise(n2x, n2y) * amp;
    tz += valueNoise(n3x, n3y) * amp;
    n0x *= 1.99; n0y *= 1.99;
    n1x *= 1.99; n1y *= 1.99;
    n2x *= 1.99; n2y *= 1.99;
    n3x *= 1.99; n3y *= 1.99;
    amp *= 0.6;
  }
  return [tx, ty, tz, tw];
}

// ---- Truchet tile helper ----

function truchetTile(uvx: number, uvy: number, idx: number): [number, number] {
  const i = glslFract((idx - 0.5) * 2.0);
  if (i > 0.75) return [1.0 - uvx, 1.0 - uvy];
  if (i > 0.5) return [1.0 - uvx, uvy];
  if (i > 0.25) return [uvx, 1.0 - uvy];
  return [uvx, uvy];
}

// ---- Helpers shared with static mesh ----

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-10, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ---- Static mesh gradient (unchanged) ----

export function drawStaticMeshGradient2D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[],
  positions: number,
  waveX: number,
  waveXShift: number,
  waveY: number,
  waveYShift: number,
  mixing: number,
  grainMixer: number,
  grainOverlay: number,
  scale: number,
  rotation: number,
  offsetX: number,
  offsetY: number
): void {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  const colorRgb = colors.map(hexToRgb);
  const colorCount = colors.length;

  const positionSeed = 25.0 + 0.33 * positions;
  const spots: Array<{ x: number; y: number; idx: number }> = [];

  for (let i = 0; i < colorCount; i++) {
    const a = i * 0.37;
    const b = 0.6 + (i % 3) * 0.3;
    const c = 0.8 + ((i + 1) % 4) * 0.25;

    // Spot coordinates in range [0, 1]
    const sx = 0.5 + 0.5 * Math.sin(positionSeed * b + a);
    const sy = 0.5 + 0.5 * Math.cos(positionSeed * c + a * 1.5);

    spots.push({
      x: sx,
      y: sy,
      idx: i,
    });
  }

  const rad = (rotation * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);

  const mixPow = Math.pow(mixing, 0.7);
  const power = 2 * (1 - mixPow) + 1 * mixPow;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const u = px / w;
      const v = py / h;

      // 1. Center coordinate (range [-0.5, 0.5])
      let ux = u - 0.5;
      let uy = v - 0.5;

      // 2. Offset (graphicOffset = vec2(-offsetX, offsetY))
      ux -= offsetX;
      uy += offsetY;

      // 3. Scale
      ux /= scale;
      uy /= scale;

      // 4. Rotation
      let rx = cosR * ux - sinR * uy;
      let ry = sinR * ux + cosR * uy;

      // 5. Shift back to [0, 1]
      let uvx = rx + 0.5;
      let uvy = ry + 0.5;

      // 6. Mixer grain (grainMixer noise perturbation of spot positions)
      const grainVal = hash21(Math.round(uvx * 1000), Math.round(uvy * 1000));
      const mixerGrain = 0.4 * grainMixer * (grainVal - 0.5);

      // 7. Sine wave distortion (warping)
      const dx = uvx - 0.5;
      const dy = uvy - 0.5;
      const radDist = Math.sqrt(dx * dx + dy * dy);
      const radius = smoothstep(0, 1, radDist);
      const center = 1 - radius;

      // Two-pass wave distortion matching fragment shader
      for (let i = 1; i <= 2; i++) {
        const termX = (waveX * center) / i * Math.cos(2 * Math.PI * waveXShift + i * 2 * smoothstep(0, 1, uvy));
        const termY = (waveY * center) / i * Math.cos(2 * Math.PI * waveYShift + i * 2 * smoothstep(0, 1, uvx));
        uvx += termX;
        uvy += termY;
      }

      let r = 0, g = 0, b = 0;
      let totalWeight = 0;

      for (const spot of spots) {
        // Perturb the spot position with the mixer grain
        const spotX = spot.x + mixerGrain;
        const spotY = spot.y + mixerGrain;

        const sdx = uvx - spotX;
        const sdy = uvy - spotY;
        let dist = Math.sqrt(sdx * sdx + sdy * sdy);

        dist = Math.pow(dist, power);

        let weight = 1 / (dist + 1e-3);
        const baseSharpness = 8 * Math.max(0, Math.min(1, weight));
        const sharpness = baseSharpness * (1 - mixing) + 1 * mixing;
        weight = Math.pow(weight, sharpness);

        r += colorRgb[spot.idx][0] * weight;
        g += colorRgb[spot.idx][1] * weight;
        b += colorRgb[spot.idx][2] * weight;
        totalWeight += weight;
      }

      if (totalWeight > 0) {
        r /= totalWeight;
        g /= totalWeight;
        b /= totalWeight;
      }

      // 8. Grain Overlay (fast hash-based overlay)
      if (grainOverlay > 0) {
        const noiseVal = (hash21(px, py) - 0.5) * grainOverlay * 40;
        r += noiseVal;
        g += noiseVal;
        b += noiseVal;
      }

      const idx = (py * w + px) * 4;
      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ---- Grain gradient (ported from paper-design/shaders grainGradient.frag) ----

export function drawGrainGradient2D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[],
  shape: 'wave' | 'dots' | 'truchet' | 'corners' | 'ripple',
  softness: number,
  intensity: number,
  noiseAmount: number
): void {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  const colorRgb = colors.map(hexToRgb);
  const colorCount = colors.length;

  const shapeNum =
    shape === 'wave' ? 1 :
    shape === 'dots' ? 2 :
    shape === 'truchet' ? 3 :
    shape === 'corners' ? 4 : 5;

  const isObjectShape = shapeNum >= 4;
  const aspect = w / h;
  const t = 0.7; // Static time value corresponding to u_time = 0.0 with offset 7.0 (0.1 * 7.0 = 0.7)

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const uNorm = px / w;

      // Compute shape UV coordinates and grain coordinates matching GLSL vertex & fragment shaders
      let sx: number, sy: number;
      let gx: number, gy: number;

      if (isObjectShape) {
        // v_objectUV: centered UV with aspect ratio correction (y-axis inverted to match WebGL)
        sx = (uNorm - 0.5) * (aspect > 1 ? aspect : 1);
        sy = (0.5 - py / h) * (aspect < 1 ? 1 / aspect : 1);
        // grain_uv = v_objectUV * v_objectBoxSize * 0.7 = centered pixel coordinates * 0.7
        gx = (px - w * 0.5) * 0.7;
        gy = (h * 0.5 - py) * 0.7;
      } else {
        // shape_uv: pattern-space coordinates scaled to CSS/absolute pixels (1px = 0.005 units, y-axis inverted)
        sx = (px - w * 0.5) * 0.005;
        sy = (h * 0.5 - py) * 0.005;
        // grain_uv = 100 * v_patternUV * 1.6 = centered pixel coordinates * 1.6
        gx = (px - w * 0.5) * 1.6;
        gy = (h * 0.5 - py) * 1.6;
      }

      // ---- Compute shape value (from GLSL main()) ----
      let shapeVal = 0;

      if (shapeNum === 1) {
        // Wave: cos/sin interference pattern with time factor
        const wave = Math.cos(0.5 * sx - 4.0 * t) * Math.sin(1.5 * sx + 2.0 * t) * (0.75 + 0.25 * Math.cos(6.0 * t));
        shapeVal = 1.0 - smoothstep(-1.0, 1.0, sy + wave);

      } else if (shapeNum === 2) {
        // Dots: grid of modulated circles
        const TWO_PI = Math.PI * 2.0;
        const stripeIdx = Math.floor(2.0 * sx / TWO_PI);
        const rand = hash11(stripeIdx * 100.0);
        const signedRand = Math.sign(rand - 0.5) * Math.pow(4.0 * Math.abs(rand), 0.3);
        shapeVal = Math.sin(sx) * Math.cos(sy - 5.0 * signedRand * t);
        shapeVal = Math.pow(Math.abs(shapeVal), 4.0);

      } else if (shapeNum === 3) {
        // Truchet: tiled arc patterns
        let tsx = sx, tsy = sy;
        const n2v = valueNoise(tsx * 0.4 - 3.75 * t, tsy * 0.4 - 3.75 * t);
        tsx += 10.0;
        tsx *= 0.6;
        tsy *= 0.6;
        const tileX = tsx - Math.floor(tsx);
        const tileY = tsy - Math.floor(tsy);
        const [ttx, tty] = truchetTile(tileX, tileY, hash21(Math.floor(tsx), Math.floor(tsy)));
        const d1 = Math.sqrt(ttx * ttx + tty * tty);
        const d2x = ttx - 1.0, d2y = tty - 1.0;
        const d2 = Math.sqrt(d2x * d2x + d2y * d2y);
        let n2 = n2v - 0.5;
        n2 *= 0.1;
        shapeVal = smoothstep(0.2, 0.55, d1 + n2) * (1.0 - smoothstep(0.45, 0.8, d1 - n2));
        shapeVal += smoothstep(0.2, 0.55, d2 + n2) * (1.0 - smoothstep(0.45, 0.8, d2 - n2));
        shapeVal = Math.pow(shapeVal, 1.5);

      } else if (shapeNum === 4) {
        // Corners: smoothstep corner blend with time factor
        let csx = sx * 0.6, csy = sy * 0.6;
        let blx = smoothstep(0, 0.5, csx + 0.1 + 0.1 * Math.sin(3.0 * t));
        let bly = smoothstep(0, 0.5, csy + 0.2 - 0.1 * Math.sin(5.25 * t));
        let trx = smoothstep(0, 0.5, 1.0 - csx);
        let try_ = smoothstep(0, 0.5, 1.0 - csy);
        shapeVal = 1.0 - blx * bly * trx * try_;
        csx = -csx; csy = -csy;
        blx = smoothstep(0, 0.5, csx + 0.1 + 0.1 * Math.sin(3.0 * t));
        bly = smoothstep(0, 0.5, csy + 0.2 - 0.1 * Math.cos(5.25 * t));
        trx = smoothstep(0, 0.5, 1.0 - csx);
        try_ = smoothstep(0, 0.5, 1.0 - csy);
        shapeVal -= blx * bly * trx * try_;
        shapeVal = 1.0 - smoothstep(0, 1, shapeVal);

      } else {
        // Ripple: concentric sine waves with time factor
        const rx = sx * 2.0, ry = sy * 2.0;
        const dist = Math.sqrt(0.4 * rx * 0.4 * rx + 0.4 * ry * 0.4 * ry);
        shapeVal = Math.sin(Math.pow(dist, 1.2) * 5.0 - 3.0 * t) * 0.5 + 0.5;
      }

      // ---- Grain / noise distortion ----
      const baseNoise = snoise(gx * 0.5, gy * 0.5);

      const [n0x, n0y] = rotate2(0.4 * gx, 0.4 * gy, 2.0);
      const [tx, ty, tz, tw] = fbmNoise(
        0.002 * gx + 10, 0.002 * gy + 10,
        0.003 * gx, 0.003 * gy,
        0.001 * gx, 0.001 * gy,
        n0x, n0y
      );

      const grainDist = baseNoise * snoise(gx * 0.2, gy * 0.2) - tx - ty;
      const rawNoise = 0.75 * baseNoise - tw - tz;
      const noiseVal = Math.max(0, Math.min(1, rawNoise));

      shapeVal += intensity * 2.0 / colorCount * (grainDist + 0.5);
      shapeVal += noiseAmount * 10.0 / colorCount * noiseVal;

      // ---- Color mixing (GLSL gradient loop) ----
      const aa = 0.01;
      const clampedShape = Math.max(0, Math.min(1, shapeVal - 0.5 / colorCount));
      const totalShape = smoothstep(0, softness + 2 * aa, Math.max(0, Math.min(1, clampedShape * colorCount)));
      const mixer = clampedShape * (colorCount - 1);

      let r = colorRgb[0][0];
      let g = colorRgb[0][1];
      let b = colorRgb[0][2];

      for (let ci = 1; ci < colorCount; ci++) {
        let localT = Math.max(0, Math.min(1, mixer - (ci - 1)));
        localT = smoothstep(0.5 - 0.5 * softness - aa, 0.5 + 0.5 * softness + aa, localT);
        r = r + (colorRgb[ci][0] - r) * localT;
        g = g + (colorRgb[ci][1] - g) * localT;
        b = b + (colorRgb[ci][2] - b) * localT;
      }

      r *= totalShape;
      g *= totalShape;
      b *= totalShape;

      const idx = (py * w + px) * 4;
      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      data[idx + 3] = 255; // Blend with default opaque black background u_colorBack (alpha=1.0)
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export const MAX_BURNS = 200;

const DRAG_SPACING = 0.012;
const INITIAL_RADIUS = -0.08;
const RADIUS_PER_FRAME = 0.0008;
const REVEAL_PADDING = 0.18;
const SELECTION_UNLOCK_PROGRESS = 0.8;
const MAX_RENDER_PIXELS = 4_000_000;
const MAX_RENDER_SCALE = 2;
const INTERACTIVE_SELECTOR = "a, button, [data-hero-content]";
const UI_CONTENT_SELECTOR = ":scope > .site-header, :scope > .hero-copy";

export function computeRenderScale(width, height, pixelRatio = 1) {
  const safePixels = Math.max(1, width * height);
  const desiredScale = Math.min(
    Math.max(1, Number.isFinite(pixelRatio) ? pixelRatio : 1),
    MAX_RENDER_SCALE,
  );
  const budgetScale = Math.sqrt(MAX_RENDER_PIXELS / safePixels);
  return Math.max(1, Math.min(desiredScale, budgetScale));
}

export const BURN_VERTEX_SHADER = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export function fragmentShaderSource(maxBurns = MAX_BURNS) {
  return `
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_imageSize;
    uniform float u_sceneX;
    uniform float u_time;
    uniform vec3 u_burns[${maxBurns}];
    uniform int u_burnCount;
    uniform sampler2D u_wireframe;
    uniform sampler2D u_wireUi;
    uniform sampler2D u_mysticUi;

    float random(in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float noise(in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x)
        + (c - a) * u.y * (1.0 - u.x)
        + (d - b) * u.x * u.y;
    }

    float fbm(in vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rotation = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int octave = 0; octave < 5; octave++) {
        value += amplitude * noise(st);
        st = rotation * st * 2.0 + shift;
        amplitude *= 0.5;
      }
      return value;
    }

    vec2 coverUv(vec2 uv) {
      float coverScale = max(
        u_resolution.x / u_imageSize.x,
        u_resolution.y / u_imageSize.y
      );
      vec2 renderedSize = u_imageSize * coverScale;
      vec2 overflow = max(renderedSize - u_resolution, vec2(0.0));
      vec2 containerPixel = vec2(uv.x, 1.0 - uv.y) * u_resolution;
      vec2 sourcePixel = (
        containerPixel + vec2(overflow.x * u_sceneX, overflow.y * 0.5)
      ) / coverScale;
      return sourcePixel / u_imageSize;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec4 wireSample = texture2D(u_wireframe, coverUv(uv));
      vec2 uiUv = vec2(uv.x, 1.0 - uv.y);
      vec4 wireUiSample = texture2D(u_wireUi, uiUv);
      vec4 mysticUiSample = texture2D(u_mysticUi, uiUv);

      if (u_burnCount == 0) {
        vec3 readyColor = wireUiSample.rgb * wireUiSample.a
          + wireSample.rgb * (1.0 - wireUiSample.a);
        gl_FragColor = vec4(readyColor, 1.0);
        return;
      }

      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 position = uv * aspect;
      float minDistance = 999.0;

      for (int index = 0; index < ${maxBurns}; index++) {
        if (index >= u_burnCount) break;
        vec2 center = u_burns[index].xy * aspect;
        minDistance = min(
          minDistance,
          length(position - center) - u_burns[index].z
        );
      }

      float shapeNoise = fbm(position * 3.5 + u_time * 0.02) * 0.15;
      float baseBoundary = minDistance - shapeNoise;
      float fireFlicker = fbm(position * 25.0 - u_time * 5.0) * 0.02;
      float edgeBoundary = baseBoundary + fireFlicker;

      float scorchAmount = 1.0 - smoothstep(0.0, 0.015, edgeBoundary);
      vec3 scorchColor = vec3(0.08, 0.04, 0.02);
      vec3 baseColor = mix(wireSample.rgb, scorchColor, scorchAmount);
      float baseAlpha = smoothstep(-0.005, 0.0, edgeBoundary);

      float smokeBase = smoothstep(-0.4, -0.01, baseBoundary);
      float smokeNoise = fbm(position * 4.0 - u_time * 0.4);
      float smokeAlpha = clamp(
        smokeBase * smoothstep(0.2, 0.7, smokeNoise) * 1.5,
        0.0,
        1.0
      );
      float glowFactor = smoothstep(-0.04, 0.0, edgeBoundary);
      vec3 smokeBaseColor = vec3(
        159.0 / 255.0,
        162.0 / 255.0,
        166.0 / 255.0
      );
      vec3 smokeColor = mix(
        smokeBaseColor,
        vec3(1.0, 0.6, 0.1),
        glowFactor
      ) * smokeAlpha;

      float fireIntensity = 1.0 - smoothstep(
        0.0,
        0.01,
        abs(edgeBoundary + 0.005)
      );
      vec3 fireColor = vec3(1.0, 0.7, 0.0) * fireIntensity;

      vec3 composite = baseColor * baseAlpha;
      composite += smokeColor * (1.0 - baseAlpha);
      float compositeAlpha = baseAlpha + smokeAlpha * (1.0 - baseAlpha);
      composite += fireColor;
      compositeAlpha = clamp(compositeAlpha + fireIntensity, 0.0, 1.0);

      // Browser-rendered WF and M UI change locally at the same boundary.
      float textFade = smoothstep(-0.01, 0.01, edgeBoundary);
      vec4 localUi = mix(mysticUiSample, wireUiSample, textFade);
      composite = localUi.rgb * localUi.a + composite * (1.0 - localUi.a);
      compositeAlpha = localUi.a + compositeAlpha * (1.0 - localUi.a);

      gl_FragColor = vec4(composite, compositeAlpha);
    }
  `;
}

export const BURN_FRAGMENT_SHADER = fragmentShaderSource();

function snapshotClassName(root, state) {
  const classes = String(root.className || "")
    .split(/\s+/)
    .filter((name) => name && name !== "is-enhanced");
  classes.push("burn-ui-snapshot");
  if (state === "mystic") classes.push("is-enhanced");
  return classes.join(" ");
}

function snapshotContent(root, embeddedImages = new Map()) {
  return [...root.querySelectorAll(UI_CONTENT_SELECTOR)].map((element) => {
    if (typeof element.cloneNode !== "function") return element.outerHTML;
    const clone = element.cloneNode(true);
    const originals = element.querySelectorAll("img");
    clone.querySelectorAll("img").forEach((image, index) => {
      const source = originals[index]?.currentSrc || originals[index]?.src;
      const embedded = embeddedImages.get(source);
      if (embedded) image.src = embedded;
      image.removeAttribute("srcset");
      image.removeAttribute("loading");
      image.removeAttribute("decoding");
    });
    return new XMLSerializer().serializeToString(clone);
  }).join("");
}

export function createUiSnapshotSvg(
  root,
  width,
  height,
  state,
  cssText,
  embeddedImages = new Map(),
) {
  const className = snapshotClassName(root, state);
  const burnState = state === "mystic" ? ' data-burn-state="revealed"' : "";
  const content = snapshotContent(root, embeddedImages);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <foreignObject width="100%" height="100%">
      <body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;width:${width}px;height:${height}px;overflow:hidden;background:transparent">
        <style><![CDATA[${cssText}
          .burn-ui-snapshot { background: transparent !important; border: 0 !important; }
          .burn-ui-snapshot > .hero-copy::before { content: none !important; }
        ]]></style>
        <section class="${className}"${burnState} style="width:${width}px;height:${height}px;min-height:${height}px;overflow:hidden">${content}</section>
      </body>
    </foreignObject>
  </svg>`;
}

function stylesheetText() {
  const rules = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) rules.push(rule.cssText);
    } catch {
      // Salvor's own stylesheet is same-origin; ignore unrelated cross-origin CSS.
    }
  }
  return rules.join("\n");
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), { once: true });
    reader.addEventListener("error", () => reject(reader.error), { once: true });
    reader.readAsDataURL(blob);
  });
}

async function renderSvgToCanvas(svg, width, height, renderScale) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * renderScale));
  canvas.height = Math.max(1, Math.round(height * renderScale));
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  const context = canvas.getContext("2d", { alpha: true });
  context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

export function sampleDragPoints(from, to, spacing = DRAG_SPACING, capacity = MAX_BURNS) {
  if (capacity <= 0) return [];
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  if (distance < spacing) return [];
  const count = Math.min(capacity, Math.max(1, Math.ceil(distance / spacing)));
  return Array.from({ length: count }, (_, index) => {
    const progress = (index + 1) / count;
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  });
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown WebGL shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl, maxBurns) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, BURN_VERTEX_SHADER);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource(maxBurns),
  );
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown WebGL program error";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function scenePosition(root) {
  const raw = getComputedStyle(root).getPropertyValue("--scene-x").trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0.5;
  return raw.endsWith("%") ? value / 100 : value;
}

export class BurnReveal {
  constructor(root) {
    this.root = root;
    this.pointerDown = false;
    this.pointerId = null;
    this.lastPointer = null;
    this.frame = 0;
    this.lastFrameAt = 0;
    this.burnCount = 0;
    this.startTime = 0;
    this.bound = {
      resize: () => this.resize(),
      pointerDown: (event) => this.onPointerDown(event),
      pointerMove: (event) => this.onPointerMove(event),
      pointerUp: (event) => this.onPointerUp(event),
      visibility: () => this.onVisibilityChange(),
      contextLost: (event) => this.onContextLost(event),
    };
  }

  async init() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.root.dataset.burnState = "reduced";
      return this;
    }

    this.wireImage = this.root.querySelector("[data-wireframe-layer]");
    const mysticPicture = this.root.querySelector("[data-mystic-layer]");
    const mysticImage = mysticPicture?.querySelector("img");
    if (!this.wireImage || !mysticPicture || !mysticImage) {
      throw new Error("Burn hero assets are incomplete");
    }

    const heroImages = [...this.root.querySelectorAll("[data-hero-content] img")];
    await Promise.all([
      this.wireImage.decode().catch(() => {}),
      mysticImage.decode().catch(() => {}),
      ...heroImages.map((image) => image.decode().catch(() => {})),
      document.fonts?.ready ?? Promise.resolve(),
    ]);
    if (!this.wireImage.naturalWidth || !mysticImage.naturalWidth) {
      throw new Error("Burn hero assets failed to decode");
    }

    this.uiCssText = stylesheetText();
    this.embeddedImages = new Map();
    await Promise.all(heroImages.map(async (image) => {
      const source = image.currentSrc || image.src;
      if (!source || this.embeddedImages.has(source)) return;
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Hero UI asset failed to load: ${source}`);
      this.embeddedImages.set(source, await blobToDataUrl(await response.blob()));
    }));

    this.canvas = document.createElement("canvas");
    this.canvas.className = "burn-webgl";
    this.canvas.setAttribute("aria-hidden", "true");
    this.gl = this.canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!this.gl) {
      this.root.dataset.burnState = "fallback";
      return this;
    }

    const uniformVectors = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    this.capacity = Math.min(MAX_BURNS, Math.max(8, uniformVectors - 12));
    this.burnData = new Float32Array(this.capacity * 3);
    this.setupGl();
    await this.resize();

    this.root.append(this.canvas);
    this.root.classList.add("is-enhanced");
    this.root.dataset.burnRenderer = "webgl";
    this.root.dataset.burnUiRenderer = "foreign-object";
    this.startTime = performance.now();
    this.draw(this.startTime);

    window.addEventListener("resize", this.bound.resize, { passive: true });
    this.root.addEventListener("pointerdown", this.bound.pointerDown);
    this.root.addEventListener("pointermove", this.bound.pointerMove);
    this.root.addEventListener("pointerup", this.bound.pointerUp);
    this.root.addEventListener("pointercancel", this.bound.pointerUp);
    document.addEventListener("visibilitychange", this.bound.visibility);
    this.canvas.addEventListener("webglcontextlost", this.bound.contextLost);
    this.root.dataset.burnState = "ready";
    return this;
  }

  setupGl() {
    const gl = this.gl;
    this.program = createProgram(gl, this.capacity);
    gl.useProgram(this.program);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1,
      -1, 1, -1, 1,
      1, -1, 1, 1,
    ]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, "u_resolution"),
      imageSize: gl.getUniformLocation(this.program, "u_imageSize"),
      sceneX: gl.getUniformLocation(this.program, "u_sceneX"),
      time: gl.getUniformLocation(this.program, "u_time"),
      burns: gl.getUniformLocation(this.program, "u_burns"),
      burnCount: gl.getUniformLocation(this.program, "u_burnCount"),
      wireframe: gl.getUniformLocation(this.program, "u_wireframe"),
      wireUi: gl.getUniformLocation(this.program, "u_wireUi"),
      mysticUi: gl.getUniformLocation(this.program, "u_mysticUi"),
    };

    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.wireImage,
    );
    gl.uniform1i(this.uniforms.wireframe, 0);

    this.wireUiTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.wireUiTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.uniform1i(this.uniforms.wireUi, 1);

    this.mysticUiTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.mysticUiTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.uniform1i(this.uniforms.mysticUi, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.clearColor(0, 0, 0, 0);
  }

  uploadUiTextures(wireCanvas, mysticCanvas) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.wireUiTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wireCanvas);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.mysticUiTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mysticCanvas);
    gl.activeTexture(gl.TEXTURE0);
  }

  async resize() {
    if (!this.gl || this.contextLost) return;
    const rect = this.root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const renderScale = computeRenderScale(width, height, devicePixelRatio);
    const version = (this.resizeVersion || 0) + 1;
    this.resizeVersion = version;
    const wireSvg = createUiSnapshotSvg(
      this.root, width, height, "wire", this.uiCssText, this.embeddedImages,
    );
    const mysticSvg = createUiSnapshotSvg(
      this.root, width, height, "mystic", this.uiCssText, this.embeddedImages,
    );
    const [wireCanvas, mysticCanvas] = await Promise.all([
      renderSvgToCanvas(wireSvg, width, height, renderScale),
      renderSvgToCanvas(mysticSvg, width, height, renderScale),
    ]);
    if (version !== this.resizeVersion || this.contextLost) return;
    this.width = width;
    this.height = height;
    this.renderScale = renderScale;
    this.canvas.width = wireCanvas.width;
    this.canvas.height = wireCanvas.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.uploadUiTextures(wireCanvas, mysticCanvas);
    this.draw(performance.now());
  }

  pointerToNormalized(clientX, clientY) {
    const rect = this.root.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)),
    };
  }

  addBurn(point) {
    if (this.burnCount === this.capacity) {
      if (!this.mergeClosestBurns()) return false;
    }
    const offset = this.burnCount * 3;
    this.burnData[offset] = point.x;
    this.burnData[offset + 1] = point.y;
    this.burnData[offset + 2] = INITIAL_RADIUS;
    this.burnCount += 1;
    this.root.dataset.burnCount = String(this.burnCount);
    return true;
  }

  mergeClosestBurns() {
    if (this.burnCount < 2) return false;
    const aspect = this.width / this.height || 1;
    let first = 0;
    let second = 1;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let left = 0; left < this.burnCount - 1; left += 1) {
      const leftOffset = left * 3;
      for (let right = left + 1; right < this.burnCount; right += 1) {
        const rightOffset = right * 3;
        const distance = Math.hypot(
          (this.burnData[rightOffset] - this.burnData[leftOffset]) * aspect,
          this.burnData[rightOffset + 1] - this.burnData[leftOffset + 1],
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          first = left;
          second = right;
        }
      }
    }

    const firstOffset = first * 3;
    const secondOffset = second * 3;
    const firstRadius = this.burnData[firstOffset + 2];
    const secondRadius = this.burnData[secondOffset + 2];
    let centerX = this.burnData[firstOffset];
    let centerY = this.burnData[firstOffset + 1];
    let radius = firstRadius;

    if (secondRadius >= closestDistance + firstRadius) {
      centerX = this.burnData[secondOffset];
      centerY = this.burnData[secondOffset + 1];
      radius = secondRadius;
    } else if (firstRadius < closestDistance + secondRadius) {
      radius = (closestDistance + firstRadius + secondRadius) * 0.5;
      const progress = closestDistance
        ? (radius - firstRadius) / closestDistance
        : 0;
      centerX += (this.burnData[secondOffset] - centerX) * progress;
      centerY += (this.burnData[secondOffset + 1] - centerY) * progress;
    }

    this.burnData[firstOffset] = centerX;
    this.burnData[firstOffset + 1] = centerY;
    this.burnData[firstOffset + 2] = radius;
    this.burnData.copyWithin(
      secondOffset,
      secondOffset + 3,
      this.burnCount * 3,
    );
    this.burnCount -= 1;
    return true;
  }

  onPointerDown(event) {
    if (
      event.button !== 0
      || event.target.closest?.(INTERACTIVE_SELECTOR)
      || this.root.dataset.burnState === "revealed"
    ) {
      return;
    }
    this.pointerDown = true;
    this.pointerId = event.pointerId;
    this.lastPointer = this.pointerToNormalized(event.clientX, event.clientY);
    this.addBurn(this.lastPointer);
    this.root.setPointerCapture?.(event.pointerId);
    this.start();
  }

  onPointerMove(event) {
    if (!this.pointerDown || event.pointerId !== this.pointerId || !this.lastPointer) return;
    const point = this.pointerToNormalized(event.clientX, event.clientY);
    const samples = sampleDragPoints(
      this.lastPointer,
      point,
      DRAG_SPACING,
      this.capacity,
    );
    if (!samples.length) return;
    for (const sample of samples) this.addBurn(sample);
    this.lastPointer = point;
  }

  onPointerUp(event) {
    if (event.pointerId !== this.pointerId) return;
    this.pointerDown = false;
    this.pointerId = null;
    this.lastPointer = null;
    if (this.root.hasPointerCapture?.(event.pointerId)) {
      this.root.releasePointerCapture(event.pointerId);
    }
  }

  start() {
    this.root.dataset.burnState = "burning";
    if (!this.frame && !document.hidden) {
      this.frame = requestAnimationFrame((time) => this.step(time));
    }
  }

  onVisibilityChange() {
    if (document.hidden && this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      return;
    }
    if (
      !document.hidden
      && this.root.dataset.burnState === "burning"
      && !this.frame
    ) {
      this.frame = requestAnimationFrame((time) => this.step(time));
    }
  }

  onContextLost(event) {
    event.preventDefault();
    this.contextLost = true;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.root.classList.remove("is-enhanced");
    delete this.root.dataset.burnRenderer;
    this.root.dataset.burnState = "fallback";
  }

  step(time) {
    this.frame = 0;
    const elapsedFrames = this.lastFrameAt
      ? Math.max(0.25, Math.min(4, (time - this.lastFrameAt) / 16.667))
      : 1;
    this.lastFrameAt = time;
    for (let index = 0; index < this.burnCount; index += 1) {
      this.burnData[index * 3 + 2] += RADIUS_PER_FRAME * elapsedFrames;
    }
    this.draw(time);

    if (
      this.root.dataset.burnSelectable !== "true"
      && this.revealProgressReached(SELECTION_UNLOCK_PROGRESS)
    ) {
      this.root.dataset.burnSelectable = "true";
    }
    if (this.coversViewport()) {
      this.canvas.hidden = true;
      this.root.dataset.burnState = "revealed";
      return;
    }
    this.frame = requestAnimationFrame((nextTime) => this.step(nextTime));
  }

  revealProgressReached(progress) {
    const aspect = this.width / this.height;
    for (let index = 0; index < this.burnCount; index += 1) {
      const offset = index * 3;
      const centerX = this.burnData[offset] * aspect;
      const centerY = this.burnData[offset + 1];
      const radius = this.burnData[offset + 2];
      const farthestCorner = Math.max(
        Math.hypot(centerX, centerY),
        Math.hypot(aspect - centerX, centerY),
        Math.hypot(centerX, 1 - centerY),
        Math.hypot(aspect - centerX, 1 - centerY),
      );
      if (radius >= (farthestCorner + REVEAL_PADDING) * progress) return true;
    }
    return false;
  }

  coversViewport() {
    return this.revealProgressReached(1);
  }

  draw(time) {
    if (!this.gl || this.contextLost || !this.canvas.width || !this.canvas.height) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(
      this.uniforms.imageSize,
      this.wireImage.naturalWidth,
      this.wireImage.naturalHeight,
    );
    gl.uniform1f(this.uniforms.sceneX, scenePosition(this.root));
    gl.uniform1f(this.uniforms.time, (time - this.startTime) * 0.001);
    gl.uniform1i(this.uniforms.burnCount, this.burnCount);
    gl.uniform3fv(this.uniforms.burns, this.burnData);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.bound.resize);
    this.root.removeEventListener("pointerdown", this.bound.pointerDown);
    this.root.removeEventListener("pointermove", this.bound.pointerMove);
    this.root.removeEventListener("pointerup", this.bound.pointerUp);
    this.root.removeEventListener("pointercancel", this.bound.pointerUp);
    document.removeEventListener("visibilitychange", this.bound.visibility);
    this.canvas?.removeEventListener("webglcontextlost", this.bound.contextLost);
    if (this.gl && !this.contextLost) {
      this.gl.deleteTexture(this.texture);
      this.gl.deleteTexture(this.wireUiTexture);
      this.gl.deleteTexture(this.mysticUiTexture);
      this.gl.deleteBuffer(this.positionBuffer);
      this.gl.deleteProgram(this.program);
    }
    this.canvas?.remove();
    this.root.classList.remove("is-enhanced");
    delete this.root.dataset.burnRenderer;
    delete this.root.dataset.burnUiRenderer;
  }
}

if (typeof document !== "undefined") {
  const root = document.querySelector("[data-burn-hero]");
  if (root) {
    const burn = new BurnReveal(root);
    burn.init().catch((error) => {
      burn.destroy();
      root.dataset.burnState = "fallback";
      console.error("Salvor burn reveal failed to initialize", error);
    });
  }
}

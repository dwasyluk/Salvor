export const BURN_CONFIG = Object.freeze({
  gridWidth: 290,
  gridHeight: 160,
  ignition: 1.35,
  clickRadius: 6,
  dragRadius: 4,
  spread: 0.24,
  persistence: 0.994,
  crawl: 0.0021,
  fringe: 0.85,
  sparks: 0.48,
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function hash(x, y, time = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + time * 0.0097) * 43758.5453123;
  return value - Math.floor(value);
}

function fbm(x, y, time) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let octave = 0; octave < 4; octave += 1) {
    value += amplitude * hash(Math.floor(x * frequency), Math.floor(y * frequency), time + octave * 71);
    frequency *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

export function createBurnField(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 3 || height < 3) {
    throw new RangeError("Burn fields require integer dimensions of at least 3 × 3");
  }
  return {
    width,
    height,
    burn: new Float32Array(width * height),
    heat: new Float32Array(width * height),
  };
}

const fieldIndex = (field, x, y) => y * field.width + x;

export function ignite(field, centerX, centerY, radius, strength, time = 0) {
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(field.width - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(field.height - 1, Math.ceil(centerY + radius));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x - centerX, y - centerY);
      const noise = fbm(x * 0.36, y * 0.36, time);
      const boundary = radius * (0.58 + noise * 0.58);
      if (distance > boundary) continue;
      const index = fieldIndex(field, x, y);
      const falloff = 1 - distance / (boundary + 0.01);
      field.heat[index] = Math.max(field.heat[index], strength * (0.46 + falloff * 0.9));
      field.burn[index] = Math.max(field.burn[index], 0.05 + falloff * 0.2);
    }
  }
  return field;
}

export function advance(field, time, config = BURN_CONFIG) {
  const nextHeat = new Float32Array(field.heat);
  let total = 0;
  let hot = 0;

  for (let y = 1; y < field.height - 1; y += 1) {
    for (let x = 1; x < field.width - 1; x += 1) {
      const index = fieldIndex(field, x, y);
      const noise = fbm(x * 0.095, y * 0.095, time);
      const maxNeighbor = Math.max(
        field.burn[fieldIndex(field, x + 1, y)],
        field.burn[fieldIndex(field, x - 1, y)],
        field.burn[fieldIndex(field, x, y + 1)],
        field.burn[fieldIndex(field, x, y - 1)],
        field.burn[fieldIndex(field, x + 1, y + 1)],
        field.burn[fieldIndex(field, x - 1, y - 1)],
      );

      if (field.heat[index] <= 0.004 && field.burn[index] < 0.02 && maxNeighbor > 0.14) {
        const catchProbability = config.spread * (0.32 + maxNeighbor * 0.75 + noise * 0.65);
        if (hash(x * 7, y * 13, time) < catchProbability) {
          nextHeat[index] = Math.max(nextHeat[index], 0.055 + maxNeighbor * 0.11 + noise * 0.055);
        }
      }

      const heat = nextHeat[index];
      if (heat > 0.003 || field.burn[index] > 0.02) {
        field.burn[index] = clamp(
          field.burn[index] + heat * (0.021 + noise * 0.02) + config.crawl * noise,
          0,
          1,
        );
        nextHeat[index] *= config.persistence;

        if (heat > 0.018 && field.burn[index] < 0.995) {
          for (const [dx, dy] of [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, -1], [1, -1], [-1, 1],
          ]) {
            const neighbor = fieldIndex(field, x + dx, y + dy);
            if (field.burn[neighbor] > 0.985) continue;
            const horizontalWind = Math.abs(dx) > Math.abs(dy) ? 0.045 : 0;
            if (hash(x + dx * 17, y + dy * 19, time) < config.spread + horizontalWind + noise * 0.18) {
              nextHeat[neighbor] = Math.max(nextHeat[neighbor], heat * (0.7 + noise * 0.24));
            }
          }
        }
      }

      total += field.burn[index];
      if (nextHeat[index] > 0.018) hot += 1;
    }
  }

  field.heat = nextHeat;
  return { coverage: total / field.burn.length, hot };
}

function cloneHeroContent(root) {
  const wrapper = document.createElement("div");
  wrapper.className = "burn-copy";
  for (const source of root.querySelectorAll(":scope > [data-hero-content]")) {
    const clone = source.cloneNode(true);
    clone.removeAttribute("data-hero-content");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("h1").forEach((heading) => {
      const visualHeading = document.createElement("div");
      visualHeading.className = "hero-title-visual";
      visualHeading.textContent = heading.textContent;
      heading.replaceWith(visualHeading);
    });
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.querySelectorAll("[aria-controls]").forEach((node) => node.removeAttribute("aria-controls"));
    clone.querySelectorAll("a, button").forEach((node) => node.setAttribute("tabindex", "-1"));
    wrapper.append(clone);
  }
  return wrapper;
}

function canvasContext(canvas, width, height, dpr) {
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return context;
}

export class BurnReveal {
  constructor(root, config = BURN_CONFIG) {
    this.root = root;
    this.config = config;
    this.field = createBurnField(config.gridWidth, config.gridHeight);
    this.pointerDown = false;
    this.lastPointer = null;
    this.frame = 0;
    this.lastMaskAt = 0;
    this.sparks = [];
    this.bound = {
      resize: () => this.resize(),
      pointerDown: (event) => this.onPointerDown(event),
      pointerMove: (event) => this.onPointerMove(event),
      pointerUp: (event) => this.onPointerUp(event),
      visibility: () => this.onVisibilityChange(),
    };
  }

  async init() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.root.dataset.burnState = "reduced";
      return this;
    }

    const wireImage = this.root.querySelector("[data-wireframe-layer]");
    const mysticPicture = this.root.querySelector("[data-mystic-layer]");
    const mysticImage = mysticPicture?.querySelector("img");
    if (!wireImage || !mysticPicture || !mysticImage) throw new Error("Burn hero assets are incomplete");

    await Promise.all([wireImage.decode(), mysticImage.decode().catch(() => {})]);

    this.truth = document.createElement("div");
    this.truth.className = "burn-truth";
    this.truth.dataset.burnLayer = "truth";
    this.truth.setAttribute("aria-hidden", "true");
    this.truth.append(mysticPicture.cloneNode(true), cloneHeroContent(this.root));

    this.wire = document.createElement("div");
    this.wire.className = "burn-wire";
    this.wire.dataset.burnLayer = "wire";
    this.wire.setAttribute("aria-hidden", "true");
    this.wire.append(wireImage.cloneNode(true), cloneHeroContent(this.root));

    this.edgeCanvas = document.createElement("canvas");
    this.edgeCanvas.className = "burn-edge";
    this.edgeCanvas.setAttribute("aria-hidden", "true");
    this.fxCanvas = document.createElement("canvas");
    this.fxCanvas.className = "burn-fx";
    this.fxCanvas.setAttribute("aria-hidden", "true");
    this.maskCanvas = document.createElement("canvas");
    this.maskCanvas.width = this.field.width;
    this.maskCanvas.height = this.field.height;
    this.maskContext = this.maskCanvas.getContext("2d");

    this.root.prepend(this.truth, this.wire);
    this.root.append(this.edgeCanvas, this.fxCanvas);
    this.root.classList.add("is-enhanced");
    this.resize();
    this.drawMask(true);

    window.addEventListener("resize", this.bound.resize, { passive: true });
    this.root.addEventListener("pointerdown", this.bound.pointerDown);
    this.root.addEventListener("pointermove", this.bound.pointerMove);
    this.root.addEventListener("pointerup", this.bound.pointerUp);
    this.root.addEventListener("pointercancel", this.bound.pointerUp);
    document.addEventListener("visibilitychange", this.bound.visibility);
    this.observeCopyLabel();
    this.root.dataset.burnState = "ready";
    return this;
  }

  observeCopyLabel() {
    const canonical = this.root.querySelector(":scope > .hero-copy [data-copy-label]");
    if (!canonical) return;
    this.copyObserver = new MutationObserver(() => {
      this.root.querySelectorAll(".burn-copy [data-copy-label]").forEach((label) => {
        label.textContent = canonical.textContent;
      });
    });
    this.copyObserver.observe(canonical, { childList: true, characterData: true, subtree: true });
  }

  resize() {
    const rect = this.root.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.edgeContext = canvasContext(this.edgeCanvas, this.width, this.height, this.dpr);
    this.fxContext = canvasContext(this.fxCanvas, this.width, this.height, this.dpr);
  }

  pointerToGrid(clientX, clientY) {
    const rect = this.root.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * this.field.width,
      y: ((clientY - rect.top) / rect.height) * this.field.height,
    };
  }

  onPointerDown(event) {
    if (event.button !== 0 || event.target.closest("a, button, [data-hero-content]")) return;
    this.pointerDown = true;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.root.setPointerCapture(event.pointerId);
    const point = this.pointerToGrid(event.clientX, event.clientY);
    ignite(this.field, point.x, point.y, this.config.clickRadius, this.config.ignition, performance.now());
    this.start();
  }

  onPointerMove(event) {
    if (!this.pointerDown || !this.lastPointer) return;
    const from = this.lastPointer;
    const distance = Math.hypot(event.clientX - from.x, event.clientY - from.y);
    const stepSize = Math.max(this.width / this.field.width, this.height / this.field.height) * 1.15;
    const steps = Math.max(1, Math.ceil(distance / stepSize));
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      const clientX = from.x + (event.clientX - from.x) * progress;
      const clientY = from.y + (event.clientY - from.y) * progress;
      const point = this.pointerToGrid(clientX, clientY);
      ignite(this.field, point.x, point.y, this.config.dragRadius, this.config.ignition * 0.72, performance.now() + step);
    }
    this.lastPointer = { x: event.clientX, y: event.clientY };
  }

  onPointerUp(event) {
    this.pointerDown = false;
    this.lastPointer = null;
    if (this.root.hasPointerCapture(event.pointerId)) this.root.releasePointerCapture(event.pointerId);
  }

  start() {
    this.root.dataset.burnState = "burning";
    if (!this.frame && !document.hidden) this.frame = requestAnimationFrame((time) => this.step(time));
  }

  onVisibilityChange() {
    if (document.hidden && this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    } else if (!document.hidden && this.root.dataset.burnState === "burning" && !this.frame) {
      this.frame = requestAnimationFrame((time) => this.step(time));
    }
  }

  step(time) {
    this.frame = 0;
    const result = advance(this.field, time, this.config);
    this.drawEdge(time);
    if (time - this.lastMaskAt > 34) {
      this.drawMask(false, time);
      this.lastMaskAt = time;
    }

    if (result.coverage > 0.985) {
      this.field.burn.fill(1);
      this.drawMask(false, time);
      this.edgeContext.clearRect(0, 0, this.width, this.height);
      this.fxContext.clearRect(0, 0, this.width, this.height);
      this.root.dataset.burnState = "revealed";
      return;
    }
    this.frame = requestAnimationFrame((nextTime) => this.step(nextTime));
  }

  drawMask(force = false, time = 0) {
    const image = this.maskContext.createImageData(this.field.width, this.field.height);
    for (let y = 0; y < this.field.height; y += 1) {
      for (let x = 0; x < this.field.width; x += 1) {
        const index = fieldIndex(this.field, x, y);
        const noise = (fbm(x * 0.23, y * 0.23, time) - 0.5) * 0.14;
        const burn = clamp(this.field.burn[index] + noise, 0, 1);
        const smooth = burn * burn * (3 - 2 * burn);
        image.data[index * 4] = 255;
        image.data[index * 4 + 1] = 255;
        image.data[index * 4 + 2] = 255;
        image.data[index * 4 + 3] = Math.round((1 - smooth) * 255);
      }
    }
    this.maskContext.putImageData(image, 0, 0);
    if (force || this.root.dataset.burnState === "burning") {
      const maskUrl = `url(${this.maskCanvas.toDataURL("image/png")})`;
      this.wire.style.webkitMaskImage = maskUrl;
      this.wire.style.maskImage = maskUrl;
      this.wire.style.webkitMaskSize = "100% 100%";
      this.wire.style.maskSize = "100% 100%";
    }
  }

  drawEdge(time) {
    const edge = this.edgeContext;
    const fx = this.fxContext;
    const scaleX = this.width / this.field.width;
    const scaleY = this.height / this.field.height;
    edge.clearRect(0, 0, this.width, this.height);
    fx.clearRect(0, 0, this.width, this.height);

    const image = new ImageData(this.field.width, this.field.height);
    for (let y = 1; y < this.field.height - 1; y += 1) {
      for (let x = 1; x < this.field.width - 1; x += 1) {
        const index = fieldIndex(this.field, x, y);
        const burn = this.field.burn[index];
        if (burn < 0.035 || burn > 0.985) continue;
        const neighbor = (
          this.field.burn[fieldIndex(this.field, x + 1, y)] +
          this.field.burn[fieldIndex(this.field, x - 1, y)] +
          this.field.burn[fieldIndex(this.field, x, y + 1)] +
          this.field.burn[fieldIndex(this.field, x, y - 1)]
        ) * 0.25;
        const boundary = Math.min(x, y, this.field.width - 1 - x, this.field.height - 1 - y);
        const boundaryFade = clamp((boundary - 1.5) / 4.5, 0, 1);
        const flame = clamp((Math.abs(neighbor - burn) * 4.8 + this.field.heat[index] * 0.48) * this.config.fringe * boundaryFade, 0, 1);
        if (flame <= 0.045) continue;
        const hot = clamp((flame - 0.15) / 0.57, 0, 1);
        image.data[index * 4] = Math.round(170 + hot * 85);
        image.data[index * 4 + 1] = Math.round(58 + hot * 180);
        image.data[index * 4 + 2] = Math.round(9 + hot * 62);
        image.data[index * 4 + 3] = Math.round(45 + flame * 210);

        if (hash(x * 5, y * 9, time) < this.config.sparks * 0.004 * flame) {
          this.sparks.push({
            x: (x + 0.5) * scaleX,
            y: (y + 0.5) * scaleY,
            velocityX: (hash(x, y, time + 2) - 0.5) * 1.4,
            velocityY: -0.8 - hash(y, x, time + 5) * 1.6,
            life: 24 + hash(x, y, time + 8) * 24,
          });
        }
      }
    }

    const scratch = document.createElement("canvas");
    scratch.width = this.field.width;
    scratch.height = this.field.height;
    scratch.getContext("2d").putImageData(image, 0, 0);
    edge.save();
    edge.imageSmoothingEnabled = true;
    edge.filter = "blur(7px)";
    edge.globalAlpha = 0.54;
    edge.drawImage(scratch, 0, 0, this.width, this.height);
    edge.filter = "none";
    edge.globalAlpha = 1;
    edge.drawImage(scratch, 0, 0, this.width, this.height);
    edge.restore();

    this.sparks = this.sparks.filter((spark) => {
      spark.x += spark.velocityX;
      spark.y += spark.velocityY;
      spark.life -= 1;
      if (spark.life <= 0) return false;
      const alpha = clamp(spark.life / 38, 0, 1);
      fx.fillStyle = `rgba(255, ${150 + alpha * 90}, 38, ${alpha})`;
      fx.fillRect(spark.x, spark.y, 2.2, 2.2);
      return true;
    });
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.copyObserver?.disconnect();
    window.removeEventListener("resize", this.bound.resize);
    this.root.removeEventListener("pointerdown", this.bound.pointerDown);
    this.root.removeEventListener("pointermove", this.bound.pointerMove);
    this.root.removeEventListener("pointerup", this.bound.pointerUp);
    this.root.removeEventListener("pointercancel", this.bound.pointerUp);
    document.removeEventListener("visibilitychange", this.bound.visibility);
  }
}

if (typeof document !== "undefined") {
  const root = document.querySelector("[data-burn-hero]");
  if (root) {
    new BurnReveal(root).init().catch((error) => {
      root.dataset.burnState = "fallback";
      console.error("Salvor burn reveal failed to initialize", error);
    });
  }
}

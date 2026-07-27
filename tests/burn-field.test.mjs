import assert from "node:assert/strict";
import test from "node:test";

import {
  BURN_FRAGMENT_SHADER,
  BurnReveal,
  MAX_BURNS,
  createUiSnapshotSvg,
  sampleDragPoints,
} from "../site/scripts/burn-reveal.js";

function minimumDistance(data, count, point, aspect = 1) {
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    minimum = Math.min(minimum, Math.hypot(
      (point.x - data[offset]) * aspect,
      point.y - data[offset + 1],
    ) - data[offset + 2]);
  }
  return minimum;
}

test("sampleDragPoints fills drag gaps without exceeding the uniform capacity", () => {
  const points = sampleDragPoints(
    { x: 0.1, y: 0.2 },
    { x: 0.5, y: 0.2 },
    0.012,
    MAX_BURNS,
  );

  assert.ok(points.length > 1);
  assert.ok(points.length <= MAX_BURNS);
  assert.deepEqual(points.at(-1), { x: 0.5, y: 0.2 });
  for (let index = 1; index < points.length; index += 1) {
    assert.ok(Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    ) <= 0.0121);
  }
});

test("sampleDragPoints respects remaining burn capacity", () => {
  const points = sampleDragPoints(
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.9 },
    0.012,
    3,
  );

  assert.equal(points.length, 3);
  assert.deepEqual(points.at(-1), { x: 0.9, y: 0.9 });
});

test("sampleDragPoints waits until pointer movement reaches the drag spacing", () => {
  assert.deepEqual(
    sampleDragPoints(
      { x: 0.1, y: 0.1 },
      { x: 0.105, y: 0.105 },
      0.012,
      MAX_BURNS,
    ),
    [],
  );
});

test("adding past capacity preserves every existing burned area", () => {
  const burn = Object.create(BurnReveal.prototype);
  burn.capacity = 2;
  burn.burnCount = 2;
  burn.width = 100;
  burn.height = 100;
  burn.root = { dataset: {} };
  burn.burnData = new Float32Array([
    0.1, 0.5, 0.1,
    0.2, 0.5, 0.1,
  ]);
  const existingEdges = [
    { x: 0, y: 0.5 },
    { x: 0.3, y: 0.5 },
  ];
  const before = existingEdges.map((point) => minimumDistance(
    burn.burnData,
    burn.burnCount,
    point,
  ));

  burn.addBurn({ x: 0.9, y: 0.9 });

  assert.equal(burn.burnCount, 2);
  assert.equal(burn.root.dataset.burnCount, "2");
  existingEdges.forEach((point, index) => {
    assert.ok(
      minimumDistance(burn.burnData, burn.burnCount, point) <= before[index] + 1e-6,
      `existing burn coverage receded at ${JSON.stringify(point)}`,
    );
  });
});

test("step unlocks hero selection at 80% while the burn keeps rendering", () => {
  const burn = Object.create(BurnReveal.prototype);
  const completionRadius = Math.hypot(0.5, 0.5) + 0.18;
  burn.width = 100;
  burn.height = 100;
  burn.burnCount = 1;
  burn.burnData = new Float32Array([
    0.5,
    0.5,
    completionRadius * 0.8,
  ]);
  burn.root = { dataset: { burnState: "burning" } };
  burn.canvas = { hidden: false };
  burn.frame = 1;
  burn.lastFrameAt = 0;
  burn.draw = () => {};

  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 99;
  try {
    burn.step(16.667);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }

  assert.equal(burn.root.dataset.burnSelectable, "true");
  assert.equal(burn.root.dataset.burnState, "burning");
  assert.equal(burn.canvas.hidden, false);
  assert.equal(burn.frame, 99);
});

test("the fragment shader composites exact WF and M UI snapshots at the burn edge", () => {
  assert.match(BURN_FRAGMENT_SHADER, /uniform sampler2D u_wireframe/);
  assert.match(BURN_FRAGMENT_SHADER, /uniform sampler2D u_wireUi/);
  assert.match(BURN_FRAGMENT_SHADER, /uniform sampler2D u_mysticUi/);
  assert.match(BURN_FRAGMENT_SHADER, /texture2D\(u_wireframe/);
  assert.match(BURN_FRAGMENT_SHADER, /texture2D\(u_wireUi/);
  assert.match(BURN_FRAGMENT_SHADER, /texture2D\(u_mysticUi/);
  assert.match(BURN_FRAGMENT_SHADER, /textFade\s*=\s*smoothstep\([^;]*edgeBoundary\)/);
  assert.match(BURN_FRAGMENT_SHADER, /mix\(mysticUiSample, wireUiSample, textFade\)/);
  assert.match(BURN_FRAGMENT_SHADER, /gl_FragColor/);
  assert.match(BURN_FRAGMENT_SHADER, /baseAlpha/);
});

test("UI snapshots preserve canonical hero markup and switch only the visual state", () => {
  const root = {
    className: "hero is-enhanced",
    querySelectorAll() {
      return [
        { outerHTML: '<header class="site-header"><a class="brand">SALVOR</a></header>' },
        { outerHTML: '<div class="hero-copy"><a class="button button-primary">COPY SETUP_PROMPT.md</a></div>' },
      ];
    },
  };

  const wire = createUiSnapshotSvg(root, 964, 772, "wire", ".hero{color:#050608}");
  const mystic = createUiSnapshotSvg(root, 964, 772, "mystic", ".hero{color:#fff4e3}");

  assert.match(wire, /class="hero burn-ui-snapshot"/);
  assert.doesNotMatch(wire, /is-enhanced/);
  assert.match(mystic, /class="hero burn-ui-snapshot is-enhanced"/);
  assert.match(mystic, /data-burn-state="revealed"/);
  assert.match(wire, /button button-primary/);
  assert.match(mystic, /button button-primary/);
  assert.doesNotMatch(wire, /drawTextMask|fillText/);
});

test("the smoke uses the approved #9fa2a6 neutral base", () => {
  assert.match(
    BURN_FRAGMENT_SHADER,
    /smokeBaseColor\s*=\s*vec3\(\s*159\.0\s*\/\s*255\.0,\s*162\.0\s*\/\s*255\.0,\s*166\.0\s*\/\s*255\.0\s*\)/,
  );
  assert.match(BURN_FRAGMENT_SHADER, /smokeColor\s*=\s*mix\(\s*smokeBaseColor,/);
});

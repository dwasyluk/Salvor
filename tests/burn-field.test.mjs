import assert from "node:assert/strict";
import test from "node:test";

import {
  BURN_CONFIG,
  advance,
  createBurnField,
  ignite,
} from "../site/scripts/burn-reveal.js";

test("createBurnField starts with a cold, unburned field", () => {
  const field = createBurnField(40, 24);
  assert.equal(field.width, 40);
  assert.equal(field.height, 24);
  assert.equal(field.burn.length, 960);
  assert.ok(field.burn.every((value) => value === 0));
  assert.ok(field.heat.every((value) => value === 0));
});

test("ignite creates an irregular bounded neighborhood", () => {
  const field = createBurnField(60, 40);
  ignite(field, 30, 20, 6, 1.35, 100);
  const lit = [];
  field.heat.forEach((value, index) => {
    if (value > 0) lit.push([index % field.width, Math.floor(index / field.width)]);
  });

  assert.ok(lit.length > 24);
  assert.ok(lit.length < 150);
  assert.ok(lit.every(([x, y]) => Math.hypot(x - 30, y - 20) <= 9));
});

test("one ignition remains self-sustaining and increases coverage", () => {
  const field = createBurnField(80, 48);
  ignite(field, 40, 24, 6, BURN_CONFIG.ignition, 200);
  const initial = advance(field, 201, BURN_CONFIG).coverage;
  let result;
  for (let frame = 0; frame < 220; frame += 1) {
    result = advance(field, 202 + frame * 16, BURN_CONFIG);
  }
  assert.ok(result.coverage > initial + 0.035, `${result.coverage} should exceed ${initial}`);
});

test("multiple fronts merge without reversing burned cells", () => {
  const field = createBurnField(80, 48);
  ignite(field, 18, 24, 6, BURN_CONFIG.ignition, 300);
  ignite(field, 62, 24, 6, BURN_CONFIG.ignition, 301);
  for (let frame = 0; frame < 140; frame += 1) advance(field, 302 + frame * 16, BURN_CONFIG);
  const snapshot = Float32Array.from(field.burn);
  for (let frame = 0; frame < 140; frame += 1) advance(field, 2600 + frame * 16, BURN_CONFIG);
  field.burn.forEach((value, index) => assert.ok(value >= snapshot[index]));
  assert.ok(field.burn.some((value, index) => index % field.width > 32 && index % field.width < 48 && value > 0.05));
});

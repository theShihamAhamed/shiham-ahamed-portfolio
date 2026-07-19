import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const read = (relativePath) =>
  fs.readFileSync(path.resolve(testDirectory, "..", relativePath), "utf8");

const component = read(
  "components/sections/home/hero/hero-contact-aurora-link.tsx",
);
const styles = read(
  "components/sections/home/hero/hero-contact-aurora-link.module.css",
);
const hero = read("components/sections/home/hero/hero-section.tsx");
const rule = (selector) => {
  const match = styles.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`));

  assert.ok(match, `Expected .${selector} CSS rule`);
  return match[1];
};

const fieldRule = rule("field");
const maskRule = rule("mask");
const stripRule = rule("strip");

test("hero aurora contact link keeps one server-rendered semantic target", () => {
  assert.match(component, /import Link from "next\/link"/);
  assert.equal((component.match(/<Link\b/g) ?? []).length, 1);
  assert.match(component, /href="\/contact"/);
  assert.match(component, />Contact Me</);
  assert.match(component, /aria-hidden="true"/);
  assert.doesNotMatch(component, /["']use client["']/);
  assert.doesNotMatch(component, /components\/ui\/button|useState|onMouse|onPointer|mousemove|pointermove|setTimeout|setInterval|requestAnimationFrame/);
});

test("hero replaces only the Contact Me button with the scoped component", () => {
  assert.match(hero, /hero-contact-aurora-link/);
  assert.equal((hero.match(/<HeroContactAuroraLink\s*\/>/g) ?? []).length, 1);
  assert.doesNotMatch(hero, /<Link href="\/contact">Contact Me<\/Link>/);
  assert.match(hero, /<Link href="\/projects">/);
  assert.match(hero, /View Projects/);
  assert.match(hero, /profile\.resumeUrl/);
  assert.match(hero, /Resume/);
  assert.equal((hero.match(/<Button\b/g) ?? []).length, 2);
});

test("aurora CSS preserves the inspected gradients and animation mechanics", () => {
  assert.match(styles, /@keyframes aurora-shift[\s\S]*?0%\s*{\s*transform: translateX\(0\);[\s\S]*?100%\s*{\s*transform: translateX\(-50%\);/);
  assert.match(styles, /animation-duration: 23s/);
  assert.match(styles, /animation-timing-function: cubic-bezier\(\.15, 0, \.85, 1\)/);
  assert.match(styles, /animation-delay: 0s/);
  assert.match(styles, /animation-iteration-count: infinite/);
  assert.match(styles, /animation-direction: alternate/);
  assert.match(styles, /animation-fill-mode: none/);
  assert.match(styles, /animation-play-state: paused/);
  assert.match(styles, /\.link:focus-visible ~ \.glow \.strip[\s\S]*?animation-play-state: running/);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.link:hover ~ \.glow \.strip[\s\S]*?animation-play-state: running/);

  for (const color of ["#085e53", "#0072f5", "#8e4ec6", "#ea3e83", "#ffb224"]) {
    assert.match(styles, new RegExp(color));
  }
  assert.equal((styles.match(/repeating-linear-gradient\(\s*110deg/g) ?? []).length, 2);
  assert.doesNotMatch(fieldRule, /background(?:-image|-size)?\s*:/);
  assert.match(stripRule, /background-image: var\(--aurora-lights\), var\(--aurora-gaps\)/);
  assert.match(stripRule, /background-size: 100%, 100%/);
  assert.match(stripRule, /width: 300%/);
  assert.match(stripRule, /height: 100%/);
  assert.match(stripRule, /mix-blend-mode: difference/);
  assert.match(stripRule, /animation-name: aurora-shift/);
  assert.match(stripRule, /animation-play-state: paused/);
});

test("aurora layers preserve exact glow and glass contracts", () => {
  assert.match(styles, /height: 80px/);
  assert.match(styles, /transition: opacity 0\.5s/);
  assert.match(maskRule, /inset: 0 -32px/);
  assert.match(fieldRule, /inset: -10px -200px -10px -40px/);
  assert.match(fieldRule, /overflow: hidden/);
  assert.match(fieldRule, /filter: blur\(12px\) invert\(0\)/);
  assert.match(fieldRule, /opacity: 0\.7/);
  assert.match(styles, /-webkit-mask-image: radial-gradient\([\s\S]*?ellipse at 50% 82%[\s\S]*?#000 27%[\s\S]*?transparent 70%/);
  assert.match(styles, /(?<!-webkit-)mask-image: radial-gradient\([\s\S]*?ellipse at 50% 82%[\s\S]*?#000 27%[\s\S]*?transparent 70%/);
  assert.match(styles, /-webkit-backdrop-filter: blur\(20px\) brightness\(1\.3\) saturate\(1\.5\)/);
  assert.match(styles, /(?<!-webkit-)backdrop-filter: blur\(20px\) brightness\(1\.3\) saturate\(1\.5\)/);
  assert.match(styles, /-webkit-backdrop-filter: blur\(16px\)/);
  assert.match(styles, /(?<!-webkit-)backdrop-filter: blur\(16px\)/);
  assert.match(styles, /background: rgba\(255, 255, 255, 0\.1\)/);
});

test("aurora CSS keeps interaction accessible, contained, and motion-aware", () => {
  assert.match(styles, /isolation: isolate/);
  assert.match(styles, /overflow: visible/);
  assert.match(styles, /pointer-events: none/);
  assert.match(styles, /\.link:focus-visible[\s\S]*?outline: 2px solid var\(--ring\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /animation: none/);
  assert.match(styles, /transform: translateX\(-25%\)/);
  assert.match(hero, /<section id="hero" className="scroll-target relative isolate overflow-hidden">/);
});

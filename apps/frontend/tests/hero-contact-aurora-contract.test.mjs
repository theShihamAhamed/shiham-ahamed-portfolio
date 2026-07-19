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
const sharedButton = read("components/ui/button.tsx");
const rule = (selector) => {
  const match = styles.match(
    new RegExp(`(?:^|\\n)\\.${selector}\\s*\\{([^}]*)\\}`),
  );

  assert.ok(match, `Expected .${selector} CSS rule`);
  return match[1];
};

const rootRule = rule("auroraRoot");
const buttonRule = rule("auroraButton");
const glowRule = rule("auroraGlow");
const maskRule = rule("auroraMask");
const visibleRule = rule("auroraVisible");
const fieldRule = rule("auroraField");
const stripRule = rule("auroraStrip");

test("Contact Me keeps the exact semantic Vercel sibling hierarchy", () => {
  assert.match(component, /import Link from "next\/link"/);
  assert.equal((component.match(/<Link\b/g) ?? []).length, 1);
  assert.match(component, /href="\/contact"/);
  assert.match(component, />Contact Me</);
  assert.equal((component.match(/aria-hidden="true"/g) ?? []).length, 1);
  assert.doesNotMatch(component, /["']use client["']/);
  assert.doesNotMatch(
    component,
    /useState|useEffect|onMouse|onPointer|mousemove|pointermove|setTimeout|setInterval|requestAnimationFrame|components\/ui\/button/,
  );

  const renderedComponent = component.slice(
    component.indexOf("export function HeroContactAuroraLink"),
  );
  assert.ok(
    renderedComponent.indexOf("styles.auroraButton") <
      renderedComponent.indexOf("<AuroraLayers />"),
  );
  assert.match(component, /styles\.auroraGlow/);
  assert.match(component, /styles\.auroraMask/);
  assert.match(component, /styles\.auroraVisible/);
  assert.match(component, /styles\.auroraField/);
  assert.equal((component.match(/styles\.auroraStrip/g) ?? []).length, 1);
  assert.doesNotMatch(
    component,
    /internalAurora|internalField|internalStrip|externalBloom|bloomMask|bloomField|bloomStrip/,
  );
});

test("CTA order, hierarchy, and local icon spacing remain intentional", () => {
  assert.match(hero, /<Link href="\/projects">/);
  assert.match(hero, /View Projects/);
  assert.match(hero, /hero-contact-aurora-link/);
  assert.match(hero, /<HeroContactAuroraLink\s*\/>/);
  assert.match(hero, /profile\.resumeUrl/);
  assert.match(hero, /Resume/);
  assert.equal((hero.match(/<Button\b/g) ?? []).length, 2);
  assert.match(hero, /View Projects[\s\S]*HeroContactAuroraLink[\s\S]*Resume/);
  assert.match(hero, /h-11 w-full gap-2 rounded-xl bg-foreground/);
  assert.match(hero, /h-11 w-full gap-2 rounded-xl px-5/);
  assert.doesNotMatch(hero, /ArrowRight className="ml-2/);
  assert.doesNotMatch(hero, /Download className="mr-2/);
  assert.match(sharedButton, /function Button\(/);
  assert.doesNotMatch(sharedButton, /aurora|HeroContactAuroraLink/);
});

test("Contact Me uses the adapted 44px responsive geometry", () => {
  assert.match(rootRule, /--aurora-button-width: 176px/);
  assert.match(rootRule, /--aurora-button-height: 44px/);
  assert.match(rootRule, /--aurora-radius: 14px/);
  assert.match(rootRule, /--aurora-inner-radius: 13px/);
  assert.match(rootRule, /--aurora-glow-height: 96px/);
  assert.match(rootRule, /height: var\(--aurora-button-height\)/);
  assert.match(rootRule, /width: 100%/);
  assert.match(buttonRule, /height: var\(--aurora-button-height\)/);
  assert.match(buttonRule, /width: 100%/);
  assert.match(buttonRule, /border-radius: var\(--aurora-radius\)/);
  assert.match(buttonRule, /font-size: 14px/);
  assert.match(buttonRule, /font-weight: 500/);
  assert.match(buttonRule, /line-height: 20px/);
  assert.match(buttonRule, /padding-inline: 24px/);
  assert.match(styles, /@media \(min-width: 640px\)[\s\S]*?width: var\(--aurora-button-width\)/);
  assert.match(styles, /border-radius: var\(--aurora-inner-radius\)/);
  assert.doesNotMatch(styles, /264px|height: 32px|border-radius: 6px|border-radius: 5px/);
  assert.doesNotMatch(styles, /translateY\(|scale\(|var\(--shadow-md\)/);
});

test("Contact Me has a quiet semantic resting surface and restrained interaction", () => {
  assert.match(buttonRule, /background: var\(--background\)/);
  assert.match(buttonRule, /border-color: var\(--border\)/);
  assert.match(buttonRule, /color: var\(--foreground\)/);
  assert.match(
    styles,
    /@supports \(color: color-mix\(in srgb, red, blue\)\)[\s\S]*?background: color-mix\(in srgb, var\(--background\) 82%, transparent\)/,
  );
  assert.match(
    styles,
    /@supports \(color: color-mix\(in srgb, red, blue\)\)[\s\S]*?border-color: color-mix\(in srgb, var\(--foreground\) 18%, transparent\)/,
  );
  assert.match(styles, /\.auroraButton:hover[\s\S]*?background: transparent/);
  assert.match(styles, /\.auroraButton:focus-visible\s*\{[\s\S]*?background: transparent/);
  assert.match(
    styles,
    /\.auroraButton:hover ~ \.auroraGlow[\s\S]*?opacity: 1[\s\S]*?transform: none/,
  );
  assert.match(
    styles,
    /\.auroraButton:focus-visible ~ \.auroraGlow[\s\S]*?opacity: 1[\s\S]*?transform: none/,
  );
  assert.doesNotMatch(
    styles,
    /\.auroraButton:hover,\s*\.auroraButton:focus-visible\s*\{[^}]*transform/,
  );
  assert.doesNotMatch(
    styles,
    /\.auroraButton:hover,\s*\.auroraButton:focus-visible\s*\{[^}]*box-shadow/,
  );
});

test("The verified aurora core remains unchanged while its spatial geometry scales", () => {
  assert.match(rootRule, /--aurora-mask-inset-inline: -12\.12%/);
  assert.match(rootRule, /--aurora-field-inset-top: -14px/);
  assert.match(rootRule, /--aurora-field-inset-inline-end: -75\.76%/);
  assert.match(rootRule, /--aurora-field-inset-bottom: -14px/);
  assert.match(rootRule, /--aurora-field-inset-inline-start: -15\.15%/);
  assert.match(glowRule, /height: var\(--aurora-glow-height\)/);
  assert.match(maskRule, /inset: 0 var\(--aurora-mask-inset-inline\)/);
  assert.match(fieldRule, /var\(--aurora-field-inset-top\)/);
  assert.match(fieldRule, /var\(--aurora-field-inset-inline-end\)/);
  assert.match(fieldRule, /var\(--aurora-field-inset-bottom\)/);
  assert.match(fieldRule, /var\(--aurora-field-inset-inline-start\)/);
  assert.match(maskRule, /radial-gradient\(ellipse at 50% 82%, #000 27%, transparent 70%\)/);
  assert.match(visibleRule, /overflow: hidden/);
  assert.match(fieldRule, /background-image: var\(--gaps\), var\(--lights\)/);
  assert.match(fieldRule, /background-size: 120%, 200%/);
  assert.match(fieldRule, /filter: blur\(12px\) invert\(var\(--invert\)\)/);
  assert.match(fieldRule, /opacity: 0\.7/);
  assert.match(stripRule, /background-image: var\(--gaps\), var\(--lights\)/);
  assert.match(stripRule, /background-size: 100%, 100%/);
  assert.match(stripRule, /height: 100%/);
  assert.match(stripRule, /mix-blend-mode: difference/);
  assert.match(stripRule, /position: absolute/);
  assert.match(stripRule, /width: 300%/);
  assert.match(stripRule, /animation-name: aurora-shift/);
  assert.match(stripRule, /animation-duration: 23s/);
  assert.match(stripRule, /animation-timing-function: cubic-bezier\(0\.15, 0, 0\.85, 1\)/);
  assert.match(stripRule, /animation-delay: 0s/);
  assert.match(stripRule, /animation-iteration-count: infinite/);
  assert.match(stripRule, /animation-direction: alternate/);
  assert.match(stripRule, /animation-fill-mode: none/);
  assert.match(stripRule, /animation-play-state: paused/);
  assert.equal((styles.match(/background-image: var\(--gaps\), var\(--lights\)/g) ?? []).length, 2);
  assert.equal((styles.match(/animation-name: aurora-shift/g) ?? []).length, 1);
  assert.match(
    styles,
    /@keyframes aurora-shift[\s\S]*?0%\s*{\s*transform: translateX\(0\);[\s\S]*?100%\s*{\s*transform: translateX\(-50%\);/,
  );
  for (const color of ["#085e53", "#0072f5", "#8e4ec6", "#ea3e83", "#ffb224"]) {
    assert.match(styles, new RegExp(color));
  }
});

test("Focus, active, reduced motion, and decoration contracts remain accessible", () => {
  assert.match(styles, /\.auroraButton:focus-visible\s*\{[\s\S]*?outline: 2px solid var\(--foreground\)/);
  assert.match(styles, /\.auroraButton:hover::before[\s\S]*?backdrop-filter: blur\(20px\) brightness\(1\.3\) saturate\(1\.5\)/);
  assert.match(styles, /\.auroraButton:hover::after[\s\S]*?backdrop-filter: blur\(16px\)/);
  assert.match(styles, /\.auroraButton:active::after\s*{[^}]*background: rgba\(var\(--foreground-rgb\), 0\.1\)/);
  assert.match(styles, /pointer-events: none/);
  assert.match(styles, /\.auroraButton:hover ~ \.auroraGlow \.auroraStrip[\s\S]*?animation-play-state: running/);
  assert.match(styles, /\.auroraButton:focus-visible ~ \.auroraGlow \.auroraStrip[\s\S]*?animation-play-state: running/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.auroraStrip\s*\{[\s\S]*?animation: none[\s\S]*?transform: translateX\(-25%\)/);
  assert.doesNotMatch(component, /onMouse|onPointer|mousemove|pointermove|requestAnimationFrame|setTimeout|setInterval/);
});

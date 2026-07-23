import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const read = (relativePath) =>
  fs.readFileSync(path.resolve(frontendRoot, relativePath), "utf8");
const sha256 = (relativePath) =>
  createHash("sha256").update(read(relativePath)).digest("hex").toUpperCase();

const page = read("app/page.tsx");
const styles = read("app/globals.css");
const bento = read("components/ui/bento-grid.tsx");
const quickIntro = read(
  "components/sections/home/quick-intro/quick-intro-section.tsx",
);
const aboutCard = read(
  "components/sections/home/quick-intro/cards/about-card.tsx",
);
const informationalCards = [
  "focus-card.tsx",
  "stack-card.tsx",
  "currently-building-card.tsx",
  "approach-card.tsx",
  "learning-journey-card.tsx",
].map((file) =>
  read(`components/sections/home/quick-intro/cards/${file}`),
);
const featured = read(
  "components/sections/home/featured-projects/featured-projects-section.tsx",
);
const projectCard = read("components/projects/shared/project-card.tsx");
const skillCard = read(
  "components/sections/home/skills-tools/skill-category-card.tsx",
);
const currentCard = read(
  "components/sections/home/currently-building/current-project-card.tsx",
);
const contact = read(
  "components/sections/home/contact-cta/contact-cta-section.tsx",
);

const cssRule = (selector) => {
  const match = styles.match(
    new RegExp(`(?:^|\\n)${selector.replaceAll(".", "\\.")}\\s*\\{([^}]*)\\}`),
  );
  assert.ok(match, `Expected ${selector} CSS rule`);
  return match[1];
};

const cssCustomProperty = (rule, property) => {
  const match = rule.match(new RegExp(`${property}:\\s*([^;]+);`));
  assert.ok(match, `Expected ${property} custom property`);
  return match[1].replace(/\s+/g, " ").trim();
};

test("homepage uses one scoped neutral canvas without a containing block", () => {
  assert.equal((page.match(/className="home-page"/g) ?? []).length, 1);

  const root = cssRule(".home-page");
  const darkRoot = cssRule(".dark .home-page");
  assert.equal((root.match(/radial-gradient\(/g) ?? []).length, 1);
  assert.equal((darkRoot.match(/radial-gradient\(/g) ?? []).length, 0);
  assert.match(root, /72rem 34rem at 50% 12%/);
  assert.match(root, /transparent 72%/);
  assert.match(root, /background-repeat: no-repeat/);
  assert.doesNotMatch(
    root,
    /(?:^|\n)\s*(?:filter|backdrop-filter|transform|perspective|contain|overflow)\s*:/,
  );
  assert.doesNotMatch(root, /background-attachment/);
  assert.doesNotMatch(styles, /@keyframes[^\{]*home/i);

  const homepageRules = `${root}\n${darkRoot}`;
  assert.doesNotMatch(
    homepageRules,
    /home-ambient-(?:blue|violet|cyan)|rgba\((?:37, 99, 235|59, 130, 246|124, 58, 237|139, 92, 246|6, 182, 212|34, 211, 238)/,
  );
});

test("homepage canvas and surfaces use the approved neutral light and dark tokens", () => {
  const root = cssRule(".home-page");
  const darkRoot = cssRule(".dark .home-page");

  for (const declaration of [
    "--home-canvas: #f7f7f7",
    "--home-surface-quiet: rgba(255, 255, 255, 0.94)",
    "--home-surface-emphasis: rgba(255, 255, 255, 0.98)",
    "--home-border-quiet: rgba(10, 10, 10, 0.13)",
    "--home-border-strong: rgba(10, 10, 10, 0.18)",
    "--home-neutral-field: rgba(255, 255, 255, 0.82)",
  ]) {
    assert.ok(root.includes(declaration), `Expected ${declaration}`);
  }

  for (const declaration of [
    "--home-canvas: #080808",
    "--home-surface-quiet: rgba(17, 17, 17, 0.92)",
    "--home-surface-emphasis: rgba(20, 20, 20, 0.94)",
    "--home-border-quiet: rgba(255, 255, 255, 0.12)",
    "--home-border-strong: rgba(255, 255, 255, 0.17)",
    "--home-neutral-field: rgba(255, 255, 255, 0.025)",
  ]) {
    assert.ok(darkRoot.includes(declaration), `Expected ${declaration}`);
  }

  assert.equal((quickIntro.match(/<BentoGridItem/g) ?? []).length, 6);
  assert.equal(
    (quickIntro.match(/bg-\[var\(--home-surface-quiet\)\]/g) ?? []).length,
    6,
  );
  assert.equal(
    (quickIntro.match(/border-\[var\(--home-border-quiet\)\]/g) ?? []).length,
    6,
  );
  assert.match(contact, /bg-\[var\(--home-surface-emphasis\)\]/);
  assert.match(contact, /border-\[var\(--home-border-strong\)\]/);
});

test("homepage resting elevation stays neutral, bounded, and selectively scoped", () => {
  const root = cssRule(".home-page");
  const darkRoot = cssRule(".dark .home-page");
  const lightQuiet = cssCustomProperty(root, "--home-shadow-quiet");
  const lightEmphasis = cssCustomProperty(root, "--home-shadow-emphasis");
  const darkQuiet = cssCustomProperty(darkRoot, "--home-shadow-quiet");
  const darkEmphasis = cssCustomProperty(
    darkRoot,
    "--home-shadow-emphasis",
  );

  assert.equal(
    lightQuiet,
    "0 1px 2px rgba(10, 10, 10, 0.04), 0 10px 28px rgba(10, 10, 10, 0.055)",
  );
  assert.equal(
    lightEmphasis,
    "0 1px 2px rgba(10, 10, 10, 0.05), 0 14px 36px rgba(10, 10, 10, 0.075)",
  );
  assert.equal(
    darkQuiet,
    "0 0 0 1px rgba(255, 255, 255, 0.018), 0 10px 30px rgba(0, 0, 0, 0.32), 0 0 24px rgba(255, 255, 255, 0.022)",
  );
  assert.equal(
    darkEmphasis,
    "0 0 0 1px rgba(255, 255, 255, 0.025), 0 14px 38px rgba(0, 0, 0, 0.38), 0 0 30px rgba(255, 255, 255, 0.032)",
  );

  assert.doesNotMatch(`${lightQuiet} ${lightEmphasis}`, /rgba\(255, 255, 255/);
  assert.match(darkQuiet, /0 0 24px rgba\(255, 255, 255, 0\.022\)/);
  assert.match(darkEmphasis, /0 0 30px rgba\(255, 255, 255, 0\.032\)/);

  const darkWhiteOpacities = [...`${darkQuiet} ${darkEmphasis}`.matchAll(
    /rgba\(255, 255, 255, (0?\.\d+)\)/g,
  )].map((match) => Number(match[1]));
  assert.ok(darkWhiteOpacities.length > 0);
  assert.ok(darkWhiteOpacities.every((opacity) => opacity <= 0.04));

  const restingSources = [bento, skillCard, currentCard, contact].join("\n");
  assert.equal(
    (restingSources.match(/shadow-\[var\(--home-shadow-quiet\)\]/g) ?? [])
      .length,
    3,
  );
  assert.equal(
    (restingSources.match(/shadow-\[var\(--home-shadow-emphasis\)\]/g) ?? [])
      .length,
    1,
  );
  assert.match(contact, /shadow-\[var\(--home-shadow-emphasis\)\]/);
  assert.doesNotMatch(projectCard, /--home-shadow|home-shadow-/);
  assert.doesNotMatch(restingSources, /drop-shadow/);
  assert.doesNotMatch(styles, /@keyframes[^\{]*home-shadow|animation:[^;]*home-shadow/);
});

test("all Bento tiles restore the original pointer and border glow behavior", () => {
  assert.match(bento, /interactiveHeader\?: boolean/);
  assert.doesNotMatch(bento, /\binteractive\?: boolean/);
  assert.match(
    bento,
    /onMouseMove=\{interactiveHeader \? undefined : handleMouseMove\}/,
  );
  assert.match(bento, /e\.clientX - rect\.left/);
  assert.match(bento, /e\.clientY - rect\.top/);

  for (const glow of [
    /radial-gradient\(440px circle[\s\S]*rgba\(24, 24, 27, 0\.075\)[\s\S]*transparent 42%/,
    /radial-gradient\(1000px circle[\s\S]*rgba\(24, 24, 27, 0\.11\)[\s\S]*transparent 32%/,
    /radial-gradient\(300px circle[\s\S]*rgba\(24, 24, 27, 0\.9\)[\s\S]*rgba\(24, 24, 27, 0\.4\) 35%[\s\S]*transparent 65%/,
    /radial-gradient\(1000px circle[\s\S]*rgba\(24, 24, 27, 0\.28\)[\s\S]*transparent 60%/,
    /radial-gradient\(440px circle[\s\S]*rgba\(245, 245, 245, 0\.09\)[\s\S]*transparent 42%/,
    /radial-gradient\(1000px circle[\s\S]*rgba\(245, 245, 245, 0\.13\)[\s\S]*transparent 32%/,
    /radial-gradient\(300px circle[\s\S]*rgba\(255, 255, 255, 0\.95\)[\s\S]*rgba\(212, 212, 216, 0\.45\) 35%[\s\S]*transparent 65%/,
    /radial-gradient\(1000px circle[\s\S]*rgba\(255, 255, 255, 0\.3\)[\s\S]*transparent 60%/,
  ]) {
    assert.match(bento, glow);
  }

  assert.match(bento, /mix-blend-multiply/);
  assert.match(bento, /mix-blend-screen/);
  assert.match(bento, /WebkitMaskComposite: "xor"/);
  assert.match(bento, /maskComposite: "exclude"/);
  assert.match(bento, /filter: "blur\(50px\)"/);
  assert.match(bento, /hover:-translate-y-0\.5/);
  assert.match(bento, /hover:shadow-\[0_14px_34px_rgba\(0,0,0,0\.07\)\]/);
  assert.match(bento, /motion-reduce:hover:translate-y-0/);
  assert.ok(
    (bento.match(/motion-reduce:transition-none/g) ?? []).length >= 7,
  );
});

test("Bento semantics keep About navigational and informational tiles static", () => {
  assert.match(aboutCard, /<Link/);
  assert.match(aboutCard, /href="\/about"/);
  assert.match(aboutCard, /focus-visible:ring-2/);

  for (const source of informationalCards) {
    assert.doesNotMatch(source, /<(?:Link|button|a)\b/);
    assert.doesNotMatch(source, /cursor-pointer/);
  }
  assert.doesNotMatch(quickIntro, /\binteractive\b/);
});

test("Skills and Currently Building restore hover depth with reduced motion", () => {
  assert.match(skillCard, /backdrop-blur-sm/);
  assert.match(skillCard, /transition-all duration-300 ease-out/);
  assert.match(skillCard, /hover:-translate-y-0\.5/);
  assert.match(skillCard, /hover:border-border/);
  assert.match(
    skillCard,
    /hover:shadow-\[0_16px_40px_rgba\(0,0,0,0\.08\)\]/,
  );
  assert.match(
    skillCard,
    /dark:hover:shadow-\[0_16px_40px_rgba\(255,255,255,0\.04\)\]/,
  );
  assert.match(skillCard, /motion-reduce:transition-none/);
  assert.match(skillCard, /motion-reduce:hover:translate-y-0/);

  assert.match(currentCard, /backdrop-blur-xl/);
  assert.match(currentCard, /transition-all duration-200 ease-out/);
  assert.match(currentCard, /hover:-translate-y-0\.5/);
  assert.match(currentCard, /hover:border-border/);
  assert.match(
    currentCard,
    /hover:shadow-\[0_18px_48px_rgba\(0,0,0,0\.08\)\]/,
  );
  assert.match(
    currentCard,
    /dark:hover:shadow-\[0_18px_48px_rgba\(255,255,255,0\.035\)\]/,
  );
  assert.match(
    currentCard,
    /radial-gradient\(circle_at_top_right,rgba\(120,119,198,0\.08\)/,
  );
  assert.match(
    currentCard,
    /radial-gradient\(circle_at_bottom_left,rgba\(59,130,246,0\.06\)/,
  );
  assert.match(currentCard, /motion-reduce:transition-none/);
  assert.match(currentCard, /motion-reduce:hover:translate-y-0/);
});

test("shared cards and protected controls remain isolated from homepage recovery", () => {
  assert.doesNotMatch(projectCard, /surface\?:|home-featured/);
  assert.doesNotMatch(featured, /surface="home-featured"|home-featured-section/);

  const protectedSources = [
    read("components/sections/home/hero/hero-contact-aurora-link.tsx"),
    read("components/sections/home/hero/hero-contact-aurora-link.module.css"),
    read("components/sections/home/hero/hero-section.tsx"),
    read("components/navigation/section-quick-nav.tsx"),
    read("components/ui/button.tsx"),
    read("components/ui/sheet.tsx"),
    read("app/projects/page.tsx"),
    read("components/projects/listing/project-catalog.tsx"),
    read("components/projects/listing/project-catalog-state.ts"),
    read("components/projects/listing/project-catalog-toolbar.tsx"),
  ].join("\n");

  assert.doesNotMatch(
    protectedSources,
    /home-(?:page|surface|border|shadow|neutral-field|featured)/,
  );
});

test("shared project card and Projects filter sources remain byte-for-byte preserved", () => {
  const expectedHashes = new Map([
    [
      "components/projects/shared/project-card.tsx",
      "1C61D28FF45B902C6F42F684587725EE01B0F27624F1D14FEFD89395667F3E97",
    ],
    [
      "app/projects/page.tsx",
      "7236847902D61E76F17F25620896E7E5771CD5EF2EF5D22A0C44946F6E6086F7",
    ],
    [
      "components/projects/listing/project-catalog.tsx",
      "C18AF9ACFE254B3CF58E09767611C7BDECB6372894FDCE8D1DCA5973D49A5DDE",
    ],
    [
      "components/projects/listing/project-catalog-state.ts",
      "C7161D6D7E52E4F55160021DB71E7BDA50491AD3FE7C38CBF90638155AEB8493",
    ],
    [
      "components/projects/listing/project-catalog-toolbar.tsx",
      "1EEB682148783072F12D0B879CD097083ECAAD6AC9224CA6987AC3FBA1822B7B",
    ],
    [
      "tests/project-catalog-filter-contract.test.mjs",
      "FE725C7178C28FBCA30E7CB15B7079C62E5DFA2D487B956C21135481D505C63B",
    ],
  ]);

  for (const [relativePath, expectedHash] of expectedHashes) {
    assert.equal(sha256(relativePath), expectedHash, relativePath);
  }
});

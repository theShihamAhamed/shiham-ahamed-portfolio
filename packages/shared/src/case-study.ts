import { z } from "zod";

export const CASE_STUDY_MDX_MAX_BYTES = 100_000;

export type CaseStudyMdxValidationIssue = {
  code: "too_large" | "unsafe_syntax";
  message: string;
};

export type CaseStudyUrlKind = "link" | "image";

/**
 * This is deliberately a data-only policy. Frontends use it to configure
 * rehype-sanitize, while the shared validator below protects API/database
 * boundaries without importing a server-only or React package.
 */
export const CASE_STUDY_README_HTML_ELEMENTS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "div",
  "span",
  "br",
  "hr",
  "blockquote",
  "details",
  "summary",
  "strong",
  "b",
  "em",
  "i",
  "del",
  "s",
  "sub",
  "sup",
  "kbd",
  "mark",
  "abbr",
  "a",
  "img",
  "picture",
  "source",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "pre",
  "code",
] as const;

/** The input tag is only retained for remark-gfm's generated task checkboxes. */
export const CASE_STUDY_RENDERED_TAG_NAMES = [
  ...CASE_STUDY_README_HTML_ELEMENTS,
  "input",
] as const;

const languageClassPattern = /^language-[a-z0-9_+#.-]+$/i;
const taskListClassPattern = /^(?:contains-task-list|task-list-item)$/;

export const CASE_STUDY_ALLOWED_ATTRIBUTES = {
  "*": ["title"],
  p: ["align"],
  div: ["align"],
  a: ["href", "target", "rel"],
  img: ["src", "srcSet", "alt", "title", "width", "height", "loading"],
  picture: [],
  source: ["src", "srcSet", "media", "type", "width", "height"],
  details: ["open"],
  table: ["align"],
  th: ["align", "colSpan", "rowSpan"],
  td: ["align", "colSpan", "rowSpan"],
  ul: [["className", taskListClassPattern]],
  li: [["className", taskListClassPattern]],
  code: [["className", languageClassPattern]],
  input: ["type", "checked", "disabled"],
} as const;

/**
 * Plain object consumed by rehype-sanitize in each frontend. Keeping this in
 * shared makes the admin Preview and public page use one security contract.
 */
export const caseStudySanitizeSchema = {
  tagNames: [...CASE_STUDY_RENDERED_TAG_NAMES],
  attributes: CASE_STUDY_ALLOWED_ATTRIBUTES,
  protocols: {
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
    srcSet: ["http", "https"],
  },
} as const;

export const getUtf8ByteLength = (value: string): number =>
  new TextEncoder().encode(value).length;

export const normalizeCaseStudyMdx = (
  value: unknown,
): string | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const unsafeUrlCharacters = /[\u0000-\u001f\u007f]/;

export const isSafeCaseStudyUrl = (
  value: string,
  kind: CaseStudyUrlKind = "link",
): boolean => {
  const candidate = value.trim();
  if (!candidate || unsafeUrlCharacters.test(candidate)) return false;

  if (candidate.startsWith("#")) return kind === "link";
  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return kind === "link" || kind === "image";
  }

  try {
    const url = new URL(candidate);
    if (kind === "image") return url.protocol === "http:" || url.protocol === "https:";
    return (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      (url.protocol === "mailto:" && Boolean(url.pathname))
    );
  } catch {
    return false;
  }
};

const maskText = (value: string): string => value.replace(/[^\r\n]/g, " ");

const maskInlineCode = (line: string): string => {
  const output = line.split("");
  let index = 0;

  while (index < line.length) {
    if (line[index] !== "`") {
      index += 1;
      continue;
    }

    let runLength = 1;
    while (line[index + runLength] === "`") runLength += 1;
    const delimiter = "`".repeat(runLength);
    const closingIndex = line.indexOf(delimiter, index + runLength);

    if (closingIndex === -1) {
      index += runLength;
      continue;
    }

    for (let cursor = index; cursor < closingIndex + runLength; cursor += 1) {
      output[cursor] = " ";
    }
    index = closingIndex + runLength;
  }

  return output.join("");
};

/**
 * Removes fenced, indented, and inline code from a validation view while
 * retaining line breaks. This keeps code examples inert without weakening
 * validation for actual raw HTML, URLs, or MDX-shaped top-level statements.
 */
const maskMarkdownCode = (source: string): string => {
  const lines = source.split(/\r\n|\n|\r/);
  const output: string[] = [];
  let fence: { character: string; length: number } | undefined;

  for (const line of lines) {
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);

    if (fence) {
      output.push(maskText(line));
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.character &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = undefined;
      }
      continue;
    }

    if (fenceMatch) {
      fence = { character: fenceMatch[1][0], length: fenceMatch[1].length };
      output.push(maskText(line));
      continue;
    }

    if (/^(?: {4}|\t)/.test(line)) {
      output.push(maskText(line));
      continue;
    }

    output.push(maskInlineCode(line));
  }

  return output.join("\n");
};

type HtmlAttribute = { name: string; value?: string };

const htmlAttributesByElement: Record<string, readonly string[]> = {
  "*": ["title"],
  p: ["align"],
  div: ["align"],
  a: ["href", "target", "rel"],
  img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  source: ["src", "srcset", "media", "type", "width", "height"],
  details: ["open"],
  table: ["align"],
  th: ["align", "colspan", "rowspan"],
  td: ["align", "colspan", "rowspan"],
};

const findHtmlTagEnd = (source: string, start: number): number => {
  let quote: "'" | '"' | undefined;

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote) quote = undefined;
    } else if (character === "'" || character === '"') {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }

  return -1;
};

const parseHtmlAttributes = (input: string): HtmlAttribute[] | undefined => {
  const attributes: HtmlAttribute[] = [];
  let index = 0;

  while (index < input.length) {
    while (/\s/.test(input[index] ?? "")) index += 1;
    if (index >= input.length || input[index] === "/") break;

    const nameMatch = /^[A-Za-z_:][A-Za-z0-9:._-]*/.exec(input.slice(index));
    if (!nameMatch) return undefined;

    const name = nameMatch[0].toLowerCase();
    index += nameMatch[0].length;
    while (/\s/.test(input[index] ?? "")) index += 1;

    if (input[index] !== "=") {
      attributes.push({ name });
      continue;
    }

    index += 1;
    while (/\s/.test(input[index] ?? "")) index += 1;
    const quote = input[index] === '"' || input[index] === "'" ? input[index] : undefined;

    if (quote) {
      index += 1;
      const end = input.indexOf(quote, index);
      if (end === -1) return undefined;
      attributes.push({ name, value: input.slice(index, end) });
      index = end + 1;
      continue;
    }

    const valueMatch = /^[^\s]+/.exec(input.slice(index));
    if (!valueMatch) return undefined;
    attributes.push({ name, value: valueMatch[0].replace(/\/$/, "") });
    index += valueMatch[0].length;
  }

  return attributes;
};

const isSafeImageSet = (value: string): boolean =>
  value.split(",").every((candidate) => {
    const url = candidate.trim().split(/\s+/)[0];
    return Boolean(url) && isSafeCaseStudyUrl(url, "image");
  });

const isSafeHtmlAttribute = (
  tagName: string,
  attribute: HtmlAttribute,
): boolean => {
  const allowed = new Set([
    ...(htmlAttributesByElement["*"] ?? []),
    ...(htmlAttributesByElement[tagName] ?? []),
  ]);
  if (!allowed.has(attribute.name)) return false;
  if (attribute.name.startsWith("on") || attribute.name === "style") return false;

  const value = attribute.value ?? "";
  if (unsafeUrlCharacters.test(value)) return false;

  switch (attribute.name) {
    case "href":
      return isSafeCaseStudyUrl(value, "link");
    case "src":
      return isSafeCaseStudyUrl(value, "image");
    case "srcset":
      return isSafeImageSet(value);
    case "width":
    case "height":
      return /^\d{1,5}(?:%|px)?$/.test(value);
    case "colspan":
    case "rowspan":
      return /^[1-9]\d*$/.test(value);
    case "align":
      return /^(?:left|center|right|justify)$/i.test(value);
    case "loading":
      return /^(?:lazy|eager)$/i.test(value);
    case "target":
      return /^(?:_blank|_self|_parent|_top)$/i.test(value);
    case "open":
      return attribute.value === undefined || /^(?:open|true)$/i.test(value);
    default:
      return true;
  }
};

const getRawHtmlIssue = (
  source: string,
): string | undefined => {
  let index = 0;

  while (index < source.length) {
    if (source[index] !== "<") {
      index += 1;
      continue;
    }

    if (source.startsWith("<!--", index)) {
      const commentEnd = source.indexOf("-->", index + 4);
      if (commentEnd === -1) return "Unclosed HTML comments are not allowed.";
      index = commentEnd + 3;
      continue;
    }

    if (/^<\s*(?:https?:\/\/|mailto:)/i.test(source.slice(index))) {
      const autolinkEnd = source.indexOf(">", index + 1);
      index = autolinkEnd === -1 ? source.length : autolinkEnd + 1;
      continue;
    }

    const end = findHtmlTagEnd(source, index);
    if (end === -1) return "Malformed HTML is not allowed.";

    let cursor = index + 1;
    while (/\s/.test(source[cursor] ?? "")) cursor += 1;
    const closing = source[cursor] === "/";
    if (closing) cursor += 1;
    while (/\s/.test(source[cursor] ?? "")) cursor += 1;

    const nameMatch = /^[A-Za-z][A-Za-z0-9:-]*/.exec(source.slice(cursor, end));
    if (!nameMatch) {
      index += 1;
      continue;
    }

    const tagName = nameMatch[0].toLowerCase();
    if (!CASE_STUDY_README_HTML_ELEMENTS.includes(tagName as (typeof CASE_STUDY_README_HTML_ELEMENTS)[number])) {
      return "Only the safe README HTML subset is allowed.";
    }

    cursor += nameMatch[0].length;
    const attributeText = source.slice(cursor, end).replace(/\/\s*$/, "");
    if (closing) {
      if (attributeText.trim()) return "Closing HTML tags cannot have attributes.";
    } else {
      const attributes = parseHtmlAttributes(attributeText);
      if (!attributes) return "Malformed HTML attributes are not allowed.";
      if (attributes.some((attribute) => !isSafeHtmlAttribute(tagName, attribute))) {
        return "Unsafe HTML attributes or URLs are not allowed.";
      }
    }

    index = end + 1;
  }

  return undefined;
};

const getMarkdownUrlIssue = (source: string): string | undefined => {
  const markdownLinkPattern = /!?\[[^\]]*\]\(\s*(?:<([^>\n]+)>|([^\s)\n]+))/g;
  for (const match of source.matchAll(markdownLinkPattern)) {
    const url = match[1] ?? match[2] ?? "";
    if (!isSafeCaseStudyUrl(url, match[0].startsWith("!") ? "image" : "link")) {
      return "Unsafe Markdown links or images are not allowed.";
    }
  }

  const referencePattern = /^\s{0,3}\[[^\]]+\]:\s*(?:<([^>\n]+)>|([^\s]+))/gm;
  for (const match of source.matchAll(referencePattern)) {
    const url = match[1] ?? match[2] ?? "";
    if (!isSafeCaseStudyUrl(url, "link")) {
      return "Unsafe Markdown links or images are not allowed.";
    }
  }

  return undefined;
};

const getStatementIssue = (source: string): string | undefined => {
  for (const line of source.split("\n")) {
    if (/^\s{0,3}(?:import|export)\s+(?:default\b|type\b|[A-Za-z_$*{])/i.test(line)) {
      return "Imports and exports are not allowed.";
    }
  }
  return undefined;
};

export const getCaseStudyMdxValidationIssues = (
  value: unknown,
): CaseStudyMdxValidationIssue[] => {
  const normalized = normalizeCaseStudyMdx(value);
  if (!normalized) return [];

  const issues: CaseStudyMdxValidationIssue[] = [];

  if (getUtf8ByteLength(normalized) > CASE_STUDY_MDX_MAX_BYTES) {
    issues.push({
      code: "too_large",
      message: `Case study content must be at most ${CASE_STUDY_MDX_MAX_BYTES} UTF-8 bytes.`,
    });
  }

  const validationSource = maskMarkdownCode(normalized);
  const unsafeMessage =
    getStatementIssue(validationSource) ??
    getRawHtmlIssue(validationSource) ??
    getMarkdownUrlIssue(validationSource);

  if (unsafeMessage) {
    issues.push({ code: "unsafe_syntax", message: unsafeMessage });
  }

  return issues;
};

export const extractCaseStudyCodeText = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(extractCaseStudyCodeText).join("");
  if (value && typeof value === "object" && "props" in value) {
    const props = (value as { props?: { children?: unknown } }).props;
    return extractCaseStudyCodeText(props?.children);
  }
  return "";
};

export const removeCaseStudyRendererNewline = (value: string): string =>
  value.endsWith("\r\n")
    ? value.slice(0, -2)
    : value.endsWith("\n")
      ? value.slice(0, -1)
      : value;

export const getCaseStudyLanguageLabel = (
  className: string | undefined,
): string | undefined => {
  const match = className?.match(/(?:^|\s)language-([^\s]+)/i);
  if (!match) return undefined;

  const language = match[1].toLowerCase();
  const labels: Record<string, string> = {
    bash: "Shell",
    sh: "Shell",
    shell: "Shell",
    js: "JavaScript",
    jsx: "JSX",
    javascript: "JavaScript",
    ts: "TypeScript",
    tsx: "TSX",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    markdown: "Markdown",
    py: "Python",
    python: "Python",
  };

  return labels[language] ?? language;
};

export const caseStudyMdxSchema = z.string().trim().superRefine((value, context) => {
  for (const issue of getCaseStudyMdxValidationIssues(value)) {
    context.addIssue({ code: "custom", message: issue.message });
  }
});

export const optionalCaseStudyMdxSchema = z.preprocess(
  normalizeCaseStudyMdx,
  caseStudyMdxSchema.optional(),
);

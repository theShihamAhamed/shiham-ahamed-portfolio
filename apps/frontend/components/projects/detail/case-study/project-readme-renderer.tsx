import {
  caseStudySanitizeSchema,
  extractCaseStudyCodeText,
  isSafeCaseStudyUrl,
  removeCaseStudyRendererNewline,
} from "@portfolio/shared";
import { Link2 } from "lucide-react";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import type { ExtraProps } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { ProjectCodeBlock } from "@/components/projects/detail/case-study/project-code-block";

const sanitizeSchema = caseStudySanitizeSchema as unknown as Parameters<typeof rehypeSanitize>[0];

const getChildProp = (value: unknown, property: string): unknown => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const result = getChildProp(child, property);
      if (result !== undefined) return result;
    }
    return undefined;
  }

  if (value && typeof value === "object" && "props" in value) {
    const props = (value as { props?: Record<string, unknown> }).props;
    return props?.[property];
  }

  return undefined;
};

const getCodeClassName = (children: ReactNode): string | undefined => {
  const className = getChildProp(children, "className");
  return typeof className === "string" ? className : undefined;
};

const headingClasses: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "mt-0 border-b border-border/60 pb-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl",
  2: "mt-10 border-b border-border/60 pb-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl",
  3: "mt-8 border-b border-border/60 pb-2 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl",
  4: "mt-6 text-lg font-semibold text-foreground",
  5: "mt-5 text-base font-semibold text-foreground",
  6: "mt-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
};

const Heading = ({
  level,
  children,
  id,
  node: _node,
  ...props
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
  id?: string;
  node?: unknown;
  [key: string]: unknown;
}) => {
  void _node;
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <Tag id={id} className={`${headingClasses[level]} group scroll-mt-24`} {...props}>
      <span>{children}</span>
      {id ? (
        <a
          href={`#${id}`}
          className="ml-2 inline-flex align-middle text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          aria-label="Link to heading"
        >
          <Link2 className="size-4" aria-hidden="true" />
        </a>
      ) : null}
    </Tag>
  );
};

const isSafeImageSet = (value: string | undefined): boolean =>
  !value ||
  value.split(",").every((candidate) => {
    const url = candidate.trim().split(/\s+/)[0];
    return Boolean(url) && isSafeCaseStudyUrl(url, "image");
  });

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps;

const SmartLink = ({ href, children, node: _node, ...props }: AnchorProps) => {
  void _node;
  const safeHref = typeof href === "string" && isSafeCaseStudyUrl(href, "link") ? href : "#";
  const isInternal = safeHref.startsWith("/") || safeHref.startsWith("#");
  const isMailto = safeHref.toLowerCase().startsWith("mailto:");

  return (
    <a
      {...props}
      href={safeHref}
      target={!isInternal && !isMailto ? "_blank" : undefined}
      rel={!isInternal && !isMailto ? "noopener noreferrer" : undefined}
      className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted-foreground"
    >
      {children}
    </a>
  );
};

const components: Components = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,
  h5: (props) => <Heading level={5} {...props} />,
  h6: (props) => <Heading level={6} {...props} />,
  p: ({ children, node: _node, ...props }) => {
    void _node;
    const { align, ...paragraphProps } = props as HTMLAttributes<HTMLParagraphElement> & { align?: string };
    return <p {...paragraphProps} className={`mt-4 text-sm leading-8 text-muted-foreground sm:text-base ${align === "center" ? "text-center" : ""}`}>{children}</p>;
  },
  div: ({ children, node: _node, ...props }) => {
    void _node;
    const { align, ...divProps } = props as HTMLAttributes<HTMLDivElement> & { align?: string };
    return <div {...divProps} className={align === "center" ? "text-center" : undefined}>{children}</div>;
  },
  span: ({ children, node: _node, ...props }) => {
    void _node;
    return <span {...props}>{children}</span>;
  },
  ul: ({ children, className, node: _node, ...props }) => {
    void _node;
    return <ul {...props} className={`${className?.includes("contains-task-list") ? "list-none pl-0" : "list-disc pl-6"} mt-4 space-y-2 text-sm leading-8 text-muted-foreground sm:text-base`}>{children}</ul>;
  },
  ol: ({ children, node: _node, ...props }) => {
    void _node;
    return <ol {...props} className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-8 text-muted-foreground sm:text-base">{children}</ol>;
  },
  li: ({ children, className, node: _node, ...props }) => {
    void _node;
    return <li {...props} className={className?.includes("task-list-item") ? "flex list-none gap-2" : undefined}>{children}</li>;
  },
  blockquote: ({ children, node: _node, ...props }) => {
    void _node;
    return <blockquote {...props} className="mt-6 border-l-4 border-border bg-muted/30 px-5 py-4 text-sm leading-7 text-muted-foreground sm:text-base">{children}</blockquote>;
  },
  hr: ({ node: _node, ...props }) => {
    void _node;
    return <hr {...props} className="my-8 border-border/60" />;
  },
  a: SmartLink,
  img: ({ src, srcSet, alt, width, height, loading, title, node: _node }) => {
    void _node;
    if (typeof src !== "string" || !isSafeCaseStudyUrl(src, "image") || !isSafeImageSet(srcSet)) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- README images may be external and dimensionless.
      <img
        src={src}
        srcSet={srcSet}
        alt={alt ?? ""}
        width={width}
        height={height}
        loading={loading === "eager" ? "eager" : "lazy"}
        title={title}
        className="my-5 h-auto max-w-full rounded-lg border border-border/60 object-contain"
      />
    );
  },
  picture: ({ children, node: _node, ...props }) => {
    void _node;
    return <picture {...props}>{children}</picture>;
  },
  source: ({ src, srcSet, media, type, node: _node }) => {
    void _node;
    if ((src && !isSafeCaseStudyUrl(src, "image")) || !isSafeImageSet(srcSet)) return null;
    return <source src={src} srcSet={srcSet} media={media} type={type} />;
  },
  table: ({ children, node: _node, ...props }) => {
    void _node;
    return <div className="my-6 max-w-full overflow-x-auto rounded-xl border border-border/60"><table {...props} className="min-w-full border-collapse text-left text-sm">{children}</table></div>;
  },
  thead: ({ children, node: _node, ...props }) => {
    void _node;
    return <thead {...props} className="bg-muted/50">{children}</thead>;
  },
  tbody: ({ children, node: _node, ...props }) => {
    void _node;
    return <tbody {...props}>{children}</tbody>;
  },
  tr: ({ children, node: _node, ...props }) => {
    void _node;
    return <tr {...props} className="border-b border-border/60 last:border-b-0">{children}</tr>;
  },
  th: ({ children, node: _node, ...props }) => {
    void _node;
    return <th {...props} className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">{children}</th>;
  },
  td: ({ children, node: _node, ...props }) => {
    void _node;
    return <td {...props} className="px-4 py-3 align-top text-muted-foreground">{children}</td>;
  },
  details: ({ children, node: _node, ...props }) => {
    void _node;
    return <details {...props} className="my-6 rounded-xl border border-border/60 bg-muted/20 px-5 py-4">{children}</details>;
  },
  summary: ({ children, node: _node, ...props }) => {
    void _node;
    return <summary {...props} className="cursor-pointer font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">{children}</summary>;
  },
  pre: ({ children, node: _node, ...props }) => {
    void _node;
    const className = getCodeClassName(children);
    const code = removeCaseStudyRendererNewline(extractCaseStudyCodeText(children));
    return <ProjectCodeBlock code={code} className={className}><pre {...props} className="m-0 min-w-max p-4 font-mono text-xs leading-6 text-zinc-100 sm:text-sm">{children}</pre></ProjectCodeBlock>;
  },
  code: ({ children, className, node: _node, ...props }) => {
    void _node;
    if (className) return <code {...props} className={className}>{children}</code>;
    return <code {...props} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.92em] text-foreground">{children}</code>;
  },
  input: ({ type, checked, disabled: isDisabled, node: _node }) => {
    void _node;
    if (type !== "checkbox" || !isDisabled) return null;
    return <input type="checkbox" checked={Boolean(checked)} disabled readOnly className="mt-1 accent-foreground" aria-label={checked ? "Completed" : "Not completed"} />;
  },
  kbd: ({ children, node: _node, ...props }) => {
    void _node;
    return <kbd {...props} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</kbd>;
  },
};

export function ProjectReadmeRenderer({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, sanitizeSchema],
        rehypeSlug,
      ]}
      components={components}
      allowElement={(element) => element.tagName !== "input" || !element.position}
      urlTransform={(url) => (isSafeCaseStudyUrl(url, "link") ? url : "")}
    >
      {source}
    </ReactMarkdown>
  );
}

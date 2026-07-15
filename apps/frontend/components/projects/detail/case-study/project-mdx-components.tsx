import type { MDXComponents } from "mdx/types";

const isSafeUrl = (value: string) => {
  if ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const SmartLink = ({
  href = "",
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const safeHref = isSafeUrl(href) ? href : "#";
  const isInternal = safeHref.startsWith("/") || safeHref.startsWith("#");

  return (
    <a
      href={safeHref}
      {...props}
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
      className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-muted-foreground"
    >
      {children}
    </a>
  );
};

export const projectMdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-0 scroll-mt-24 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 scroll-mt-24 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-mt-24 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl"
      {...props}
    />
  ),
  h4: (props) => (
    <h4
      className="mt-6 scroll-mt-24 text-lg font-semibold tracking-[-0.02em] text-foreground"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-6 text-sm leading-8 text-muted-foreground sm:text-base"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-8 text-muted-foreground sm:text-base"
      {...props}
    />
  ),
  li: (props) => <li className="marker:text-muted-foreground" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 rounded-[1.25rem] border border-border/60 bg-background/70 px-5 py-4 text-sm leading-7 text-foreground shadow-sm"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border/60" />,
  a: SmartLink,
  img: ({ src, ...props }) => {
    if (typeof src !== "string" || !isSafeUrl(src)) return null;

    return (
      // eslint-disable-next-line @next/next/no-img-element -- Stored case studies allow safe external images without known dimensions.
      <img
        {...props}
        src={src}
        alt={props.alt ?? ""}
        loading="lazy"
        className="my-6 w-full rounded-[1.25rem] border border-border/60 shadow-sm"
      />
    );
  },
  table: (props) => (
    <div className="my-6 overflow-x-auto rounded-[1.25rem] border border-border/60">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-background/80" {...props} />,
  tbody: (props) => <tbody className="bg-background/50" {...props} />,
  tr: (props) => (
    <tr className="border-b border-border/60 last:border-b-0" {...props} />
  ),
  th: (props) => (
    <th className="px-4 py-3 font-semibold text-foreground" {...props} />
  ),
  td: (props) => <td className="px-4 py-3 text-muted-foreground" {...props} />,
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-[1.25rem] border border-border/60 bg-background p-4 text-sm"
      {...props}
    />
  ),
  code: ({ className, ...props }) => {
    const isInline = !className;

    if (isInline) {
      return (
        <code
          className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.92em] text-foreground"
          {...props}
        />
      );
    }

    return <code className={className} {...props} />;
  },
};

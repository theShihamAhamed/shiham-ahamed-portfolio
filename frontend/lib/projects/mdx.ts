import { compileMDX } from "next-mdx-remote/rsc";
import GithubSlugger from "github-slugger";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { projectMdxComponents } from "@/components/projects/detail/case-study/project-mdx-components";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

type ProjectMdxFrontmatter = {
  title?: string;
  description?: string;
};

const extractHeadings = (source: string): TocItem[] => {
  const lines = source.split("\n");
  const slugger = new GithubSlugger();
  const headings: TocItem[] = [];

  let insideCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }

    if (insideCodeBlock) continue;

    const match = /^(##|###)\s+(.*)$/.exec(line.trim());
    if (!match) continue;

    const hashes = match[1];
    const rawText = match[2]
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[`*_~]/g, "")
      .trim();

    const level = hashes.length as 2 | 3;
    const id = slugger.slug(rawText);

    headings.push({
      id,
      text: rawText,
      level,
    });
  }

  return headings;
};

const normalizeMdxUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    // Convert normal GitHub blob URLs to raw URLs automatically
    if (parsed.hostname === "github.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);

      // expected: /user/repo/blob/branch/path/to/file.mdx
      if (parts.length >= 5 && parts[2] === "blob") {
        const [owner, repo, , branch, ...fileParts] = parts;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileParts.join("/")}`;
      }
    }

    return url;
  } catch {
    return url;
  }
};

export const getProjectMdx = async (mdxUrl: string) => {
  try {
    const finalUrl = normalizeMdxUrl(mdxUrl);

    const response = await fetch(finalUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch MDX: ${response.status}`);
    }

    const source = await response.text();
    const toc = extractHeadings(source);

    const { content, frontmatter } = await compileMDX<ProjectMdxFrontmatter>({
      source,
      components: projectMdxComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      },
    });

    return {
      content,
      frontmatter,
      toc,
    };
  } catch (error) {
    console.error("Error loading remote MDX:", error);
    return null;
  }
};

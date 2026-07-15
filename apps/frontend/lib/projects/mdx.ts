import { compileMDX } from "next-mdx-remote/rsc";
import GithubSlugger from "github-slugger";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getCaseStudyMdxValidationIssues } from "@portfolio/shared";

import { projectMdxComponents } from "@/components/projects/detail/case-study/project-mdx-components";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
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

export const compileProjectMdx = async (source: string) => {
  const validationIssues = getCaseStudyMdxValidationIssues(source);

  if (validationIssues.length > 0) {
    console.warn("Project case study content failed the safety policy.");
    return null;
  }

  try {
    const toc = extractHeadings(source);

    const { content } = await compileMDX({
      source,
      components: projectMdxComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      },
    });

    return {
      content,
      toc,
    };
  } catch (error) {
    console.error("Error compiling stored project case study:", error);
    return null;
  }
};

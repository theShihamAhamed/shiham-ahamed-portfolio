import type { ProjectTag, TechGroups } from "@/types/project";

type Props = {
  techGroups: TechGroups;
};

const ProjectTechGroups = ({ techGroups }: Props) => {
  const groups = Object.entries(techGroups)
    .map(([title, items]) => ({ title, items }))
    .filter((group): group is { title: string; items: Array<ProjectTag | string> } =>
      Boolean(group.items?.length),
    );

  return (
    <section
      aria-labelledby="project-technologies-heading"
      className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
    >
      <h2
        id="project-technologies-heading"
        className="text-sm font-medium text-muted-foreground"
      >
        Technologies, frameworks, and tools
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {groups.map((group, index) => {
          const headingId = `project-technology-group-${index}`;

          return (
            <section
              key={group.title}
              aria-labelledby={headingId}
              className="relative rounded-xl border border-dashed border-border/60 px-4 pb-4 pt-5"
            >
              <h3
                id={headingId}
                className="absolute -top-2.5 left-3 bg-card px-2 text-xs font-semibold tracking-[-0.01em] text-foreground"
              >
                {group.title}
              </h3>

              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {group.items.map((item) => {
                  const label = typeof item === "string" ? item : item.label;

                  return (
                    <li
                      key={label}
                      className="flex max-w-full min-w-0 items-start gap-2 text-sm leading-6 text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[9px] size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
                      />
                      <span className="min-w-0 break-words">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
};

export default ProjectTechGroups;

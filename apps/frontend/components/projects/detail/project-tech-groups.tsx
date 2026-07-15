import { TechGroups } from "@/types/project";
import TechTag from "@/components/projects/shared/tech-tag";

type Props = {
  techGroups: TechGroups;
};

const ProjectTechGroups = ({ techGroups }: Props) => {
  const groups = Object.entries(techGroups)
    .map(([title, items]) => ({ title, items }))
    .filter((group): group is { title: string; items: Array<import("@/types/project").ProjectTag | string> } =>
      Boolean(group.items?.length),
    );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.07),transparent_28%)]" />

      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground">
          Technologies, frameworks, and tools
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.title}
              className="rounded-[1.5rem] border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur-sm"
            >
              <h3 className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                {group.title}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {group.items?.map((item) => (
                  <TechTag
                    key={typeof item === "string" ? item : item.label}
                    tag={typeof item === "string" ? { label: item } : item}
                    className="px-3 py-1.5"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectTechGroups;

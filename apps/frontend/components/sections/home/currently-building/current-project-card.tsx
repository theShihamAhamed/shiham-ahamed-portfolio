import { CurrentProject } from '@/types/project';;
import { cn } from "@/lib/utils";

type Props = {
  project: CurrentProject;
};

const CURRENTLY_BUILDING_STATUS_LABEL = "In progress";

const CurrentProjectCard = ({ project }: Props) => {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)] p-6 shadow-[var(--home-shadow-quiet)] backdrop-blur-xl transition-all duration-200 ease-out motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-[0_18px_48px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_18px_48px_rgba(255,255,255,0.035)]",
        "motion-reduce:hover:translate-y-0",
        "sm:p-7",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_40%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Currently building
            </p>
            <h3 className="mt-2.5 text-xl font-bold tracking-[-0.03em] text-foreground sm:text-2xl">
              {project.title}
            </h3>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {CURRENTLY_BUILDING_STATUS_LABEL}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {project.description}
        </p>

        {project.focus ? (
          <div className="mt-5 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Current focus
            </p>
            <p className="mt-1.5 text-sm leading-6 text-foreground/90">
              {project.focus}
            </p>
          </div>
        ) : null}

        {project.topics.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.topics.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80 transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {project.highlights.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {project.highlights.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2.5 text-xs font-medium leading-5 text-foreground/80"
              >
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default CurrentProjectCard;

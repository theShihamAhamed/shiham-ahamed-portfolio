import { SkillCategory } from "@/types/skills";
import { cn } from "@/lib/utils";

type Props = {
  category: SkillCategory;
};

const SkillCategoryCard = ({ category }: Props) => {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)] p-6 shadow-[var(--home-shadow-quiet)] backdrop-blur-sm",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_40px_rgba(255,255,255,0.04)]",
        "motion-reduce:hover:translate-y-0",
        "sm:p-7",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[1.05rem] font-semibold tracking-[-0.025em] text-foreground leading-snug sm:text-lg">
            {category.title}
          </h3>
          <p className="mt-1.5 max-w-[44ch] text-sm leading-6 text-muted-foreground">
            {category.description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-5 h-px w-full bg-border/50" />

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {category.items.map((item) => (
          <span
            key={item}
            className={cn(
              "inline-flex items-center rounded-lg border border-border/60",
              "bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/80",
              "transition-all duration-150",
              "hover:border-border hover:bg-accent hover:text-foreground",
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
};

export default SkillCategoryCard;

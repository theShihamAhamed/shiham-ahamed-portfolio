import { Check, type LucideIcon } from "lucide-react";

type Props = {
  title: string;
  items: string[];
  icon?: LucideIcon;
  marker?: "dot" | "check";
};

const ProjectListSection = ({
  title,
  items,
  icon: Icon,
  marker = "dot",
}: Props) => {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        ) : null}
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      </div>

      <ul className="mt-4 divide-y divide-border/40">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            {marker === "check" ? (
              <Check
                aria-hidden="true"
                className="mt-1.5 size-3.5 shrink-0 text-muted-foreground"
              />
            ) : (
              <span
                aria-hidden="true"
                className="mt-[11px] size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
              />
            )}
            <span className="text-sm leading-7 text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectListSection;

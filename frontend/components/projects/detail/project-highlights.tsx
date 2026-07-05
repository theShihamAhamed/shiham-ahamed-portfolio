import { Sparkles } from "lucide-react";

type Props = {
  items: string[];
};

const ProjectHighlights = ({ items }: Props) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.09),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_30%)]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Key highlights
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-4 text-sm leading-7 text-foreground shadow-sm backdrop-blur-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectHighlights;

type Props = {
  title: string;
  items: string[];
};

const ProjectListSection = ({ title, items }: Props) => {
  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_28%)]" />

      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-3 text-sm leading-7 text-foreground shadow-sm backdrop-blur-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectListSection;

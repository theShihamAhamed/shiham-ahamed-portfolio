const focusItems = ["APIs", "Microservices", "Scalability", "DevOps"];

const FocusCard = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5 sm:p-6 md:p-5 lg:p-6">
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-4 lg:gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current focus
          </p>
          <h3 className="mt-2.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
            Learning scalable systems, microservices, and DevOps
          </h3>
          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
            Currently focused on backend APIs, microservices concepts, scalable
            system design, and cloud-ready DevOps workflows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {focusItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-muted/45 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusCard;

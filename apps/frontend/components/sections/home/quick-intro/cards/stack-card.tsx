import {
  BentoIllustrationLayer,
  GridPattern,
  TextSafetyFade,
} from "../illustrations/bento-illustrations";

const tools = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "MongoDB",
  "Tailwind CSS",
];

const StackCard = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5 sm:p-6 md:p-5 lg:p-6">
      <BentoIllustrationLayer className="inset-3 overflow-hidden rounded-xl opacity-[0.4] group-hover/bento:opacity-[0.5] dark:opacity-[0.4] dark:group-hover/bento:opacity-[0.55]">
        <GridPattern className="text-foreground dark:text-white" />
      </BentoIllustrationLayer>
      <TextSafetyFade className="bg-linear-to-b from-background/90 via-background/72 to-background/84 dark:from-background/88 dark:via-background/74 dark:to-background/84" />

      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-4 lg:gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Core stack
          </p>
          <h3 className="mt-2.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
            Tools I use most
          </h3>
          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
            A small snapshot of the technologies I currently use while building
            projects.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {tools.map((tool) => (
            <span
              key={tool}
              className="rounded-lg border border-border bg-background/65 px-2.5 py-1.5 text-center text-[11px] font-medium leading-4 text-foreground shadow-sm lg:text-xs"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StackCard;

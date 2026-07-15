import {
  BentoIllustrationLayer,
  MiniBrowserWindow,
  StackTiles,
  TextSafetyFade,
  WorkflowProcessIllustration,
} from "../illustrations/bento-illustrations";
import WorkflowLoopArrow from "../illustrations/workflow-loop-arrow";

const approachItems = [
  "Clean UI",
  "Structured code",
  "Reusable components",
  "Problem solving",
];

const ApproachCard = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-muted/45 to-transparent" />
      <div className="pointer-events-none absolute left-[42%] top-1/2 z-0 h-72 w-72 -translate-y-1/2 rounded-full bg-foreground/[0.025] blur-3xl dark:bg-white/[0.035]" />
      <div className="pointer-events-none absolute right-[-8%] top-[54%] z-0 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-500/[0.035] blur-3xl dark:bg-cyan-300/[0.04]" />

      <BentoIllustrationLayer className="z-10 right-[-20%] top-9 w-[52%] max-w-[19rem] rotate-[-3deg] opacity-[0.52] group-hover/bento:opacity-[0.62] dark:opacity-[0.6] dark:group-hover/bento:opacity-[0.7]">
        <MiniBrowserWindow />
      </BentoIllustrationLayer>

      <BentoIllustrationLayer className="bottom-[4%] right-[-4%] w-40 opacity-[0.42] group-hover/bento:opacity-[0.52] dark:opacity-[0.34] dark:group-hover/bento:opacity-[0.44]">
        <StackTiles />
      </BentoIllustrationLayer>

      <BentoIllustrationLayer className="left-[11%] top-[22%] z-[2] hidden h-20 w-[25rem] max-w-[68%] lg:block">
        <WorkflowLoopArrow />
      </BentoIllustrationLayer>

      <BentoIllustrationLayer className="left-[7%] top-[52%] z-[2] hidden h-28 w-[30rem] max-w-[80%] -translate-y-1/2 lg:block">
        <WorkflowProcessIllustration />
      </BentoIllustrationLayer>

      <TextSafetyFade className="bg-gradient-to-r from-background from-[44%] via-background/78 via-[64%] to-transparent dark:from-background dark:from-[48%] dark:via-background/74 dark:via-[68%]" />

      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="max-w-[34rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Working style
          </p>
          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2rem]">
            Clean, structured, and practical
          </h3>
        </div>

        <div className="max-w-[35rem]">
          <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            I care about readable code, reusable components, and steady
            improvement through building, testing, reviewing, and refining real
            features.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {approachItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-background/65 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproachCard;

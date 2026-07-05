const LearningJourneyCard = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5 sm:p-6 md:p-5 lg:p-6">
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-4 lg:gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Learning mindset
          </p>

          <h3 className="mt-2.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
            Improving through real projects
          </h3>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          I use each project to strengthen how I design, build, review, and
          improve software with cleaner architecture, better user experience,
          and more reliable development workflows.
        </p>
      </div>
    </div>
  );
};

export default LearningJourneyCard;

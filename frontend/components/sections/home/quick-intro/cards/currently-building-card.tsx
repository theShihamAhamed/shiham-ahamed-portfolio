const CurrentlyBuildingCard = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5 sm:p-6 md:p-5 lg:p-6">
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-4 lg:gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Currently building
          </p>
          <h3 className="mt-2.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
            Exploring mobile app development
          </h3>
        </div>

        <div className="rounded-xl border border-border bg-muted/35 p-3.5 lg:p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            I’m currently exploring React Native and Expo to extend my
            full-stack experience into mobile development,with a focus on
            cross-platform application workflows.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrentlyBuildingCard;

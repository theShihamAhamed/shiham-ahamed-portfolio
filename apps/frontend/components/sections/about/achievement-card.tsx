import { Achievement } from '@/types/about';;

type Props = {
  item: Achievement;
};

const AchievementCard = ({ item }: Props) => {
  return (
    <article className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(255,255,255,0.03)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {item.event}
          </p>

          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {item.note}
          </p>
        </div>

        <div className="shrink-0">
          <div className="rounded-xl border border-border/60 bg-background px-4 py-3 text-center shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Result
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {item.result}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.year}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AchievementCard;

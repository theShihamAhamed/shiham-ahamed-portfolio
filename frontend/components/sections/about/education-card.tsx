import Image from "next/image";
import { Education } from "@/types/about";

type Props = {
  education: Education;
};

const EducationCard = ({ education }: Props) => {
  return (
    <div className="mt-8 rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur-xl sm:p-8">
      <div className="grid gap-6 sm:grid-cols-[120px_1px_1fr] sm:items-stretch">
        {/* Logo */}
        {education.logo && (
          <div className="flex h-full items-center justify-center sm:justify-center">
            <div className="relative h-25 w-25 ">
              <Image
                src={education.logo}
                alt={education.logoAlt || education.university}
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
          </div>
        )}

        <div className="h-px w-full bg-border/60 sm:h-full sm:w-px" />

        {/* Content */}
        <div>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl">
            {education.university}
          </h2>

          <p className="mt-2 text-sm font-medium text-foreground/90">
            {education.program}
          </p>

          {education.specialization ? (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {education.specialization}
            </p>
          ) : null}

          {education.expectedGraduation ? (
            <p className="mt-3 inline-flex rounded-full border border-border/60 bg-accent/40 px-3 py-1 text-xs font-medium text-foreground/85">
              {education.expectedGraduation}
            </p>
          ) : null}

          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
            {education.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EducationCard;

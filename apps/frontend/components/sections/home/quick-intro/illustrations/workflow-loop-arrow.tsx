import { cn } from "@/lib/utils";

type WorkflowLoopArrowProps = {
  className?: string;
};

const WorkflowLoopArrow = ({ className }: WorkflowLoopArrowProps) => {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none h-full w-full", className)}
      viewBox="0 0 460 92"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <marker
          id="workflow-loop-arrow-head"
          markerWidth="9"
          markerHeight="9"
          refX="7"
          refY="4.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M1.4 1.4 7 4.5 1.4 7.6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>

        <linearGradient
          id="workflow-loop-arrow-gradient"
          x1="460"
          x2="0"
          y1="0"
          y2="0"
        >
          <stop offset="0%" stopColor="rgb(52 211 153)" stopOpacity="0.42" />
          <stop offset="48%" stopColor="rgb(56 189 248)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="rgb(168 85 247)" stopOpacity="0.36" />
        </linearGradient>
      </defs>

      <path
        d="M414 72 C414 24 374 16 320 16 H118 C76 16 48 31 48 68"
        stroke="url(#workflow-loop-arrow-gradient)"
        strokeWidth="1.35"
        strokeDasharray="6 9"
        strokeLinecap="round"
        markerEnd="url(#workflow-loop-arrow-head)"
      />

      <circle cx="414" cy="72" r="2.2" fill="rgb(52 211 153)" opacity="0.58" />
      <circle cx="235" cy="16" r="2" fill="rgb(56 189 248)" opacity="0.52" />
    </svg>
  );
};

export default WorkflowLoopArrow;

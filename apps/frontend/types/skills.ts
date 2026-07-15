export type SkillCategory = {
  id: string;
  title: string;
  description: string;
  skills?: string[];
  items: string[];
  icon?: string;
};

export type ToolLogo = {
  id: number;
  name: string;
  logo?: string;
  src: string;
};

export type SwapSet = {
  top: LogoItem[];
  bottom: LogoItem[];
};

export type LogoItem = {
  id: string;
  name: string;
  image?: string;
  className?: string;
  tileClassName?: string;
};

export type ToolsLogoCloudProps = {
  title?: string;
  sets?: SwapSet[];
  className?: string;
  stepDelayMs?: number;
  settleDelayMs?: number;
  transitionMs?: number;
  logoScale?: number;
};

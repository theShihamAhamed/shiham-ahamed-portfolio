export type CurrentlyBuildingEntity = {
  title: string;
  description: string;
  status: string;
  currentFocus: string;
  techStack: string[];
  highlights: string[];
  link?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

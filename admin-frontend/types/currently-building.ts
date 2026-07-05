export type AdminCurrentlyBuildingItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  currentFocus: string;
  techStack: string[];
  highlights: string[];
  link?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCurrentlyBuildingInput = {
  title: string;
  description: string;
  status: string;
  currentFocus: string;
  techStack: string[];
  highlights: string[];
  link?: string;
  isVisible?: boolean;
};

export type UpdateCurrentlyBuildingInput = {
  title?: string;
  description?: string;
  status?: string;
  currentFocus?: string;
  techStack?: string[];
  highlights?: string[];
  link?: string;
};

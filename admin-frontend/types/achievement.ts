export type AdminAchievement = {
  id: string;
  title: string;
  note: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAchievementInput = {
  title: string;
  note: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
  isVisible?: boolean;
};

export type UpdateAchievementInput = {
  title?: string;
  note?: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
};

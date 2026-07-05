export type AchievementEntity = {
  title: string;
  note: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

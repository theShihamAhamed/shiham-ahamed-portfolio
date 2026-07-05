import type { AchievementDocument } from "./achievement.model";

export const serializeAdminAchievement = (achievement: AchievementDocument) => {
  const doc = achievement.toObject();

  return {
    id: doc._id.toString(),
    title: doc.title,
    note: doc.note,
    ...(doc.event ? { event: doc.event } : {}),
    ...(doc.result ? { result: doc.result } : {}),
    ...(doc.date ? { date: doc.date } : {}),
    ...(doc.year ? { year: doc.year } : {}),
    ...(doc.icon ? { icon: doc.icon } : {}),
    isVisible: doc.isVisible,
    displayOrder: doc.displayOrder,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicAchievement = (achievement: AchievementDocument) => {
  const doc = achievement.toObject();

  return {
    id: doc._id.toString(),
    title: doc.title,
    note: doc.note,
    ...(doc.event ? { event: doc.event } : {}),
    ...(doc.result ? { result: doc.result } : {}),
    ...(doc.date ? { date: doc.date } : {}),
    ...(doc.year ? { year: doc.year } : {}),
    ...(doc.icon ? { icon: doc.icon } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

import { requestApi } from "@/lib/api/client";
import type {
  AdminAchievement,
  CreateAchievementInput,
  UpdateAchievementInput,
} from "@/types/achievement";

type AchievementsResponse = {
  achievements: AdminAchievement[];
};

type AchievementResponse = {
  achievement: AdminAchievement;
};

export type AchievementFilters = {
  search?: string;
  isVisible?: boolean;
};

const toAchievementsPath = (filters: AchievementFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();

  return query ? `/api/achievements?${query}` : "/api/achievements";
};

export const getAchievements = async (
  filters: AchievementFilters = {},
): Promise<AdminAchievement[]> => {
  const response = await requestApi<AchievementsResponse>(
    toAchievementsPath(filters),
  );

  return response.data.achievements;
};

export const getAchievementById = async (
  id: string,
): Promise<AdminAchievement> => {
  const response = await requestApi<AchievementResponse>(
    `/api/achievements/${encodeURIComponent(id)}`,
  );

  return response.data.achievement;
};

export const createAchievement = async (
  input: CreateAchievementInput,
): Promise<AdminAchievement> => {
  const response = await requestApi<AchievementResponse>("/api/achievements", {
    method: "POST",
    body: input,
  });

  return response.data.achievement;
};

export const updateAchievement = async (
  id: string,
  input: UpdateAchievementInput,
): Promise<AdminAchievement> => {
  const response = await requestApi<AchievementResponse>(
    `/api/achievements/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data.achievement;
};

export const deleteAchievement = async (id: string): Promise<void> => {
  await requestApi<{ deleted: boolean; id: string }>(
    `/api/achievements/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
};

export const toggleAchievementVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<AdminAchievement> => {
  const response = await requestApi<AchievementResponse>(
    `/api/achievements/${encodeURIComponent(id)}/visibility`,
    {
      method: "PATCH",
      body: { isVisible },
    },
  );

  return response.data.achievement;
};

export const reorderAchievements = async (
  orderedIds: string[],
): Promise<AdminAchievement[]> => {
  const response = await requestApi<AchievementsResponse>(
    "/api/achievements/reorder",
    {
      method: "PATCH",
      body: { orderedIds },
    },
  );

  return response.data.achievements;
};

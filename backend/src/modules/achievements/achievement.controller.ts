import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import {
  PUBLIC_CACHE_TAGS,
  revalidatePublicCache,
} from "../../lib/revalidate-public-cache";
import {
  createAchievement,
  deleteAchievement,
  getAdminAchievementById,
  getAdminAchievements,
  getVisibleAchievements,
  reorderAchievements,
  toggleAchievementVisibility,
  updateAchievement,
} from "./achievement.service";
import {
  serializeAdminAchievement,
  serializePublicAchievement,
} from "./achievement.serializer";
import type {
  AdminAchievementQueryInput,
  CreateAchievementInput,
  UpdateAchievementInput,
} from "./achievement.validation";

const revalidateAchievementCache = (context: string) => {
  void revalidatePublicCache([PUBLIC_CACHE_TAGS.achievements], context);
};

export const listAdminAchievements = asyncHandler(async (req, res) => {
  const achievements = await getAdminAchievements(
    (res.locals.validated?.query ?? req.query) as AdminAchievementQueryInput,
  );

  return sendSuccess(
    res,
    {
      achievements: achievements.map(serializeAdminAchievement),
    },
    200,
    { meta: { count: achievements.length } },
  );
});

export const getAdminAchievement = asyncHandler(async (req, res) => {
  const achievement = await getAdminAchievementById(String(req.params.id));

  return sendSuccess(res, {
    achievement: serializeAdminAchievement(achievement),
  });
});

export const listVisibleAchievements = asyncHandler(async (_req, res) => {
  const achievements = await getVisibleAchievements();

  return sendSuccess(
    res,
    {
      achievements: achievements.map(serializePublicAchievement),
    },
    200,
    { meta: { count: achievements.length } },
  );
});

export const createAdminAchievement = asyncHandler(async (req, res) => {
  const achievement = await createAchievement(req.body as CreateAchievementInput);
  revalidateAchievementCache("achievement create");

  return sendSuccess(
    res,
    {
      achievement: serializeAdminAchievement(achievement),
    },
    201,
    { message: "Achievement created successfully" },
  );
});

export const updateAdminAchievement = asyncHandler(async (req, res) => {
  const achievement = await updateAchievement(
    String(req.params.id),
    req.body as UpdateAchievementInput,
  );
  revalidateAchievementCache("achievement update");

  return sendSuccess(
    res,
    {
      achievement: serializeAdminAchievement(achievement),
    },
    200,
    { message: "Achievement updated successfully" },
  );
});

export const deleteAdminAchievement = asyncHandler(async (req, res) => {
  await deleteAchievement(String(req.params.id));
  revalidateAchievementCache("achievement delete");

  return sendSuccess(
    res,
    {
      deleted: true,
      id: String(req.params.id),
    },
    200,
    { message: "Achievement deleted successfully" },
  );
});

export const updateAchievementVisibility = asyncHandler(async (req, res) => {
  const achievement = await toggleAchievementVisibility(
    String(req.params.id),
    Boolean(req.body.isVisible),
  );
  revalidateAchievementCache("achievement visibility update");

  return sendSuccess(
    res,
    {
      achievement: serializeAdminAchievement(achievement),
    },
    200,
    { message: "Achievement visibility updated successfully" },
  );
});

export const reorderAdminAchievements = asyncHandler(async (req, res) => {
  const achievements = await reorderAchievements(req.body.orderedIds);
  revalidateAchievementCache("achievement reorder");

  return sendSuccess(
    res,
    {
      achievements: achievements.map(serializeAdminAchievement),
    },
    200,
    {
      message: "Achievements reordered successfully",
      meta: { count: achievements.length },
    },
  );
});

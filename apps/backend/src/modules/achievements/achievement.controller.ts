import { asyncHandler } from "../../utils/async-handler";
import { getCacheInvalidationResponseOptions } from "../../utils/cache-invalidation-response";
import { sendSuccess } from "../../utils/response";
import { revalidatePublicCache } from "../../lib/revalidate-public-cache";
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

const revalidateAchievementCache = (
  action: "create" | "update" | "delete",
  context: string,
) => revalidatePublicCache({ entity: "achievement", action }, context);

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
  const cacheInvalidation = await revalidateAchievementCache("create", "achievement create");

  return sendSuccess(
    res,
    {
      achievement: serializeAdminAchievement(achievement),
    },
    201,
    getCacheInvalidationResponseOptions("Achievement created successfully", cacheInvalidation),
  );
});

export const updateAdminAchievement = asyncHandler(async (req, res) => {
  const achievement = await updateAchievement(
    String(req.params.id),
    req.body as UpdateAchievementInput,
  );
  const cacheInvalidation = await revalidateAchievementCache("update", "achievement update");

  return sendSuccess(
    res,
    {
      achievement: serializeAdminAchievement(achievement),
    },
    200,
    getCacheInvalidationResponseOptions("Achievement updated successfully", cacheInvalidation),
  );
});

export const deleteAdminAchievement = asyncHandler(async (req, res) => {
  await deleteAchievement(String(req.params.id));
  const cacheInvalidation = await revalidateAchievementCache("delete", "achievement delete");

  return sendSuccess(
    res,
    {
      deleted: true,
      id: String(req.params.id),
    },
    200,
    getCacheInvalidationResponseOptions("Achievement deleted successfully", cacheInvalidation),
  );
});

export const updateAchievementVisibility = asyncHandler(async (req, res) => {
  const achievement = await toggleAchievementVisibility(
    String(req.params.id),
    Boolean(req.body.isVisible),
  );
  const cacheInvalidation = await revalidateAchievementCache("update", "achievement visibility update");

  return sendSuccess(
    res,
    {
      achievement: serializeAdminAchievement(achievement),
    },
    200,
    getCacheInvalidationResponseOptions("Achievement visibility updated successfully", cacheInvalidation),
  );
});

export const reorderAdminAchievements = asyncHandler(async (req, res) => {
  const achievements = await reorderAchievements(req.body.orderedIds);
  const cacheInvalidation = await revalidateAchievementCache("update", "achievement reorder");

  return sendSuccess(
    res,
    {
      achievements: achievements.map(serializeAdminAchievement),
    },
    200,
    {
      ...getCacheInvalidationResponseOptions(
        "Achievements reordered successfully",
        cacheInvalidation,
        { count: achievements.length },
      ),
    },
  );
});

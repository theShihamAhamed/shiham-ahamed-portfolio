import { asyncHandler } from "../../utils/async-handler";
import { getCacheInvalidationResponseOptions } from "../../utils/cache-invalidation-response";
import { sendSuccess } from "../../utils/response";
import { revalidatePublicCache } from "../../lib/revalidate-public-cache";
import {
  createCurrentlyBuildingItem,
  deleteCurrentlyBuildingItem,
  getAdminCurrentlyBuildingItemById,
  getAdminCurrentlyBuildingItems,
  getVisibleCurrentlyBuildingItems,
  reorderCurrentlyBuildingItems,
  toggleCurrentlyBuildingItemVisibility,
  updateCurrentlyBuildingItem,
} from "./currently-building.service";
import {
  serializeAdminCurrentlyBuilding,
  serializePublicCurrentlyBuilding,
} from "./currently-building.serializer";
import type {
  AdminCurrentlyBuildingQueryInput,
  CreateCurrentlyBuildingInput,
  UpdateCurrentlyBuildingInput,
} from "./currently-building.validation";

const revalidateCurrentlyBuildingCache = (
  action: "create" | "update" | "delete",
  context: string,
) => revalidatePublicCache({ entity: "currentlyBuilding", action }, context);

export const listAdminCurrentlyBuildingItems = asyncHandler(
  async (req, res) => {
    const items = await getAdminCurrentlyBuildingItems(
      (res.locals.validated?.query ?? req.query) as AdminCurrentlyBuildingQueryInput,
    );

    return sendSuccess(
      res,
      {
        items: items.map(serializeAdminCurrentlyBuilding),
      },
      200,
      { meta: { count: items.length } },
    );
  },
);

export const getAdminCurrentlyBuildingItem = asyncHandler(async (req, res) => {
  const item = await getAdminCurrentlyBuildingItemById(String(req.params.id));

  return sendSuccess(res, {
    item: serializeAdminCurrentlyBuilding(item),
  });
});

export const listVisibleCurrentlyBuildingItems = asyncHandler(
  async (_req, res) => {
    const items = await getVisibleCurrentlyBuildingItems();

    return sendSuccess(
      res,
      {
        items: items.map(serializePublicCurrentlyBuilding),
      },
      200,
      { meta: { count: items.length } },
    );
  },
);

export const createAdminCurrentlyBuildingItem = asyncHandler(
  async (req, res) => {
    const item = await createCurrentlyBuildingItem(
      req.body as CreateCurrentlyBuildingInput,
    );
    const cacheInvalidation = await revalidateCurrentlyBuildingCache("create", "currently-building create");

    return sendSuccess(
      res,
      {
        item: serializeAdminCurrentlyBuilding(item),
      },
      201,
      getCacheInvalidationResponseOptions("Currently-building item created successfully", cacheInvalidation),
    );
  },
);

export const updateAdminCurrentlyBuildingItem = asyncHandler(
  async (req, res) => {
    const item = await updateCurrentlyBuildingItem(
      String(req.params.id),
      req.body as UpdateCurrentlyBuildingInput,
    );
    const cacheInvalidation = await revalidateCurrentlyBuildingCache("update", "currently-building update");

    return sendSuccess(
      res,
      {
        item: serializeAdminCurrentlyBuilding(item),
      },
      200,
      getCacheInvalidationResponseOptions("Currently-building item updated successfully", cacheInvalidation),
    );
  },
);

export const deleteAdminCurrentlyBuildingItem = asyncHandler(
  async (req, res) => {
    await deleteCurrentlyBuildingItem(String(req.params.id));
    const cacheInvalidation = await revalidateCurrentlyBuildingCache("delete", "currently-building delete");

    return sendSuccess(
      res,
      {
        deleted: true,
        id: String(req.params.id),
      },
      200,
      getCacheInvalidationResponseOptions("Currently-building item deleted successfully", cacheInvalidation),
    );
  },
);

export const updateCurrentlyBuildingVisibility = asyncHandler(
  async (req, res) => {
    const item = await toggleCurrentlyBuildingItemVisibility(
      String(req.params.id),
      Boolean(req.body.isVisible),
    );
    const cacheInvalidation = await revalidateCurrentlyBuildingCache("update", "currently-building visibility update");

    return sendSuccess(
      res,
      {
        item: serializeAdminCurrentlyBuilding(item),
      },
      200,
      getCacheInvalidationResponseOptions("Currently-building visibility updated successfully", cacheInvalidation),
    );
  },
);

export const reorderAdminCurrentlyBuildingItems = asyncHandler(
  async (req, res) => {
    const items = await reorderCurrentlyBuildingItems(req.body.orderedIds);
    const cacheInvalidation = await revalidateCurrentlyBuildingCache("update", "currently-building reorder");

    return sendSuccess(
      res,
      {
        items: items.map(serializeAdminCurrentlyBuilding),
      },
      200,
      {
        ...getCacheInvalidationResponseOptions(
          "Currently-building items reordered successfully",
          cacheInvalidation,
          { count: items.length },
        ),
      },
    );
  },
);

import { asyncHandler } from "../../utils/async-handler";
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
) => {
  void revalidatePublicCache({ entity: "currentlyBuilding", action }, context);
};

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
    revalidateCurrentlyBuildingCache("create", "currently-building create");

    return sendSuccess(
      res,
      {
        item: serializeAdminCurrentlyBuilding(item),
      },
      201,
      { message: "Currently-building item created successfully" },
    );
  },
);

export const updateAdminCurrentlyBuildingItem = asyncHandler(
  async (req, res) => {
    const item = await updateCurrentlyBuildingItem(
      String(req.params.id),
      req.body as UpdateCurrentlyBuildingInput,
    );
    revalidateCurrentlyBuildingCache("update", "currently-building update");

    return sendSuccess(
      res,
      {
        item: serializeAdminCurrentlyBuilding(item),
      },
      200,
      { message: "Currently-building item updated successfully" },
    );
  },
);

export const deleteAdminCurrentlyBuildingItem = asyncHandler(
  async (req, res) => {
    await deleteCurrentlyBuildingItem(String(req.params.id));
    revalidateCurrentlyBuildingCache("delete", "currently-building delete");

    return sendSuccess(
      res,
      {
        deleted: true,
        id: String(req.params.id),
      },
      200,
      { message: "Currently-building item deleted successfully" },
    );
  },
);

export const updateCurrentlyBuildingVisibility = asyncHandler(
  async (req, res) => {
    const item = await toggleCurrentlyBuildingItemVisibility(
      String(req.params.id),
      Boolean(req.body.isVisible),
    );
    revalidateCurrentlyBuildingCache("update", "currently-building visibility update");

    return sendSuccess(
      res,
      {
        item: serializeAdminCurrentlyBuilding(item),
      },
      200,
      { message: "Currently-building visibility updated successfully" },
    );
  },
);

export const reorderAdminCurrentlyBuildingItems = asyncHandler(
  async (req, res) => {
    const items = await reorderCurrentlyBuildingItems(req.body.orderedIds);
    revalidateCurrentlyBuildingCache("update", "currently-building reorder");

    return sendSuccess(
      res,
      {
        items: items.map(serializeAdminCurrentlyBuilding),
      },
      200,
      {
        message: "Currently-building items reordered successfully",
        meta: { count: items.length },
      },
    );
  },
);

import { requestApi } from "@/lib/api/client";
import type {
  AdminCurrentlyBuildingItem,
  CreateCurrentlyBuildingInput,
  UpdateCurrentlyBuildingInput,
} from "@/types/currently-building";

type CurrentlyBuildingListResponse = {
  items: AdminCurrentlyBuildingItem[];
};

type CurrentlyBuildingItemResponse = {
  item: AdminCurrentlyBuildingItem;
};

export type CurrentlyBuildingFilters = {
  search?: string;
  isVisible?: boolean;
};

const toCurrentlyBuildingPath = (filters: CurrentlyBuildingFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();

  return query
    ? `/api/currently-building?${query}`
    : "/api/currently-building";
};

export const getCurrentlyBuildingItems = async (
  filters: CurrentlyBuildingFilters = {},
): Promise<AdminCurrentlyBuildingItem[]> => {
  const response = await requestApi<CurrentlyBuildingListResponse>(
    toCurrentlyBuildingPath(filters),
  );

  return response.data.items;
};

export const getCurrentlyBuildingItemById = async (
  id: string,
): Promise<AdminCurrentlyBuildingItem> => {
  const response = await requestApi<CurrentlyBuildingItemResponse>(
    `/api/currently-building/${encodeURIComponent(id)}`,
  );

  return response.data.item;
};

export const createCurrentlyBuildingItem = async (
  input: CreateCurrentlyBuildingInput,
): Promise<AdminCurrentlyBuildingItem> => {
  const response = await requestApi<CurrentlyBuildingItemResponse>(
    "/api/currently-building",
    {
      method: "POST",
      body: input,
    },
  );

  return response.data.item;
};

export const updateCurrentlyBuildingItem = async (
  id: string,
  input: UpdateCurrentlyBuildingInput,
): Promise<AdminCurrentlyBuildingItem> => {
  const response = await requestApi<CurrentlyBuildingItemResponse>(
    `/api/currently-building/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data.item;
};

export const deleteCurrentlyBuildingItem = async (
  id: string,
): Promise<void> => {
  await requestApi<{ deleted: boolean; id: string }>(
    `/api/currently-building/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
};

export const toggleCurrentlyBuildingVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<AdminCurrentlyBuildingItem> => {
  const response = await requestApi<CurrentlyBuildingItemResponse>(
    `/api/currently-building/${encodeURIComponent(id)}/visibility`,
    {
      method: "PATCH",
      body: { isVisible },
    },
  );

  return response.data.item;
};

export const reorderCurrentlyBuildingItems = async (
  orderedIds: string[],
): Promise<AdminCurrentlyBuildingItem[]> => {
  const response = await requestApi<CurrentlyBuildingListResponse>(
    "/api/currently-building/reorder",
    {
      method: "PATCH",
      body: { orderedIds },
    },
  );

  return response.data.items;
};

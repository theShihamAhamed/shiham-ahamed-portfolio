import { CurrentlyBuildingEditPage } from "@/components/admin/currently-building/currently-building-edit-page";

export default async function EditCurrentlyBuildingPage(
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await params;

  return <CurrentlyBuildingEditPage itemId={id} />;
}

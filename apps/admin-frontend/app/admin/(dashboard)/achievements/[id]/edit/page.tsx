import { AchievementEditPage } from "@/components/admin/achievements/achievement-edit-page";

export default async function EditAchievementPage(
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await params;

  return <AchievementEditPage achievementId={id} />;
}

import { CertificationEditPage } from "@/components/admin/certifications/certification-edit-page";

export default async function EditCertificationPage(
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await params;

  return <CertificationEditPage certificationId={id} />;
}

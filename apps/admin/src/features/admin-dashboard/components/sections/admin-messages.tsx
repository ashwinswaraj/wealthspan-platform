import { SectionHeader, Card } from "@admin/features/admin-dashboard/components/sections";

export const AdminMessagesSection = () => (
  <div className="space-y-6">
    <SectionHeader title="Messages" subtitle="Internal admin & support channels." />
    <Card>
      <p className="text-sm text-on-surface-variant">No new messages.</p>
    </Card>
  </div>
);

export default AdminMessagesSection;

import AppShell from "@/components/layout/AppShell";
import DraftsList from "@/components/email/DraftsList";

const DraftsPage = () => {
  return (
    <AppShell>
      <div className="container mx-auto p-4">
        <DraftsList />
      </div>
    </AppShell>
  );
};

export default DraftsPage; 
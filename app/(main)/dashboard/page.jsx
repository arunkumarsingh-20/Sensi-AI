import { getUserOnboardingStatus } from "@/actions/user";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";
import { redirect } from "next/navigation";

const IndustryInsightsPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="min-h-screen px-4 py-10 md:px-20">
      <DashboardView insights={insights} />
    </div>
  );
};

export default IndustryInsightsPage;

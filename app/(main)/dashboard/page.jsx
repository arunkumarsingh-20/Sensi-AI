import React from 'react'
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { getIndustryInsights } from '@/actions/dashboard';
import DashboardView from './_components/dashboard-view';

const IndustryInsightsPage = async () => {
    const { isOnboarded } = await getUserOnboardingStatus();
    const insights=await getIndustryInsights();
    // If not onboarded, redirect to onboarding page
    // Skip this check if already on the onboarding page
    if (!isOnboarded) {
        redirect("/onboarding");
    }

    return (
        <div className="min-h-screen py-10 px-10 md:px-20">
            <DashboardView insights={insights} />
        </div>
    )
}

export default IndustryInsightsPage
"use client";

import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DashboardCardsSection } from "~/components/dashboard-cards-section";

type StatCardProps = {
  title: string;
  description: string;
  value: string | number;
  trend: "up" | "down";
  badgeValue: string;
  footerTitle: string;
  footerSubtitle: string;
};

export const meta = () => [{ title: "Dashboard | InkyBay" }];

export default function DashboardPage() {

  const stats: StatCardProps[] = [
    {
      title: "Tasks",
      description: "Total Tasks",
      value: "125",
      trend: "up",
      badgeValue: "+12.5%",
      footerTitle: "Pending Tasks",
      footerSubtitle: "11",
    },
    {
      title: "Clients",
      description: "Total Chats",
      value: "1,234",
      trend: "up",
      badgeValue: "20%",
      footerTitle: "Total Chats",
      footerSubtitle: "2234",
    },
    {
      title: "Marketing Funnels",
      description: "Total Marketing Funnels",
      value: "45",
      trend: "up",
      badgeValue: "+12.5%",
      footerTitle: "Active Funnels",
      footerSubtitle: "20",
    },
    {
      title: "Meetings",
      description: "Total Meetings",
      value: "43",
      trend: "up",
      badgeValue: "4.5%",
      footerTitle: "Today Meetings with clients",
      footerSubtitle: "0",
    },
  ];

  return (
    <>
      <DashboardCardsSection />
      {/* <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} /> */}
    </>
  );
};

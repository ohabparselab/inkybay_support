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

type StatCardProps = {
  title: string;
  description: string;
  value: string | number;
  trend: "up" | "down";
  badgeValue: string;
  footerTitle: string;
  footerSubtitle: string;
};

const StatCard = ({
  title,
  description,
  value,
  trend,
  badgeValue,
  footerTitle,
  footerSubtitle,
}: StatCardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs flex flex-col justify-between rounded-xl">
      <CardHeader className="grid grid-cols-[1fr_auto] gap-2 items-start border-b pb-6">
        <div>
          <CardDescription>{description}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {value}
          </CardTitle>
        </div>
        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium gap-1 text-foreground">
          <TrendIcon className="size-3" />
          {badgeValue}
        </span>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-1.5 text-sm">
        <div className="flex gap-2 font-medium">
          {footerTitle} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{footerSubtitle}</div>
      </CardFooter>
    </Card>
  );
};

export default function DashboardPage (){
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
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-4 5xl:grid-cols-4">
      {stats.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </div>
  );
};

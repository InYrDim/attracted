import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Overview — Attract",
  description: "Business performance at a glance",
};

export default function DashboardPage() {
  redirect("/dashboard/overview");
}

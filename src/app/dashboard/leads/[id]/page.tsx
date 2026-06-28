import { getLeadById, getLeadMessages } from "@/actions/leads";
import { LeadDetailClient } from "./lead-detail-client";
import { notFound } from "next/navigation";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const lead = await getLeadById(id);
  if (!lead) {
    return notFound();
  }

  const messages = await getLeadMessages(id);

  return <LeadDetailClient initialLead={lead} initialMessages={messages} />;
}

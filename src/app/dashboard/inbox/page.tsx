import { getConversations } from "@/actions/inbox";
import { InboxClient } from "./inbox-client";

export default async function InboxPage() {
  const conversations = await getConversations();

  return <InboxClient initialConversations={conversations} />;
}

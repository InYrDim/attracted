import { db } from "@/db/drizzle";
import { channel } from "@/db/schema";
import { eq } from "drizzle-orm";
import DemoClient from "../demo-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DemoPage({ params }: { params: Promise<{ formId: string }> }) {
  const resolvedParams = await params;
  const formId = resolvedParams.formId;

  const webformChannel = await db.query.channel.findFirst({
    where: eq(channel.id, formId),
  });

  if (!webformChannel || webformChannel.type !== "webform") {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold">Web Form Not Found</h1>
        <p className="text-muted-foreground">The form you are trying to test does not exist or has been deleted.</p>
        <Button asChild>
          <Link href="/dashboard/settings/channels">Go to Channels Settings</Link>
        </Button>
      </div>
    );
  }

  const config = webformChannel.config as { endpoint?: string };
  return <DemoClient endpoint={config?.endpoint || ""} formName={webformChannel.name} />;
}

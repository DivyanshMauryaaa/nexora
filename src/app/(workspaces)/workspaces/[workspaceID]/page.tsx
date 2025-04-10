// app/workspaces/[workspaceId]/page.tsx
import { createClient } from "@supabase/supabase-js";
import WorkspaceClient from "./workspaceclient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ""
);

export default async function WorkspacePage({
  params,
}: {
  params: { workspaceID: string };
}) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", params.workspaceID)
    .single();

  if (error) {
    return <div>Error fetching workspace: {error.message}</div>;
  }

  return <WorkspaceClient workspace={data} />;
}

import WorkspaceClient from './workspaceclient';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ''
);

type PageProps = {
  params: {
    workspaceID: string;
  };
};

export default async function WorkspacePage({ params }: PageProps) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', params.workspaceID)
    .single();

  return <WorkspaceClient workspace={data} error={error?.message} />;
}

import { createClient } from '@/utils/supabase/server';

export default async function Admin() {
  const supabase = await createClient();
  const { data: admin } = await supabase.from("admin").select();

  return <pre>{JSON.stringify(admin, null, 2)}</pre>
}
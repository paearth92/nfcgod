import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeCode, formatCode, isValidCode } from '@/lib/code-utils';
import { ActivationFlow } from '@/components/site/activation-flow';
import { ActivationAlreadyOwned } from '@/components/site/activation-already-owned';

export const metadata: Metadata = {
  title: 'Activate your code',
  description: 'Activate your NFCPlate code and set where it points.',
  robots: { index: false, follow: true },
};

type CodeRow = {
  id: string;
  code: string;
  status: string;
  owner_id: string | null;
  destination_url: string | null;
};

export default async function ActivatePage({ params }: { params: { code: string } }) {
  const rawCode = params.code ?? '';
  const normalized = normalizeCode(rawCode);

  if (!isValidCode(normalized)) {
    redirect('/invalid-code');
  }

  const formattedCode = formatCode(normalized);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('codes')
    .select('id, code, status, owner_id, destination_url')
    .eq('code', normalized)
    .maybeSingle();

  if (error || !data) {
    redirect('/invalid-code');
  }

  const row = data as CodeRow;

  if (row.status === 'disabled') {
    redirect('/inactive-code');
  }

  if (row.status === 'active') {
    return <ActivationAlreadyOwned codeId={row.id} ownerId={row.owner_id} />;
  }

  if (row.status !== 'unclaimed') {
    redirect('/invalid-code');
  }

  const nextPath = `/activate/${formattedCode}`;

  return (
    <ActivationFlow
      code={normalized}
      formattedCode={formattedCode}
      nextPath={nextPath}
      currentDestination={row.destination_url}
    />
  );
}

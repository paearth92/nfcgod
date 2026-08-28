'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function openAccount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (active) router.replace(user ? '/dashboard' : '/auth/sign-in');
    }

    void openAccount();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Opening your account…
      </div>
    </main>
  );
}

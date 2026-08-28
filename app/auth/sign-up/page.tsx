import { SignUpForm } from '@/components/site/auth-forms';
import { AuthRedirect } from '@/components/site/auth-redirect';

export const metadata = {
  title: 'Create your account · NFCPlate',
  robots: { index: false, follow: false },
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return (
    <>
      <AuthRedirect next={searchParams?.next} />
      <SignUpForm next={searchParams?.next} />
    </>
  );
}

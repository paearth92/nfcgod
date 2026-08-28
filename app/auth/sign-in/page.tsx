import { PortalSignInForm } from '@/components/site/portal-sign-in-form';

export const metadata = {
  title: 'Sign in · NFCPlate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage({
  searchParams,
}: {
  searchParams?: {
    next?: string;
  };
}) {
  return (
    <PortalSignInForm
      portal="customer"
      next={searchParams?.next}
    />
  );
}
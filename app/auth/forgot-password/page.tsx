import { ForgotPasswordForm } from '@/components/site/auth-forms';
import { AuthRedirect } from '@/components/site/auth-redirect';

export const metadata = {
  title: 'Reset your password · NFCPlate',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthRedirect />
      <ForgotPasswordForm />
    </>
  );
}

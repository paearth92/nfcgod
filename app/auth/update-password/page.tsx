import { UpdatePasswordForm } from '@/components/site/auth-forms';

export const metadata = {
  title: 'Set a new password · NFCPlate',
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}

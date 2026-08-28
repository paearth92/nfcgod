import type { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/site/page-header';
import { pageMetadata, breadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with the NFCPlate team for product questions, setup help, or order support.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact Us', path: '/contact' },
        ])}
      />
      <PageHeader
        eyebrow="Help"
        title="Contact us"
        description="Questions about a product, setup, or an order? We are happy to help."
      />
      <div className="container-np py-12">
        <div className="mx-auto max-w-xl">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-foreground">Email</h2>
              <p className="mt-1 text-sm text-muted-foreground">support@nfcplate.com</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle className="h-4 w-4" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-foreground">Response time</h2>
              <p className="mt-1 text-sm text-muted-foreground">Within 1 business day</p>
            </div>
          </div>

          <form className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6" action="/contact" method="post">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
            <button type="submit" className="btn-primary-np w-full sm:w-auto">
              Send message
            </button>
            <p className="text-xs text-muted-foreground">
              This form is a foundation. Inbound email handling arrives in a later phase.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

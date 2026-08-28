import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export function ConstructionNotice({
  title,
  message,
  links,
}: {
  title: string;
  message: string;
  links?: { label: string; href: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Compass className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href="/shop" className="btn-primary-np inline-flex">
          Shop products <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link href="/how-it-works" className="btn-secondary-np inline-flex">
          How it works
        </Link>
      </div>
      {links && links.length > 0 ? (
        <ul className="mt-6 space-y-1.5 border-t border-border pt-4 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-primary hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

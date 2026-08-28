import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-xs text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1.5">
              {item.path && !isLast ? (
                <Link href={item.path} className="hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded">
                  {item.name}
                </Link>
              ) : (
                <span className={cn(isLast && 'font-medium text-foreground')}>{item.name}</span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

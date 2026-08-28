import { cn } from '@/lib/utils';
import type { ElementType, ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  as?: ElementType;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading
        className={cn(
          'mt-2 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.15]',
          align === 'center' && 'mx-auto'
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

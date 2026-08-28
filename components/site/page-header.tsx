import { cn } from '@/lib/utils';
import { SectionHeading } from './section-heading';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, className, children }: PageHeaderProps) {
  return (
    <section className={cn('border-b border-border bg-gradient-to-b from-accent/40 to-background', className)}>
      <div className="container-np py-10 md:py-14">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          className="max-w-3xl"
        />
        {children}
      </div>
    </section>
  );
}

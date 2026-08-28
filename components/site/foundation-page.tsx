import { PageHeader } from './page-header';
import { ConstructionNotice } from './construction-notice';

interface FoundationPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

/**
 * Foundation page template — a polished, connected placeholder for routes
 * whose dedicated templates belong to later phases. Clearly organized for
 * replacement.
 */
export function FoundationPage({ eyebrow, title, description, children }: FoundationPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="container-np py-12">
        <div className="mx-auto max-w-2xl">
          {children ?? (
            <ConstructionNotice
              title={`${title} is coming in a later phase`}
              message="This page is a connected foundation so navigation never leads to a broken page. Its full template will be built in a later phase."
            />
          )}
        </div>
      </div>
    </>
  );
}

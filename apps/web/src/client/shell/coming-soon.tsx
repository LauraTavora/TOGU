import { EmptyState } from "@togu/design-system";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
      <EmptyState title="Em construção" description={description} />
    </div>
  );
}

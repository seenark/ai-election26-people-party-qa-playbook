import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Markdown, Runtime } from '@repo/surreal'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Effect } from 'effect'

export const Route = createFileRoute('/canonical/$canonicalId')({
  loader: async ({ params }) => {
    const markdown= await Runtime.runPromise(
      Effect.gen(function* () {
        const markdownRepo = yield* Markdown.Repository.MarkdownRepository
        
        const markdown = yield* markdownRepo.getById(params.canonicalId)
        return markdown
      })
    )

    return {
      markdown: {
        ...markdown,
        id: String(markdown.id),
        canonicalId: String(markdown.canonicalId),
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
    const { markdown } = Route.useLoaderData()
    const content = markdown.md

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/canonical"
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          ← Back to Canonical List
        </Link>
      </div>

      {/* Header Section */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {markdown.topic}
        </h1>

        <p className="text-sm text-muted-foreground">
          Canonical ID: <span className="font-mono">{markdown.canonicalId}</span>
        </p>
      </header>

      {/* Markdown Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <MarkdownRenderer content={markdown.md} />
      </article>
    </div>
  );
}

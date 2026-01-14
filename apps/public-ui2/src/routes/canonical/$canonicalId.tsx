import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Markdown, Runtime } from '@repo/surreal'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Effect } from 'effect'
import { createServerFn } from '@tanstack/react-start'
import { NotFound } from '@/components/NotFound'

const getMarkdownById = createServerFn({ method: "GET" }).inputValidator((data: { id: string }) => data).handler(async ({ data }) => {
    const markdown = await Runtime.runPromise(
        Effect.gen(function* () {
            const markdownRepo = yield* Markdown.MarkdownRepository

            const markdown = yield* markdownRepo.getById(data.id)
            return markdown
        })
    )

    if (!markdown) {
        return null
    }

    return {
        ...markdown,
        id: String(markdown.id),
        canonicalQAID: String(markdown.canonicalQAID),
    }
},
)

export const Route = createFileRoute('/canonical/$canonicalId')({
    loader: async ({ params }) => {
        const markdown = await getMarkdownById({ data: { id: params.canonicalId } })

        return { markdown }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { markdown } = Route.useLoaderData()

    if (!markdown) {
        return <NotFound />

    }

    return (
        <div className='w-full bg-white'>
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                    >
                        ← กลับไปยังหน้ารายการหลัก
                    </Link>
                </div>

                {/* Header Section */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {markdown.card.title}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Canonical ID: <span className="font-mono">{markdown.canonicalQAID}</span>
                    </p>
                </header>

                {/* Markdown Content */}
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                    <MarkdownRenderer content={markdown.markdown} />
                </article>
            </div>
        </div>
    );
}

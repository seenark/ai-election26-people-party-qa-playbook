import { createFileRoute } from '@tanstack/react-router'
import { Markdown, Runtime } from "@repo/surreal"
import { Effect } from 'effect';
import { PolicyCard } from '@/components/PolicyCard';
import { createServerFn } from '@tanstack/react-start'

const getAllMarkdowns = createServerFn().handler(async() => {
    const markdowns = await Runtime.runPromise(
            Effect.gen(function* () {
                const markdownRepo = yield* Markdown.MarkdownRepository
                const markdowns = yield* markdownRepo.getAll
                return markdowns
            })
        )

        console.log("markdowns", markdowns)

        const normalized = markdowns.map((row) => ({
            ...row,
            id: String(row.id),
            canonicalQAID: String(row.canonicalQAID),
        }))
        
        return normalized
})

export const Route = createFileRoute('/canonical/')({
    loader: async () => {
        const data = await getAllMarkdowns()
        return { data }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data } = Route.useLoaderData()

    return (
    <div className='min-h-screen bg-gradient-to-br from-[#1B2A3F] via-[#1a2637] to-[#162033]'>
      {/* Decorative gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FF6713]/5 pointer-events-none' />
      
      <div className='relative flex justify-center p-8 text-white'>
        <div className='w-full max-w-7xl'>

          {/* Page Header with enhanced styling */}
          <div className='mb-12'>
            <div className='inline-block mb-4'>
              <span className='px-4 py-1.5 rounded-full text-sm font-medium bg-[#FF6713]/10 text-[#FF6713] border border-[#FF6713]/20'>
                Policy 
              </span>
            </div>
            <h1 className='text-5xl font-bold mb-3 text-white bg-clip-text'>
              Canonical Policies
            </h1>
            <p className='text-lg text-slate-300 max-w-2xl'>
              Browse all policy topics from our website
            </p>
            
            {/* Stats bar */}
            <div className='flex items-center gap-6 mt-6 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-[#FF6713]' />
                <span className='text-slate-400'>{data.length} Policies</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-emerald-400' />
                <span className='text-slate-400'>Verified Content</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data.map((d) => (
              <a 
                key={d.id}
                href={`/canonical/${d.id}`}
                className='group block transition-all duration-300 hover:-translate-y-2'
              >
                <PolicyCard md={d} />
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

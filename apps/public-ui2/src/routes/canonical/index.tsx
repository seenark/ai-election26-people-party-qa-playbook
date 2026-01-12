import { createFileRoute, Link } from '@tanstack/react-router'
import { Markdown, Runtime } from "@repo/surreal"
import { Effect } from 'effect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/canonical/')({
    loader: async () => {
        const markdowns = await Runtime.runPromise(
            Effect.gen(function* () {
                const markdownRepo = yield* Markdown.Repository.MarkdownRepository
                const markdowns = yield* markdownRepo.getAll

                return markdowns
            })
        )
        const normalized = markdowns.map((row) => ({
            ...row,
            id: String(row.id),
            canonicalId: String(row.canonicalId),
        }))
        return {
            normalized,
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { normalized } = Route.useLoaderData()
    return (
    <div className='flex justify-center min-h-screen bg-gradient-to-br from-[#1B2A3F] via-[#1a2637] to-[#162033] p-8 text-white'>
      <div className='w-full max-w-7xl'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2 text-white'>Canonical Policies</h1>
          <p className='text-slate-300'>Browse all policy topics and positions</p>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {normalized.map((d) => (
            <a 
              key={d.id}
              href={`/canonical/${d.id}`}
              className='group block transition-transform duration-300 hover:-translate-y-2'
            >
              <Card className='h-full bg-gradient-to-br from-[#243548]/95 to-[#1B2A3F]/95 border-slate-600/40 backdrop-blur-sm hover:border-slate-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#1B2A3F]/80'>
                <CardHeader>
                  <div className='flex items-start justify-between mb-2'>
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30'>
                      {d.topic}
                    </span>
                    {/* {d.confidenceScore && (
                      <span className='text-xs text-slate-400 font-mono'>
                        {d.confidenceScore}%
                      </span>
                    )} */}
                  </div>
                  
                  <CardTitle className='text-xl text-white group-hover:text-orange-400 transition-colors duration-300 line-clamp-2'>
                    {d.topic}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className='flex items-center justify-between text-sm text-slate-400'>
                    <span>View details</span>
                    <svg 
                      className='w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300' 
                      fill='none' 
                      viewBox='0 0 24 24' 
                      stroke='currentColor'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

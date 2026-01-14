import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Markdown } from "@repo/surreal"

type MarkdownType =  Markdown.Markdown

export function PolicyCard({md}: {md: MarkdownType}) {
    return (
                        <Card className='h-full flex flex-col bg-gradient-to-br from-[#243548]/95 to-[#1B2A3F]/95 border-slate-600/40 backdrop-blur-sm hover:border-[#FF6713]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6713]/20 relative overflow-hidden'>
                          
                          <div className='absolute inset-0 bg-gradient-to-br from-[#FF6713]/0 to-[#FF6713]/0 group-hover:from-[#FF6713]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none' />
        
        
                          <CardHeader className='relative z-10'>
                            {/* Title */}
                            <CardTitle className='text-2xl text-white group-hover:text-[#FF6713] transition-colors duration-300 line-clamp-2 pr-16'>
                              {md.card.title}
                            </CardTitle>
        
                            {/* Short Description */}
                            <CardDescription className='text-slate-400 leading-relaxed line-clamp-3 mt-2'>
                              {md.card.shortDescription}
                            </CardDescription>
                          </CardHeader>
        
                          <CardContent className='mt-auto relative z-10'>
                            {/* Tags */}
                            {md.card.tags && md.card.tags.length > 0 && (
                              <div className='flex flex-wrap gap-2 mb-4'>
                                {md.card.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className='px-2.5 py-1 rounded-md text-xs font-medium bg-[#FF6713]/10 text-[#FF6713] border border-[#FF6713]/20 hover:bg-[#FF6713]/20 transition-colors'
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
        
                            <div className='flex items-center justify-between pt-4 border-t border-slate-700/50'>
                              <span className='text-sm font-medium text-slate-300 group-hover:text-[#FF6713] transition-colors'>
              ดูรายละเอียด
                              </span>
                              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 group-hover:bg-[#FF6713]/20 transition-all'>
                                <svg 
                                  className='w-4 h-4 text-slate-400 group-hover:text-[#FF6713] transform group-hover:translate-x-0.5 transition-all duration-300' 
                                  fill='none' 
                                  viewBox='0 0 24 24' 
                                  stroke='currentColor'
                                >
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                </svg>
                              </div>
                            </div>
                          </CardContent>
        
                        </Card>
    )
}
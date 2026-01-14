import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
// import remarkAlert from "remark-github-blockquote-alert"
// import { TypographyH1, TypographyP } from "@/components/ui/typography";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-6 leading-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-5 pb-2 border-b border-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">{children}</h3>
          ),

          p: ({ children }) => (
            <p className="text-base text-gray-700 leading-relaxed mb-5">{children}</p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),

          ul: ({ children }) => <ul className="space-y-2 mb-6 ml-6">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-2 mb-6 ml-6 list-decimal">{children}</ol>,
          li: ({ children }) => (
            <li className="text-gray-700 leading-relaxed pl-2">
              <span className="inline-flex items-start">
                <span className="mr-2 text-gray-400 select-none">•</span>
                <span className="flex-1">{children}</span>
              </span>
            </li>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          hr: () => <hr className="my-8 border-t border-gray-200" />,

          code: ({ children }) => (
            <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-orange-400 pl-4 py-2 my-6 italic text-gray-800">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

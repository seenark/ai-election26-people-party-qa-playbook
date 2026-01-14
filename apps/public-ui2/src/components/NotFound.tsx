import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Decorative elements */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-[#FF6713]/10 rounded-full blur-3xl" />
          </div>
          
          {/* 404 Text */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6713] to-orange-400 mb-2">
              404
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[#FF6713] to-transparent rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-3">
          <h2 className="text-3xl font-bold text-white">
            Policy Not Found
          </h2>
          <p className="text-lg text-slate-300 max-w-md mx-auto">
            The canonical policy you're looking for doesn't exist or may have been removed.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-6 mb-10 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-slate-400">Resource Unavailable</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF6713] text-white font-medium transition-all duration-300 hover:bg-[#FF6713]/90 hover:shadow-lg hover:shadow-[#FF6713]/20"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Policies
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-700/50 text-white font-medium border border-slate-600/50 transition-all duration-300 hover:bg-slate-700 hover:border-slate-500"
          >
            Go Back
          </button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-slate-500">
          If you believe this is an error, please contact support or try refreshing the page.
        </p>
      </div>
    </div>
  )
}
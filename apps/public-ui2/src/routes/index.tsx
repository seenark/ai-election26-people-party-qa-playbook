import { Markdown, Runtime } from "@repo/surreal"
import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { Effect } from "effect"

import { PolicyCard } from "@/components/PolicyCard"

const getAllMarkdowns = createServerFn().handler(async () => {
  const markdowns = await Runtime.runPromise(
    Effect.gen(function* () {
      const markdownRepo = yield* Markdown.MarkdownRepository
      const markdowns = yield* markdownRepo.getAll
      return markdowns
    }),
  )

  const normalized = markdowns.map((row) => ({
    ...row,
    id: String(row.id),
    canonicalQAID: String(row.canonicalQAID),
  }))

  return normalized
})

export const Route = createFileRoute("/")({
  loader: async () => {
    const data = await getAllMarkdowns()
    return { data }
  },
  component: App,
})

function App() {
  const { data } = Route.useLoaderData()

  return (
    <div>
      <div className="absolute inset-0 pointer-events-none" />
      {/* <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#FF6713]/5 pointer-events-none" /> */}

      <div className="relative flex justify-center p-8 text-white">
        <div className="w-full max-w-7xl">
          {/* Page Header with enhanced styling */}
          <div className="mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                เว็บไซต์ไม่เป็นทางการ
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-3 text-white bg-clip-text">ประเด็นที่ถูกถาม</h1>
            <p className="text-lg text-slate-300 max-w-2xl">ดูประเด็นที่ถูกตั้งคำถามทั้งหมดได้ที่นี่</p>

            {/* Unofficial disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 max-w-2xl">
              <p className="text-sm text-slate-400">
                <span className="font-medium text-slate-300">หมายเหตุ:</span>{" "}
                เว็บไซต์นี้ไม่ได้เป็นทางการจากพรรคประชาชน จัดทำขึ้นโดยอิสระเพื่อรวบรวมข้อมูลและประเด็นต่างๆ
                ให้กับประชาชน
              </p>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF6713]" />
                <span className="text-slate-400">{data.length} ประเด็น</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((d) => (
              <a
                key={d.id}
                href={`/canonical/${d.id}`}
                className="group block transition-all duration-300 hover:-translate-y-2"
              >
                <PolicyCard md={d} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

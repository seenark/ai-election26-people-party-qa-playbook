import { Link } from "@tanstack/react-router"

export default function Header() {
  return (
    <>
      <header className="p-4 flex items-center bg-[#FF6713]/90  shadow-lg">
        <h1 className="ml-4 text-2xl md:text-3xl font-bold text-[#212937]">
          <Link to="/" className="flex gap-2 items-center">
            <img src="/logo.ico" alt="Logo" className="h-10 md:h-12" />
            Voice to Voters (The Unofficial People’s Guide)
          </Link>
        </h1>
      </header>
    </>
  )
}

import {Link} from "react-router-dom"

function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
      <h1 className="text-xl font-bold text-blue-600">OrthoTrack</h1>
      <nav className="flex justify-between gap-5">
        <Link to="/login">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
            Log in
          </button>
        </Link>
        <Link to="/signup">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
            Sign up
          </button>
        </Link>
      </nav>
    </header>
  )
}

export default Header
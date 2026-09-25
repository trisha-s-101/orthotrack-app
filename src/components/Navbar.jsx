import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    navigate("/")
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-teal-700 text-white shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        OrthoTrack
      </Link>
      <div className="flex gap-1">
        <Link to="/" className="hover:bg-teal-600 px-4 py-2 rounded-lg transition">
          Home
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className="hover:bg-teal-600 px-4 py-2 rounded-lg transition">
              Dashboard
            </Link>
            <Link to="/settings" className="hover:bg-teal-600 px-4 py-2 rounded-lg transition">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="hover:bg-teal-600 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:bg-teal-600 px-4 py-2 rounded-lg transition">
              Sign In
            </Link>
            <Link to="/signup" className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition font-medium">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
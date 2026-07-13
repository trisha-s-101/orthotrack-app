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
    <nav className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white shadow-lg">
      <Link to="/" className="text-2xl font-bold">
        OrthoTrack
      </Link>
      <div className="flex gap-4">
        <Link to="/" className="hover:bg-blue-700 px-4 py-2 rounded">
          Home
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className="hover:bg-blue-700 px-4 py-2 rounded">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:bg-blue-700 px-4 py-2 rounded">
              Login
            </Link>
            <Link to="/signup" className="hover:bg-blue-700 px-4 py-2 rounded">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
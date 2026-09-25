import {useState} from "react"
import { supabase } from "../supabaseClient"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

const Login = ({setUser}) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError("")

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
    } else {
      setUser(data.user)
      setEmail("")
      setPassword("")
      navigate("/dashboard")
    }
  }

    return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <form onSubmit={handleLogin} className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 flex flex-col gap-5">
              <div className="text-center mb-2">
                <h1 className="text-3xl font-bold">Sign In</h1>
                <p className="text-gray-500 mt-1 text-sm">Welcome back to OrthoTrack</p>
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input text-base" type="text" id="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input className="form-input text-base" type="password" id="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <button type="submit" className="primary-button py-3.5 text-base font-semibold mt-1">Sign In</button>
              <p className="text-sm text-center text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-teal-600 hover:underline font-medium">Sign up</Link>
              </p>
          </form>
      </div>
    </>)
}

export default Login; 
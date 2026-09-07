import { useState} from "react";
import { supabase } from "../supabaseClient"
import { Link, useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar"

const Signup = ({setUser}) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [acknowledged, setAcknowledged] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

  async function handleSignUp(e) {
    e.preventDefault()
    setError("")

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
    } else {
      setUser(data.user);
      setEmail("")
      setPassword("")
      navigate("/dashboard")
    }
  }

    return (
    <>
      <div className="min-h-screen flex gap-8 items-center justify-center bg-gray-50 ">
          <form onSubmit={handleSignUp} className = "w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
              <h1 className="text-2xl text-center mb-5"> Sign Up</h1>
              <label className="form-label" htmlFor="email"> Email </label>
              <input className="form-input" type="text" id="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <label htmlFor="password" className="form-label"> Password </label>
              <input className="form-input" type="password" id="password" placeholder="*" value = {password} onChange={(e)=>setPassword(e.target.value)}/>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 text-sm text-gray-600">
                <p className="font-semibold mb-1">Before you continue</p>
                <p>OrthoTrack measures changes in your personal range of motion over time. It does not diagnose injuries, predict recovery timelines, or replace guidance from your physician or physical therapist.</p>
              </div>

              <label className="flex items-start gap-3 mt-4 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                I understand OrthoTrack is not a medical device and does not replace professional medical advice.
              </label>

              {error && (
                <p className="text-red-600 text-sm mt-3">{error}</p>
              )}
              <button type="submit" disabled={!acknowledged} className="primary-button mt-4 disabled:opacity-50 disabled:cursor-not-allowed"> Create Account </button>
          </form>
      </div>
    </>)
}

export default Signup;
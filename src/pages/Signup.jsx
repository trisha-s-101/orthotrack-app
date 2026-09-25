import { useState} from "react";
import { supabase } from "../supabaseClient"
import { Link, useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar"

const Signup = ({setUser}) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [acknowledged, setAcknowledged] = useState(false)
    const [error, setError] = useState("")
    const [submitted, setSubmitted] = useState(false)

  async function handleSignUp(e) {
    e.preventDefault()
    setError("")

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
    } else if (data.user?.identities?.length === 0) {
      setError("An account with this email already exists. Try signing in instead.")
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We sent a confirmation link to <span className="font-medium">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="text-teal-600 hover:underline text-sm">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

    return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <form onSubmit={handleSignUp} className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 flex flex-col gap-5">
              <div className="text-center mb-2">
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-gray-500 mt-1 text-sm">Start tracking your orthopedic recovery</p>
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input text-base" type="text" id="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input className="form-input text-base" type="password" id="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
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
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <button type="submit" disabled={!acknowledged} className="primary-button py-3.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Create Account</button>
              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-teal-600 hover:underline font-medium">Sign in</Link>
              </p>
          </form>
      </div>
    </>)
}

export default Signup;
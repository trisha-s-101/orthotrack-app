import {useState} from "react"
import { supabase } from "../supabaseClient"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

const Login = ({setUser}) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log("Login error:", error.message)
    } else {
      console.log("Login success:", data)
      setUser(data.user)
      setEmail("")
      setPassword("")
      navigate("/dashboard")
    }
  }

    return (
    <>
      <div className="min-h-screen flex gap-8 items-center justify-center bg-gray-50 ">
          <form onSubmit={handleLogin} className = "w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
              <h1 className="text-2xl text-center mb-5"> Login</h1>
              <label className="form-label" htmlFor="email"> Email </label>
              <input className="form-input" type="text" id="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <label htmlFor="password" className="form-label"> Password </label>
              <input className="form-input" type="password" id="password" placeholder="*" value = {password} onChange={(e)=>setPassword(e.target.value)}/>
              <button type="submit" className="primary-button" > Submit </button>
          </form>
      </div>
    </>)
}

export default Login; 
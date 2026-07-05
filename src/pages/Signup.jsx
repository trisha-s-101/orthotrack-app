import { useState} from "react";
import { supabase } from "../supabaseClient"
import { Link, useNavigate} from "react-router-dom";

const Signup = ({setUser}) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

  async function handleSignUp(e) {
    e.preventDefault()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.log("Signup error:", error.message)
    } else {
      console.log("Signup success:", data);
      setUser(data.user);
      setEmail("")
      setPassword("")
      navigate("/dashboard")
    }
  }

    return (
    <>
     <nav>
            <Link to="/">
              <button className=" mt-5 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"> Home </button>
            </Link>
    </nav>
        <div className="min-h-screen flex gap-8 items-center justify-center bg-gray-50 ">
            <form onSubmit={handleSignUp} className = "w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
                <h1 className="text-2xl text-center mb-5"> Sign Up</h1>
                <label className="form-label" htmlFor="email"> Email </label>
                <input className="form-input" type="text" id="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
                <label htmlFor="password" className="form-label"> Password </label>
                <input className="form-input" type="password" id="password" placeholder="*" value = {password} onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit" className="primary-button" > Submit </button>
            </form>
        </div>
    </>)
}

export default Signup;
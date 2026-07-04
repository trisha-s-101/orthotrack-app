import { useState} from "react";
import { supabase } from "../supabaseClient"
import { Link, useNavigate} from "react-router-dom";

const Signup = ({setUser}) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate

    const onSubmit = (e) => {
        e.preventDefault();
        console.log("Email is: ", email);
        console.log("Password is: ", password);
        setEmail("")
        setPassword("")
    }

  async function handleSignUp(e) {
    e.preventDefault()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.log("Signup error:", error.message)
    } else {
      console.log("Signup success:", data)
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
                <label className="" htmlFor="email"> Email </label>
                <input className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" id="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
                <label htmlFor="password"> Password </label>
                <input className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="password" placeholder="*" value = {password} onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit" className="mt-10 border border-b-teal-800 rounded-full bg-blue-500" > Submit </button>
            </form>
        </div>
    </>)
}

export default Signup;
import {useState} from "react"

const Login = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const onSubmit = (e) => {
        e.preventDefault();
        console.log("Username is: ", username);
        console.log("Password is: ", password);
        setUsername("")
        setPassword("")
    }

    return (
    <>
        <div className="min-h-screen flex gap-8 items-center justify-center bg-gray-50 ">
            <form onSubmit={onSubmit} className = "w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
                <h1 className="text-2xl text-center mb-5"> Login</h1>
                <label className="" htmlFor="username"> Username </label>
                <input className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" id="username" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
                <label htmlFor="password"> Password </label>
                <input className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="password" placeholder="Password" value = {password} onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit" className="mt-10 border border-b-teal-800 rounded-full bg-blue-500" > Submit </button>
            </form>
        </div>
    </>)
}

export default Login; 
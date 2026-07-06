import { Link } from "react-router-dom";
import { useState, useEffect} from "react";
import { supabase } from "../supabaseClient";

const Dashboard = ({user}) => {

    const today = new Date().toISOString().split('T')[0];

    const [name, setName] = useState("")
    const [date, setDate] = useState(today)
    const [bodyPart, setBodyPart] = useState("")
    const [description, setDescription] = useState("")
    const [injuriesList, setInjuriesList] = useState([])

    async function addInjury(e) {
        e.preventDefault();

        const { data, error } = await supabase
        .from('injuries')
        .insert([
            {
            name: name,
            injury_date: date,
            body_part: bodyPart,
            description: description,
            user_id: user.id  
            }
        ])
        .select()

        if (error) {
        console.log("Error:", error.message)
        } 
        else {
        console.log("Success:", data)
        }
    }

    useEffect(() => {

        async function getInjury() {
            const {data, error} = await supabase
            .from("injuries") //table name
            .select("*")
            .eq("user_id", user.id) //where user.id equals the user id

            if(error){
                console.log(error.message)
            }
            else{
                setInjuriesList(data)
            }
        }

        getInjury()
    },[user.id])

    return (
        <>
            <div className="max-h-1/2 bg-gray-50 px-6 py-8"> 
                <nav className="mb-8">
                    <Link to="/">
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"> Home </button>
                    </Link>
                </nav>
                <div className="mx-50">
                    <h1> Dashboard </h1>
                    <h1> Welcome {user?.email}</h1>
                    <form onSubmit={addInjury} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-5">
                        <label htmlFor="name" className="form-label"> Name </label>
                        <input type="text" id="name" placeholder="Name" className="form-input" value={name} onChange={e=>setName(e.target.value)}></input>
                        <label htmlFor="injury_date" className="form-label"> Injury Date </label>
                        <input type="date" id="injury_date" className="form-input" value={date} onChange={e=>setDate(e.target.value)}></input>
                        <label htmlFor="body_part" className="form-label"> Body Part</label>
                        <input type="text" id="body_part" placeholder="Body Part" value={bodyPart} className="form-input" onChange={e=>setBodyPart(e.target.value)}></input>
                        <label htmlFor="description" className="form-label"> Description </label>
                        <input type="text" id="description" placeholder="Description" value={description} className="form-input" onChange={e=>setDescription(e.target.value)}></input>
                        <button type="submit" className="primary-button"> Submit </button>
                    </form>
                    <div id="injuryList"> 
                        {injuriesList.map((injury) => (
                            <div key={injury.user_id}> 
                                <h2>{injury.name}</h2>
                                <h3>{injury.injury_date}</h3>
                                <h3>{injury.body_part}</h3>
                                <h3>{injury.description}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>)
}

export default Dashboard;
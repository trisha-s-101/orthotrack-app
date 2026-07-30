import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";

const Dashboard = ({ user }) => {
    console.log("HERE");

    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];

    const [name, setName] = useState("");
    const [date, setDate] = useState(today);
    const [bodyPart, setBodyPart] = useState("");
    const [description, setDescription] = useState("");
    const [injuriesList, setInjuriesList] = useState([]);

    async function getInjury() {
        const { data, error } = await supabase
            .from("injuries")
            .select("*")
            .eq("user_id", user.id);

        if (error) {
            console.log(error.message);
        } else {
            setInjuriesList(data);
        }
    }
    
    useEffect(() => {
        if (user?.id) {
            getInjury();
        }
    }, [user?.id]);

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
            .select();

        if (error) {
            console.log("Error:", error.message);
        } else {
            console.log("Success:", data);
            await getInjury();
            setName("");
            setDate(today);
            setBodyPart("");
            setDescription("");
        }
    }

    // 1. Click Handler for Main Card
    const handleCardClick = (injuryId) => {
        navigate(`/injuries/${injuryId}`);
    };

    // 2. Click Handler for Track ROM
    const handleTrackROM = (e, injuryId) => {
        e.stopPropagation(); // Stops handleCardClick from firing
        navigate(`/rom/${injuryId}`);
    };

    // 3. Click Handler for Delete
    async function deleteInjury(e, id) {
        e.stopPropagation(); // Stops handleCardClick from firing

        const { error } = await supabase
            .from("injuries")
            .delete()
            .eq("id", id);

        if (error) {
            console.log(error);
        } else {
            console.log("Deleted");
            setInjuriesList(injuriesList.filter(injury => injury.id !== id));
        }
    }

    return (
        <>
            <div className="mx-50">
                <h1> Welcome {user?.email}</h1>
            
                <div id="injuryList" className="mt-10"> 
                    <h2 className="text-2xl font-semibold mb-5">Your Injuries</h2>

                    {injuriesList.length === 0 ? (
                        <p className="text-gray-500"> No injuries added yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4"> 
                            {injuriesList.map((injury) => (
                                /* Replaced outer <Link> with a div using onClick */
                                <div 
                                    key={injury.id} 
                                    onClick={() => handleCardClick(injury.id)}
                                    className="bg-white rounded-xl shadow-md p-6 border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                                > 
                                    <h3 className="text-xl font-semibold text-blue-600">{injury.name}</h3>
                                    <div className="mt-3 space-y-1 text-gray-700">
                                        <p>
                                            <span className="font-medium">Date:</span>{" "}
                                            {injury.injury_date}
                                        </p>
                                        <p>
                                            <span className="font-medium">Body Part:</span>{" "}
                                            {injury.body_part}
                                        </p>
                                        <p>
                                            <span className="font-medium">Description:</span>{" "}
                                            {injury.description}
                                        </p>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={(e) => handleTrackROM(e, injury.id)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Track ROM
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => deleteInjury(e, injury.id)} 
                                                className="font-black border border-blue-500 primary-button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}                   
                </div>

                <form onSubmit={addInjury} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-5 mt-20">
                    <label htmlFor="name" className="form-label"> Name </label>
                    <input type="text" id="name" placeholder="Name" className="form-input" value={name} onChange={e=>setName(e.target.value)} />
                    
                    <label htmlFor="injury_date" className="form-label"> Injury Date </label>
                    <input type="date" id="injury_date" className="form-input" value={date} onChange={e=>setDate(e.target.value)} />
                    
                    <label htmlFor="body_part" className="form-label"> Body Part</label>
                    <input type="text" id="body_part" placeholder="Body Part" value={bodyPart} className="form-input" onChange={e=>setBodyPart(e.target.value)} />
                    
                    <label htmlFor="description" className="form-label"> Description </label>
                    <input type="text" id="description" placeholder="Description" value={description} className="form-input" onChange={e=>setDescription(e.target.value)} />
                    
                    <button type="submit" className="primary-button"> Submit </button>
                </form>
            </div>
        </>
    );
};

export default Dashboard;
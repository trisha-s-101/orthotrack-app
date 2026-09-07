import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import OnboardingChecklist from "../components/OnboardingChecklist";

const Dashboard = ({ user }) => {

    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];

    const [name, setName] = useState("");
    const [date, setDate] = useState(today);
    const [side, setSide] = useState("left");
    const [joint, setJoint] = useState("elbow");
    const [description, setDescription] = useState("");
    const [injuriesList, setInjuriesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingInjury, setEditingInjury] = useState(null);

    const JOINTS = [
    "shoulder",
    "elbow",
    "hip",
    "knee",
    "ankle"
    ];


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
        const affectedJoint = `${side}_${joint}`;

        const { data, error } = await supabase
            .from('injuries')
            .insert([
                {
                    name: name,
                    injury_date: date,
                    joint: affectedJoint,
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
            setSide("left");
            setJoint("elbow");
            setDescription("");
            setShowForm(false);
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

        const confirmed = window.confirm("Delete this injury? This will permanently remove all associated sessions, timeline events, and goals.")
        if (!confirmed) return

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

    async function updateInjury(e) {
        e.preventDefault()
        const affectedJoint = `${editingInjury.side}_${editingInjury.jointBase}`

        const { error } = await supabase
            .from("injuries")
            .update({
                name: editingInjury.name,
                injury_date: editingInjury.injury_date,
                joint: affectedJoint,
                description: editingInjury.description,
            })
            .eq("id", editingInjury.id)

        if (error) {
            console.log("Error:", error.message)
        } else {
            await getInjury()
            setEditingInjury(null)
        }
    }

    function startEditing(e, injury) {
        e.stopPropagation()
        const [side, ...rest] = injury.joint.split("_")
        setEditingInjury({ ...injury, side, jointBase: rest.join("_") })
    }

    function formatJoint(joint) {
        return joint
        .split("_")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");
    }

    return (
        <>
            <div className="mx-50">
                <h1> Welcome {user?.email}</h1>
            
                <OnboardingChecklist userId={user.id} injuries={injuriesList} />

                <div id="injuryList" className="mt-10"> 
                    <h2 className="text-2xl font-semibold mb-5">Your Injuries</h2>

                    {injuriesList.length === 0 ? (
                        <p className="text-gray-500"> No injuries added yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {injuriesList.map((injury) => (
                                editingInjury?.id === injury.id ? (
                                    <form
                                        key={injury.id}
                                        onSubmit={updateInjury}
                                        className="bg-white rounded-xl shadow-sm border border-blue-300 p-6 flex flex-col gap-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Edit Injury</h3>
                                            <button type="button" onClick={() => setEditingInjury(null)} className="text-gray-400 hover:text-gray-700 text-sm">Cancel</button>
                                        </div>
                                        <label className="form-label">Name</label>
                                        <input className="form-input" value={editingInjury.name} onChange={e => setEditingInjury(prev => ({ ...prev, name: e.target.value }))} />
                                        <label className="form-label">Injury Date</label>
                                        <input type="date" className="form-input" value={editingInjury.injury_date} onChange={e => setEditingInjury(prev => ({ ...prev, injury_date: e.target.value }))} />
                                        <div>
                                            <label className="block font-medium mb-2">Affected Joint</label>
                                            <div className="flex gap-6 mb-3">
                                                {["left", "right"].map(s => (
                                                    <label key={s} className="flex items-center gap-2">
                                                        <input type="radio" value={s} checked={editingInjury.side === s} onChange={() => setEditingInjury(prev => ({ ...prev, side: s }))} />
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </label>
                                                ))}
                                            </div>
                                            <select className="w-full border rounded-lg p-2" value={editingInjury.jointBase} onChange={e => setEditingInjury(prev => ({ ...prev, jointBase: e.target.value }))}>
                                                {JOINTS.map(j => <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>)}
                                            </select>
                                        </div>
                                        <label className="form-label">Description</label>
                                        <input className="form-input" value={editingInjury.description || ""} onChange={e => setEditingInjury(prev => ({ ...prev, description: e.target.value }))} />
                                        <button type="submit" className="primary-button">Save Changes</button>
                                    </form>
                                ) : (
                                    <div
                                        key={injury.id}
                                        onClick={() => handleCardClick(injury.id)}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-blue-400 transition-colors"
                                    >
                                        <h3 className="text-xl font-semibold text-blue-600">{injury.name}</h3>
                                        <div className="mt-3 space-y-1 text-gray-700">
                                            <p><span className="font-medium">Date:</span>{" "}{injury.injury_date}</p>
                                            <p><span>{formatJoint(injury.joint)}</span></p>
                                            <p><span className="font-medium">Description:</span>{" "}{injury.description}</p>
                                            <div className="mt-4 flex gap-3">
                                                <button type="button" onClick={(e) => handleTrackROM(e, injury.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                                    Track ROM
                                                </button>
                                                <button type="button" onClick={(e) => startEditing(e, injury)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                    Edit
                                                </button>
                                                <button type="button" onClick={(e) => deleteInjury(e, injury.id)} className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}                   
                </div>

                <div className="mt-8">
                    {!showForm ? (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg mb-5"
                            >
                                + Add Injury
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={addInjury} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Add Injury</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-400 hover:text-gray-700 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>

                            <label htmlFor="name" className="form-label"> Name </label>
                            <input type="text" id="name" placeholder="e.g. Left ACL Tear" className="form-input" value={name} onChange={e=>setName(e.target.value)} />

                            <label htmlFor="injury_date" className="form-label"> Injury Date </label>
                            <input type="date" id="injury_date" className="form-input" value={date} onChange={e=>setDate(e.target.value)} />

                            <div>
                                <label className="block font-medium mb-2"> Affected Joint </label>
                                <div className="flex gap-6 mb-4">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" value="left" checked={side === "left"} onChange={(e) => setSide(e.target.value)} />
                                        Left
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" value="right" checked={side === "right"} onChange={(e) => setSide(e.target.value)} />
                                        Right
                                    </label>
                                </div>
                                <select value={joint} onChange={(e) => setJoint(e.target.value)} className="w-full border rounded-lg p-2">
                                    {JOINTS.map(j => (
                                        <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <label htmlFor="description" className="form-label"> Description </label>
                            <input type="text" id="description" placeholder="Brief description of the injury" value={description} className="form-input" onChange={e=>setDescription(e.target.value)} />

                            <button type="submit" className="primary-button"> Save Injury </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
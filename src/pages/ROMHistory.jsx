import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import PastSessions from "../components/PastSessions";

const ROMHistory = ({ user }) => {
  const { id } = useParams();
  const [injuryName, setInjuryName] = useState("");

  useEffect(() => {
    async function fetchInjuryName() {
      const { data } = await supabase
        .from("injuries")
        .select("name")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (data) setInjuryName(data.name);
    }
    fetchInjuryName();
  }, [id, user.id]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      <div className="flex items-center justify-between mb-8">
        <Link to={`/injuries/${id}`} className="text-blue-600 hover:underline text-sm">← Back to Timeline</Link>
        <Link to={`/rom/${id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          Track ROM →
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Session History</h1>
        {injuryName && <p className="text-gray-500">{injuryName}</p>}
      </div>

      <PastSessions injuryId={id} />

    </div>
  );
};

export default ROMHistory;

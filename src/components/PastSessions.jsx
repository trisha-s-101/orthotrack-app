import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function PastSessions({ injuryId }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function fetchSessions() {
      const { data, error } = await supabase
        .from("rom_sessions")
        .select("*")
        .eq("injury_id", injuryId)
        .order("session_date", { ascending: false });

      if (error) {
        console.log("Error fetching sessions:", error);
      } else {
        setSessions(data);
      }
    }

    fetchSessions();
  }, [injuryId]);

  return (
    <div className="mt-12">
      {sessions.length === 0 ? (
        <p className="text-gray-500">No past sessions yet.</p>
      ) : (
        <div className="h-100 space-y-4 overflow-y-scroll">
          {sessions.map((session) => (
            <div key={session.id} className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-500">
                {new Date(session.session_date).toLocaleDateString()}
              </p>
              <p className="font-semibold">{session.joint}</p>
              <p className="text-lg">
                ROM: <span className="font-bold text-blue-600">{session.range_of_motion}°</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PastSessions;
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SessionDetails from "./SessionDetails";

function PastSessions({ injuryId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

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
        setSessions(data || []);
      }
    }

    fetchSessions();
  }, [injuryId]);

  function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="mt-12">

      {sessions.length === 0 ? (
        <p className="text-gray-500">
          No past sessions yet.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isSelected = selectedSession?.id === session.id;

            return (
              <button
                key={session.id}
                onClick={() =>
                  setSelectedSession(
                    isSelected ? null : session
                  )
                }
                className={`w-full text-left p-4 rounded-lg border transition  ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {formatDate(session.session_date)}
                    </p>

                    <p className="font-semibold mt-1">
                      {session.joint
                        ?.split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1)
                        )
                        .join(" ")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      ROM
                    </p>

                    <p className="text-xl font-bold text-blue-600">
                      {Number(
                        session.range_of_motion
                      ).toFixed(1)}
                      °
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedSession && (
        <SessionDetails
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}

export default PastSessions;
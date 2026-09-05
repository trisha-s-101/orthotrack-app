import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SessionDetails from "./SessionDetails";
import SessionComparisonChart from "./SessionComparisonChart";

function PastSessions({ injuryId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [comparing, setComparing] = useState(false);

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

  function handleSessionClick(session) {
    setSelectedSessions((prev) => {
      const alreadySelected = prev.find((s) => s.id === session.id);
      if (alreadySelected) return prev.filter((s) => s.id !== session.id);
      if (prev.length < 2) return [...prev, session];
      return prev;
    });
  }

  function handleClear() {
    setSelectedSessions([]);
    setComparing(false);
  }

  return (
    <div className="mt-12">

      {sessions.length === 0 ? (
        <p className="text-gray-500">No past sessions yet.</p>
      ) : (
        <>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sessions.map((session) => {
              const isSelected = selectedSessions.some((s) => s.id === session.id);

              return (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={`w-full text-left p-4 rounded-lg border transition ${
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

                      {session.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          "{session.notes.length > 60
                            ? session.notes.slice(0, 60) + "…"
                            : session.notes}"
                        </p>
                      )}

                      <p className="font-semibold mt-1">
                        {session.exercise
                          ?.split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ") ?? "—"}
                        {" — "}
                        {session.joint
                          ?.split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">ROM</p>
                      <p className="text-xl font-bold text-blue-600">
                        {Number(session.range_of_motion).toFixed(1)}°
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedSessions.length === 2 && !comparing && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setComparing(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Compare Sessions
              </button>
              <button
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-800 text-sm px-3"
              >
                Clear
              </button>
            </div>
          )}

          {selectedSessions.length === 1 && (
            <SessionDetails
              session={selectedSessions[0]}
              onClose={handleClear}
            />
          )}

          {comparing && selectedSessions.length === 2 && (
            <SessionComparisonChart
              sessionA={selectedSessions[0]}
              sessionB={selectedSessions[1]}
              onClose={handleClear}
            />
          )}
        </>
      )}

    </div>
  );
}

export default PastSessions;

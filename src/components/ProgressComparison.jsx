import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function ProgressComparison({ injuryId, currentROM }) {

  const [previousSession, setPreviousSession] = useState(null);

  useEffect(() => {

    async function loadPreviousSession() {

      const { data } = await supabase
        .from("rom_sessions")
        .select("*")
        .eq("injury_id", injuryId)
        .order("session_date", { ascending: false })
        .limit(2);

      if (data && data.length >= 2) {
        setPreviousSession(data[1]);
      }

    }

    loadPreviousSession();

  }, [injuryId]);

  if (!previousSession)
    return null;

  const delta =
    currentROM - previousSession.range_of_motion;

  const improving = delta > 0;

  return (

    <div className="bg-white rounded-xl shadow-md p-6 mt-8">

      <h2 className="text-xl font-bold mb-5">
        Progress Since Last Session
      </h2>

      <div className="grid grid-cols-3 gap-8">

        <div>

          <p className="text-gray-500 text-sm">
            Previous ROM
          </p>

          <p className="text-3xl font-bold">
            {previousSession.range_of_motion.toFixed(1)}°
          </p>

        </div>

        <div>

          <p className="text-gray-500 text-sm">
            Current ROM
          </p>

          <p className="text-3xl font-bold">
            {currentROM.toFixed(1)}°
          </p>

        </div>

        <div>

          <p className="text-gray-500 text-sm">
            Change
          </p>

          <p
            className={`text-3xl font-bold ${
              improving
                ? "text-green-600"
                : delta < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {delta > 0 && "+"}
            {delta.toFixed(1)}°
          </p>

        </div>

      </div>

      <div className="mt-6">

        {delta > 3 && (
          <p className="text-green-700 font-medium">
            ✅ Nice progress since your previous session.
          </p>
        )}

        {delta < -3 && (
          <p className="text-red-700 font-medium">
            ⚠️ Your measured ROM decreased compared to your previous session.
          </p>
        )}

        {Math.abs(delta) <= 3 && (
          <p className="text-gray-700">
            ROM is relatively unchanged compared to your previous session.
          </p>
        )}

      </div>

    </div>

  );

}

export default ProgressComparison;
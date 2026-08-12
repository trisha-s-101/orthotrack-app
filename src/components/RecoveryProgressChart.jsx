import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../supabaseClient";

function RecoveryProgressChart({ injuryId, refreshKey }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!injuryId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("rom_sessions")
        .select("id, session_date, range_of_motion")
        .eq("injury_id", injuryId)
        .order("session_date", { ascending: true });

      if (error) {
        console.error("Error fetching ROM progression:", error);
        setSessions([]);
      } else {
        setSessions(data || []);
      }

      setLoading(false);
    }

    fetchSessions();
  }, [injuryId, refreshKey]);

  const chartData = sessions
    .filter(
      (session) =>
        session.session_date != null &&
        session.range_of_motion != null
    )
    .map((session, index) => ({
      sessionNumber: index + 1,
      date: new Date(session.session_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      rom: Number(session.range_of_motion),
    }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2">
          Recovery Progress
        </h2>
        <p className="text-gray-500">Loading session history...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2">
          Recovery Progress
        </h2>
        <p className="text-gray-500">
          Complete a ROM session to begin tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Recovery Progress
        </h2>

        <p className="text-gray-500 mt-1">
          Your measured range of motion across ROM sessions.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            label={{
              value: "Session Date",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis
            domain={["auto", "auto"]}
            label={{
              value: "Range of Motion (°)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            formatter={(value) => [`${value.toFixed(1)}°`, "ROM"]}
            labelFormatter={(label) => `Session: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="rom"
            name="Range of Motion"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-sm text-gray-500 mt-4">
        This chart shows your personal ROM measurements over time.
        It does not compare your results to clinical norms.
      </p>
    </div>
  );
}

export default RecoveryProgressChart;
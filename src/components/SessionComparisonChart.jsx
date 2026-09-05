import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function normalizeTimestamps(measurements) {
  const valid = (measurements ?? []).filter(
    (m) => m.timestamp != null && m.angle != null
  );
  if (valid.length === 0) return [];

  const first = valid[0].timestamp;
  const last = valid[valid.length - 1].timestamp;
  const duration = last - first;

  if (duration === 0) return [];

  return valid.map((m) => ({
    x: Math.round(((m.timestamp - first) / duration) * 100),
    angle: Number(m.angle),
  }));
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SessionComparisonChart({ sessionA, sessionB, onClose }) {
  const session1Data = normalizeTimestamps(sessionA.measurements);
  const session2Data = normalizeTimestamps(sessionB.measurements);

  const maxLen = Math.max(session1Data.length, session2Data.length);

  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    x: (session1Data[i] ?? session2Data[i]).x,
    session1: session1Data[i]?.angle ?? null,
    session2: session2Data[i]?.angle ?? null,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md border p-6 mt-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Session Comparison</h2>
          <p className="text-sm text-gray-500 mt-1">
            Motion curves normalized to percentage of movement duration.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-sm"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Session A</p>
          <p className="font-semibold">{formatDate(sessionA.session_date)}</p>
          <p className="text-2xl font-bold text-blue-600">
            {Number(sessionA.range_of_motion).toFixed(1)}°
          </p>
          <p className="text-sm text-gray-500">ROM</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Session B</p>
          <p className="font-semibold">{formatDate(sessionB.session_date)}</p>
          <p className="text-2xl font-bold text-gray-600">
            {Number(sessionB.range_of_motion).toFixed(1)}°
          </p>
          <p className="text-sm text-gray-500">ROM</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            label={{
              value: "% of movement",
              position: "insideBottom",
              offset: -10,
            }}
          />
          <YAxis
            label={{
              value: "Angle (°)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value) =>
              value != null ? [`${Number(value).toFixed(1)}°`, ""] : ["—", ""]
            }
            labelFormatter={(label) => `${label}% of movement`}
          />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="session1"
            name={formatDate(sessionA.session_date)}
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="session2"
            name={formatDate(sessionB.session_date)}
            stroke="#9ca3af"
            dot={false}
            strokeWidth={2}
            strokeDasharray="5 5"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-4">
        Curves are normalized to movement duration — x-axis shows percentage of total recorded time, not absolute seconds.
      </p>
    </div>
  );
}

export default SessionComparisonChart;

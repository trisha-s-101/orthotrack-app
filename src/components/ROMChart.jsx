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

function ROMChart({ measurements }) {
  if (!measurements || measurements.length === 0) return null;

  const chartData = measurements.map((m) => ({
    frame: m.frame,
    angle: Math.round(m.angle * 100) / 100,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Angle Over Time
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="frame"
            label={{
              value: "Frame",
              position: "insideBottomRight",
              offset: -5,
            }}
          />

          <YAxis
            label={{
              value: "Angle (degrees)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip formatter={(value) => `${value}°`} />

          <Legend />

          <Line
            type="monotone"
            dataKey="angle"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
            name="Joint Angle"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ROMChart;
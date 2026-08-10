import { useMemo } from "react";
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

function SessionDetails({ session, onClose }) {
  if (!session) {
    return null;
  }

  const measurements = Array.isArray(session.measurements)
    ? session.measurements
    : [];

  const chartData = useMemo(() => {
    return measurements
      .filter(
        (measurement) =>
          measurement.timestamp != null &&
          measurement.angle != null
      )
      .map((measurement) => ({
        time: Number(measurement.timestamp) / 1000,
        angle: Number(measurement.angle),
      }));
  }, [measurements]);

  function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function downloadCSV() {
    if (measurements.length === 0) {
      return;
    }

    const headers = ["Frame", "Timestamp (ms)", "Time (s)", "Angle (degrees)"];

    const rows = measurements.map((measurement) => [
      measurement.frame ?? "",
      measurement.timestamp ?? "",
      measurement.timestamp != null
        ? (Number(measurement.timestamp) / 1000).toFixed(3)
        : "",
      measurement.angle ?? "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `rom-session-${session.id}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl shadow-md border p-6 mt-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">
            {formatDate(session.session_date)}
          </p>

          <h2 className="text-2xl font-bold mt-1">
            ROM Session Details
          </h2>

          <p className="text-gray-500 mt-1">
            {session.joint
              ?.split("_")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" ")}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-sm"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Range of Motion</p>
          <p className="text-2xl font-bold text-blue-600">
            {Number(session.range_of_motion).toFixed(1)}°
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Average Angle</p>
          <p className="text-2xl font-bold">
            {Number(session.average_angle).toFixed(1)}°
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Maximum Angle</p>
          <p className="text-2xl font-bold">
            {Number(session.max_angle).toFixed(1)}°
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Minimum Angle</p>
          <p className="text-2xl font-bold">
            {Number(session.min_angle).toFixed(1)}°
          </p>
        </div>
      </div>

      {session.preview_image_base64 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">
            Session Preview
          </h3>

          <img
            src={`data:image/jpeg;base64,${session.preview_image_base64}`}
            alt="ROM session preview"
            className="max-w-full md:max-w-2xl rounded-lg border"
          />
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">
            Angle Over Time
          </h3>

          <div className="bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  label={{
                    value: "Time (seconds)",
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

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}°`,
                    "Joint Angle",
                  ]}
                  labelFormatter={(value) =>
                    `${Number(value).toFixed(2)} seconds`
                  }
                />

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
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadCSV}
          disabled={measurements.length === 0}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 disabled:bg-gray-300"
        >
          Download CSV
        </button>

        <div className="text-sm text-gray-500 flex items-center">
          {measurements.length} measurements recorded
        </div>
      </div>
    </div>
  );
}

export default SessionDetails;
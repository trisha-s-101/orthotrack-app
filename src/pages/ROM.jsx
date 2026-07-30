import { useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ROM = ({ user }) => {
  const [video, setVideo] = useState(null); // stores the file the user selected
  const [loading, setLoading] = useState(false); // controls what the button says (UI)
  const [result, setResult] = useState(null); // stores the JSON returned by Flask
  const { id } = useParams(); // Gets the injury ID from /rom/:id

  async function handleAnalyze() {
    if (!video) {
      alert("Please choose a video first.");
      return;
    }

    console.log("Video file:", video);
    console.log("Attempting to fetch from: http://localhost:5001/analyze-rom");

    setLoading(true);

    const formData = new FormData();
    formData.append("video", video);
    formData.append("injuryId", id);

    try {
      console.log("FormData prepared, sending request...");
      const response = await fetch("http://localhost:5001/analyze-rom", {
        method: "POST",
        body: formData,
      });

      console.log("Response received:", response);

      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received: ", data);
      setResult(data);
    } catch (error) {
      console.log("Fetch error:", error);
      alert("Failed to analyze video.");
    }

    setLoading(false);
  }

  // Transform joint_measurements for the chart
  const chartData = result?.joint_measurements?.map((measurement) => ({
    frame: measurement.frame,
    angle: Math.round(measurement.angle * 100) / 100, // Round to 2 decimals
  })) || [];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">ROM Analysis</h1>

      <p className="mb-6 text-gray-600">
        Upload a rehabilitation exercise video to test the ROM analysis pipeline.
      </p>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files[0])}
        className="mb-6"
      />

      <br />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze Video"}
      </button>

      {result && (
        <div className="mt-10 bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          <p>
            <strong>Status:</strong> {result.status}°
          </p>

          <p>
            <strong>Preview Image:</strong>
            <img
              src={`data:image/jpeg;base64,${result.preview_image}`}
              alt="Preview"
            />
          </p>

          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="text-xl font-semibold mb-4">Frame-by-Frame Angles</h3>
            <div className="h-64 overflow-y-auto border rounded p-2">
              {result.joint_measurements.map((entry) => (
                <div key={entry.frame} className="border-b py-1 text-sm">
                  Frame {entry.frame} | {entry.timestamp} ms | {entry.angle.toFixed(1)}°
                </div>
              ))}
            </div>
          </div> 

          {result.metrics && (
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <h3 className="text-xl font-semibold mb-4">
                Motion Analysis
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Maximum Angle</strong>
                  <p>{result.metrics.max_angle.toFixed(1)}°</p>
                </div>

                <div>
                  <strong>Minimum Angle</strong>
                  <p>{result.metrics.min_angle.toFixed(1)}°</p>
                </div>

                <div>
                  <strong>Range of Motion</strong>
                  <p>{result.metrics.range_of_motion.toFixed(1)}°</p>
                </div>

                <div>
                  <strong>Average Angle</strong>
                  <p>{result.metrics.average_angle.toFixed(1)}°</p>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Angle Over Time</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="frame" label={{ value: "Frame", position: "insideBottomRight", offset: -5 }} />
                  <YAxis label={{ value: "Angle (degrees)", angle: -90, position: "insideLeft" }} />
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
          )}

          <p className="mt-4">
            <strong>Frames Processed:</strong> {result.total_frames_processed}
          </p>
        </div>
      )}
    </div>
  ); 
};

export default ROM;
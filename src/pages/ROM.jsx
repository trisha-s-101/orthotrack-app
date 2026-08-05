import { useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../supabaseClient"
import PastSessions from "../components/PastSessions";


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
    setLoading(true);

     // Get the current session's access token
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const formData = new FormData();
    formData.append("video", video);
    formData.append("injury_id", id);  

    try {
      console.log("FormData prepared, sending request...");

      const response = await fetch("http://localhost:5001/analyze-rom", {
        method: "POST",
        headers: {
        "Authorization": `Bearer ${accessToken}`,  // Send the token
        },
        body: formData,
      });

      console.log("Response received:", response);

      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received: ", data);
      setResult(data);
    } 
    
    catch (error) {
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
      <h1 className="text-3xl font-bold mb-2">
        Range of Motion Analysis
      </h1>

      <p className="text-gray-500 mb-6">
        Upload a rehabilitation exercise video and OrthoTrack will automatically identify the appropriate joint based on the selected injury.
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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Range of Motion
            </h2>

            <p className="text-5xl font-bold text-blue-600">
              {result?.metrics?.range_of_motion?.toFixed(1)}°
            </p>

            <p className="text-gray-600 mt-2">
              Calculated from your uploaded exercise video.
            </p>
          </div>

          <p className="mb-4">
            <strong>Joint analyzed:</strong>{" "}
            {result?.joint
            ?.split("_")
            .map(word => word[0].toUpperCase() + word.slice(1))
            .join(" ")}
          </p>

          <p>
            <strong>Preview Image:</strong>
            <img
              src={`data:image/jpeg;base64,${result?.preview_image}`}
              alt="Preview"
            />
          </p>

          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="text-xl font-semibold mb-4">Frame-by-Frame Angles</h3>
            <div className="h-64 overflow-y-auto border rounded p-2">
              {result?.joint_measurements?.map((entry) => (
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
                    strokeWidth={1}
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
      <PastSessions injuryId={id} />
    </div>
  ); 
};

export default ROM;
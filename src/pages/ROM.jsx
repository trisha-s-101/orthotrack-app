import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { supabase } from "../supabaseClient";
import PastSessions from "../components/PastSessions";
import CurrentSessionCard from "../components/CurrentSessionCard";
import ProgressComparison from "../components/ProgressComparison";
import RecoveryProgressChart from "../components/RecoveryProgressChart";

const ROM = ({ user }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  const { id } = useParams();

  async function handleAnalyze() {
    if (!video) {
      alert("Please choose a video first.");
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (!accessToken) {
      alert("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("video", video);
    formData.append("injury_id", id);

    try {
      console.log("FormData prepared, sending request...");

      const response = await fetch("http://localhost:5001/analyze-rom", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      console.log("Response received:", response);

      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      setSessionRefreshKey((previous) => previous + 1);
      console.log("Data received:", data);

      setResult(data);
    } catch (error) {
      console.log("Fetch error:", error);
      alert("Failed to analyze video.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Range of Motion Analysis
        </h1>

        <p className="text-gray-500">
          Upload a rehabilitation exercise video and OrthoTrack
          will automatically identify the appropriate joint based
          on the selected injury.
        </p>
      </div>


      {/* =====================================================
          1. UPLOAD SECTION
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Upload Exercise Video
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          Upload a video of the exercise you want to analyze.
        </p>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          className="mb-5 block w-full"
        />

        {video && (
          <p className="text-sm text-gray-600 mb-4">
            Selected video:{" "}
            <span className="font-medium">{video.name}</span>
          </p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg
                     hover:bg-blue-700 disabled:bg-gray-400
                     transition"
        >
          {loading ? "Analyzing..." : "Analyze Video"}
        </button>
      </div>


      {/* =====================================================
          RESULTS
      ====================================================== */}

      {result && (
        <>
          {/* =================================================
              2. CURRENT SESSION
          ================================================== */}

          <section className="mb-10">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Current Session
                </h2>

                <p className="text-sm text-gray-500">
                  Results from your most recent exercise video.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <CurrentSessionCard result={result} />
            </div>

            {/* Preview image */}

            {result.preview_image && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Pose Detection Preview
                </h3>

                <img
                  src={`data:image/jpeg;base64,${result.preview_image}`}
                  alt="Pose detection preview"
                  className="max-w-full rounded-lg"
                />
              </div>
            )}
          </section>


          {/* =================================================
              3. RECOVERY PROGRESS
          ================================================== */}

          <section className="mb-10">

            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                Recovery Progress
              </h2>

              <p className="text-sm text-gray-500">
                Compare this session with your previous ROM measurement.
              </p>
            </div>

            <ProgressComparison
              injuryId={id}
              currentROM={result.metrics.range_of_motion}
            />

          </section>


          {/* =================================================
              4. WITHIN-SESSION ANGLE CHART
          ================================================== */}

       


          {/* =================================================
              5. SESSION HISTORY
          ================================================== */}

          <section className="mb-10">

            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                Session History
              </h2>

              <p className="text-sm text-gray-500">
                Review your previous range-of-motion measurements
                for this injury.
              </p>
            </div>

            <PastSessions injuryId={id} />

          </section>

        </>
      )}

    </div>
  );
};

export default ROM;
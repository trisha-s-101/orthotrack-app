import { useState } from "react";

const ROMLab = () => {
  const [video, setVideo] = useState(null); //stores the file the user selected
  const [loading, setLoading] = useState(false); //controls what the button says (UI)
  const [result, setResult] = useState(null); //stores the JOSN returned by Flask

  async function handleAnalyze() {
    if (!video) {
      alert("Please choose a video first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await fetch("http://localhost:5000/analyze-rom", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.log(error);
      alert("Failed to analyze video.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        ROM Lab
      </h1>

      <p className="mb-6 text-gray-600">
        Upload a rehabilitation exercise video to test the ROM analysis
        pipeline.
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

          <h2 className="text-xl font-semibold mb-4">
            Results
          </h2>

          <p>
            <strong>Status:</strong> {result.status}°
          </p>

          <p>
            <strong>Preview Image:</strong> {result.preview_image}°
          </p>

          <p>
            <strong>Angles:</strong> {result.angles}°
          </p>

          <p>
            <strong>Frames Processed:</strong> {result.frame_count}
          </p>

        </div>
      )}

    </div>
  );
};

export default ROMLab;
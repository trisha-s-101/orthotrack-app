import { useState } from "react";

const ROM = () => {
  const [video, setVideo] = useState(null); //stores the file the user selected
  const [loading, setLoading] = useState(false); //controls what the button says (UI)
  const [result, setResult] = useState(null); //stores the JOSN returned by Flask

  async function handleAnalyze() {
    if (!video) {
      alert("Please choose a video first.");
      return;
    }

    console.log("Video file:", video); // Log the file
    console.log("Attempting to fetch from: http://localhost:5001/analyze-rom"); // Log the URL

    setLoading(true);

    const formData = new FormData();
    formData.append("video", video);

    try {
        console.log("FormData prepared, sending request..."); // Log before fetch
        const response = await fetch("http://localhost:5001/analyze-rom", {
            method: "POST",
            body: formData,
        });

        console.log("Response received:", response); // Log after fetch

        if(!response.ok){
            throw new Error(`HTTP Error! status: ${response.status}`)
        }

        const data = await response.json();
        console.log("Data received: ", data)
        setResult(data);
    } 
    catch (error) {
        console.log("Fetch error:", error); // Log the actual error
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
            <strong>Preview Image:</strong> 
            <img src={`data:image/jpeg;base64,${result.preview_image}`} alt="Preview" />
          </p>

          <p>
            <strong>Angles:</strong> {result.angles}°
          </p>

          <p>
            <strong>Frames Processed:</strong> {result.total_frames_processed}
          </p>

        </div>
      )}

    </div>
  );
};

export default ROM;
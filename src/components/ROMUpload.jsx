function ROMUpload({
  video,
  setVideo,
  loading,
  handleAnalyze,
}) {
  return (
    <>
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
    </>
  );
}

export default ROMUpload;

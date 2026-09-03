const EXERCISES = [
  { value: "bicep_curl", label: "Bicep Curl" },
  { value: "shoulder_abduction", label: "Shoulder Abduction" },
  { value: "knee_flexion", label: "Knee Flexion" },
  { value: "straight_leg_raise", label: "Straight Leg Raise" },
];

function ROMUpload({
  video,
  setVideo,
  loading,
  handleAnalyze,
  exercise,
  setExercise,
  side,
  setSide,
  notes,
  setNotes
}) {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Exercise
      </label>

      <select
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        className="mb-5 block w-full border rounded-lg p-2"
      >
        <option value="">Select an exercise</option>
        {EXERCISES.map((ex) => (
          <option key={ex.value} value={ex.value}>
            {ex.label}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Side
      </label>

      <div className="mb-5 flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="side"
            value="left"
            checked={side === "left"}
            onChange={(e) => setSide(e.target.value)}
          />
          Left
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="side"
            value="right"
            checked={side === "right"}
            onChange={(e) => setSide(e.target.value)}
          />
          Right
        </label>
      </div>

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

      <label className="block text-sm font-medium text-gray-700 mb-1 mt-5">
        Notes <span className="text-gray-400 font-normal">(optional)</span>
      </label>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. First day without brace. More pain than usual."
        rows={3}
        className="mb-5 block w-full border rounded-lg p-2 text-sm resize-none"
      />

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

function ROMSummary({ result }) {
  if (!result) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-2">
        Range of Motion
      </h2>

      <p className="text-5xl font-bold text-blue-600">
        {result.metrics.range_of_motion.toFixed(1)}°
      </p>

      <p className="text-gray-600 mt-2">
        Calculated from your uploaded exercise video.
      </p>

      <p className="mt-4">
        <strong>Exercise:</strong> {result.exercise_name} ({result.side})
      </p>

      <p className="mt-1">
        <strong>Joint analyzed:</strong>{" "}
        {result.joint
          ?.split("_")
          .map(word => word[0].toUpperCase() + word.slice(1))
          .join(" ")}
      </p>

      <p className="text-xs text-gray-400 mt-4">
        This measurement is for personal tracking only. It does not constitute medical advice.
      </p>
    </div>
  );
}

export default ROMSummary;
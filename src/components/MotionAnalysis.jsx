function MotionAnalysis({ metrics, repetitions }) {
  if (!metrics) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
      <h3 className="text-xl font-semibold mb-4">
        Motion Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Maximum Angle</strong>
          <p>{metrics.max_angle.toFixed(1)}°</p>
        </div>

        <div>
          <strong>Minimum Angle</strong>
          <p>{metrics.min_angle.toFixed(1)}°</p>
        </div>

        <div>
          <strong>Average Angle</strong>
          <p>{metrics.average_angle.toFixed(1)}°</p>
        </div>

        <div>
          <strong>Range of Motion</strong>
          <p>{metrics.range_of_motion.toFixed(1)}°</p>
        </div>

        <div>
          <strong>Repetitions (est.)</strong>
          <p>{repetitions ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default MotionAnalysis;
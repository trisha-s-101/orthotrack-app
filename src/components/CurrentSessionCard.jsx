function CurrentSessionCard({ result }) {
  if (!result?.metrics) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        Current Session
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-gray-500 text-sm">
            Range of Motion
          </p>

          <p className="text-5xl font-bold text-blue-600">
            {result.metrics.range_of_motion.toFixed(1)}°
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Joint
          </p>

          <p className="text-xl font-semibold">
            {result.joint
              .split("_")
              .map(word => word[0].toUpperCase() + word.slice(1))
              .join(" ")}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Maximum Angle
          </p>

          <p className="text-2xl font-semibold">
            {result.metrics.max_angle.toFixed(1)}°
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Average Angle
          </p>

          <p className="text-2xl font-semibold">
            {result.metrics.average_angle.toFixed(1)}°
          </p>
        </div>

      </div>
    </div>
  );
}

export default CurrentSessionCard;
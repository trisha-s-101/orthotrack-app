import { useState } from "react";

const ROMGoal = ({ targetRom, currentROM, exercise, onTargetSave }) => {
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);

  if (!exercise) return null;

  const progress =
    targetRom && currentROM
      ? Math.min((currentROM / targetRom) * 100, 100)
      : null;

  const goalReached = progress !== null && progress >= 100;

  function handleSave() {
    onTargetSave(inputValue);
    setEditing(false);
    setInputValue("");
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <h2 className="text-xl font-semibold mb-1">Recovery Goal</h2>

      {!targetRom ? (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Set a target ROM for this exercise. This is based on your own goal
            or a target provided by your physical therapist — not a clinical
            recommendation.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="360"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 85"
              className="border rounded-lg p-2 w-32 text-sm"
            />
            <span className="text-gray-500 text-sm">degrees</span>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Set Goal
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Current ROM</p>
              <p className="text-3xl font-bold text-blue-600">
                {currentROM != null ? `${currentROM.toFixed(1)}°` : "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Target ROM</p>
              <p className="text-3xl font-bold text-gray-700">
                {targetRom}°
              </p>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
            <span>Progress</span>
            <span>{progress != null ? `${Math.round(progress)}%` : "—"}</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all ${
                goalReached ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>

          {goalReached && (
            <p className="text-green-700 font-medium text-sm mb-4">
              Goal reached. Talk to your PT about updating your target.
            </p>
          )}

          {editing ? (
            <div className="flex items-center gap-3 mt-2">
              <input
                type="number"
                min="1"
                max="360"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={String(targetRom)}
                className="border rounded-lg p-2 w-32 text-sm"
              />
              <span className="text-gray-500 text-sm">degrees</span>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setInputValue(""); }}
                className="text-gray-500 text-sm hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              Edit target
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default ROMGoal;

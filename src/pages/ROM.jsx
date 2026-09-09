import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import PastSessions from "../components/PastSessions";
import ProgressComparison from "../components/ProgressComparison";
import RecoveryProgressChart from "../components/RecoveryProgressChart";
import ROMUpload from "../components/ROMUpload";
import ROMSummary from "../components/ROMSummary";
import MotionAnalysis from "../components/MotionAnalysis";
import ROMChart from "../components/ROMChart";
import ROMGoal from "../components/ROMGoal";

const ROM = ({ user }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const [exercise, setExercise] = useState("");
  const [side, setSide] = useState("left");
  const [notes, setNotes] = useState("");
  const [targetRom, setTargetRom] = useState(null);
  const [showUpload, setShowUpload] = useState(true);
  const [showGoal, setShowGoal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showToast, setShowToast] = useState(false)

  const { id } = useParams();

  async function handleAnalyze() {
    if (!video) {
      alert("Please choose a video first.");
      return;
    }

    if (!exercise) {
      alert("Please select an exercise first.");
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
    formData.append("exercise", exercise);
    formData.append("side", side);
    formData.append("notes", notes);

    try {
      const response = await fetch("http://localhost:5001/analyze-rom", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      setSessionRefreshKey((previous) => previous + 1);
      setResult(data);
      setShowUpload(false);
      setShowToast(true);

    } catch (error) {
      console.log("Fetch error:", error);
      alert("Failed to analyze video.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!exercise) return;

    async function fetchGoal() {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("injury_id", id)
        .eq("exercise", exercise)
        .limit(1);

      if (data && data[0]) {
        setTargetRom(data[0].target_rom);
      } else {
        setTargetRom(null);
      }
    }

    fetchGoal();
  }, [id, exercise])

  useEffect(() => {
    function onScroll() { setShowBackToTop(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  async function handleTargetSave(value){
    value = parseFloat(value);
    if (isNaN(value) || value <= 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;

    const {data, error} = await supabase
      .from("goals")
      .upsert(
        {user_id, injury_id: id, exercise, target_rom: value},
        { onConflict: "injury_id,exercise" }
        // update if row exists, otherwise insert
      )

    setTargetRom(value)
    
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/injuries/${id}`} className="text-blue-600 hover:underline text-sm">← View Timeline</Link>
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">Dashboard</Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Range of Motion Analysis</h1>
        <p className="text-gray-500">
          Upload a rehabilitation exercise video and OrthoTrack will automatically identify the appropriate joint based on the selected injury.
        </p>
      </div>

      {/* Sticky anchor nav — shown once results exist */}
      {result && (
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 -mx-8 px-8 py-3 mb-8 flex gap-6 text-xl overflow-x-auto">
          <a href="#upload" className="text-blue-600 hover:underline whitespace-nowrap border border-blue-500 rounded-sm bg-blue-200 px-1">Upload</a>
          <span className="text-gray-300">·</span>
          <a href="#goal" className="text-blue-600 hover:underline whitespace-nowrap border border-blue-500 rounded-sm bg-blue-200 px-1">Goal</a>
          <span className="text-gray-300">·</span>
          <a href="#session" className="text-blue-600 hover:underline whitespace-nowrap border border-blue-500 rounded-sm bg-blue-200 px-1">Current Session</a>
          <span className="text-gray-300">·</span>
          <a href="#progress" className="text-blue-600 hover:underline whitespace-nowrap border border-blue-500 rounded-sm bg-blue-200 px-1">Recovery Progress</a>
          <span className="text-gray-300">·</span>
          <a href="#history" className="text-blue-600 hover:underline whitespace-nowrap border border-blue-500 rounded-sm bg-blue-200 px-1">Session History</a>
        </div>
      )}

      {/* Upload section — collapsible */}
      <div id="upload" className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <button
          onClick={() => setShowUpload(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div>
            <h2 className="text-xl font-semibold">Upload Exercise Video</h2>
            {!showUpload && result && (
              <p className="text-xs text-green-600 mt-0.5">Analysis complete — expand to upload another</p>
            )}
          </div>
          <span className="text-gray-400 text-sm">{showUpload ? "▲" : "▼"}</span>
        </button>
        {showUpload && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            <ROMUpload
              video={video}
              setVideo={setVideo}
              loading={loading}
              handleAnalyze={handleAnalyze}
              exercise={exercise}
              setExercise={setExercise}
              side={side}
              setSide={setSide}
              notes={notes}
              setNotes={setNotes}
            />
          </div>
        )}
      </div>

      {/* Goal section — collapsible */}
      <div id="goal" className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <button
          onClick={() => setShowGoal(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div>
            <h2 className="text-xl font-semibold">Exercise Goal</h2>
            {targetRom && !showGoal && (
              <p className="text-xs text-gray-400 mt-0.5">Target: {targetRom}°</p>
            )}
          </div>
          <span className="text-gray-400 text-sm">{showGoal ? "▲" : "▼"}</span>
        </button>
        {showGoal && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            <ROMGoal
              targetRom={targetRom}
              currentROM={result?.metrics.range_of_motion ?? null}
              exercise={exercise}
              onTargetSave={handleTargetSave}
            />
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          <section id="session" className="mb-10">
            <h2 className="text-2xl font-bold mb-1">Current Session</h2>
            <p className="text-sm text-gray-500 mb-5">Results from your most recent exercise video.</p>
            <ROMSummary result={result} />
            <MotionAnalysis metrics={result.metrics} repetitions={result.repetitions} />
            <ROMChart measurements={result.joint_measurements} />
          </section>

          <section id="progress" className="mb-10">
            <h2 className="text-2xl font-bold mb-1">Recovery Progress</h2>
            <p className="text-sm text-gray-500 mb-5">Compare this session with your previous ROM measurement.</p>
            <ProgressComparison injuryId={id} exercise={result.exercise} currentROM={result.metrics.range_of_motion} />
            <RecoveryProgressChart injuryId={id} exercise={result.exercise} refreshKey={sessionRefreshKey} />
          </section>

          <section id="history" className="mb-10">
            <h2 className="text-2xl font-bold mb-1">Session History</h2>
            <p className="text-sm text-gray-500 mb-5">Review your previous range-of-motion measurements for this injury.</p>
            <PastSessions injuryId={id} />
          </section>
        </>
      )}

      {/* Session saved toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <span className="text-green-400">✓</span> Session saved
        </div>
      )}

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-blue-700 text-sm font-medium z-50"
        >
          ↑ Top
        </button>
      )}

    </div>
  );
};

export default ROM;
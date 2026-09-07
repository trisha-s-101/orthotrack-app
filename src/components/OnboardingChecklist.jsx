import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"

function OnboardingChecklist({ userId, injuries }) {
  const navigate = useNavigate()
  const storageKey = `orthotrack_onboarding_dismissed_${userId}`
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey) === "true" } catch { return false }
  })
  const [hasRomSession, setHasRomSession] = useState(false)
  const [hasTimelineEvent, setHasTimelineEvent] = useState(false)

  useEffect(() => {
    if (dismissed) return

    async function checkProgress() {
      const [{ count: romCount }, { count: eventCount }] = await Promise.all([
        supabase.from("rom_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("timeline_events").select("id", { count: "exact", head: true }).eq("user_id", userId),
      ])
      setHasRomSession((romCount ?? 0) > 0)
      setHasTimelineEvent((eventCount ?? 0) > 0)
    }

    checkProgress()
  }, [userId, dismissed])

  const firstInjury = injuries[0]
  const hasInjury = injuries.length > 0

  const steps = [
    {
      label: "Add your first injury",
      description: "Log the injury you're recovering from using the form below.",
      done: hasInjury,
      action: null,
    },
    {
      label: "Upload a ROM video",
      description: "Record an exercise and let OrthoTrack measure your range of motion.",
      done: hasRomSession,
      action: hasInjury ? () => navigate(`/rom/${firstInjury.id}`) : null,
      locked: !hasInjury,
    },
    {
      label: "Log a timeline event",
      description: "Track appointments, surgeries, and milestones in your recovery.",
      done: hasTimelineEvent,
      action: hasInjury ? () => navigate(`/injuries/${firstInjury.id}`) : null,
      locked: !hasInjury,
    },
  ]

  function handleDismiss() {
    try { localStorage.setItem(storageKey, "true") } catch {}
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">Get started with OrthoTrack</h2>
          <p className="text-sm text-blue-700 mt-0.5">Complete these steps to set up your recovery tracking.</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-700 text-sm ml-4 shrink-0"
        >
          Dismiss
        </button>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={`flex items-start gap-3 ${step.locked ? "opacity-40" : ""}`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              step.done
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-blue-400"
            }`}>
              {step.done && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${step.done ? "line-through text-blue-400" : "text-blue-900"}`}>
                  {step.label}
                </span>
                {step.locked && (
                  <span className="text-xs text-blue-400">— add an injury first</span>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-0.5">{step.description}</p>
              {step.action && !step.done && (
                <button
                  onClick={step.action}
                  className="text-xs text-blue-700 font-medium hover:underline mt-1"
                >
                  Go →
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default OnboardingChecklist

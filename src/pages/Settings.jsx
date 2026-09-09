import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

const Settings = ({ user }) => {
  const [displayName, setDisplayName] = useState("")
  const [defaultSide, setDefaultSide] = useState("left")
  const [darkMode, setDarkMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      if (data) {
        setDisplayName(data.display_name ?? "")
        setDefaultSide(data.default_side ?? "left")
      }
    }
    fetchProfile()

    const stored = localStorage.getItem("orthotrack_theme")
    const isDark = stored === "dark"
    setDarkMode(isDark)
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
  }, [user.id])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName, default_side: defaultSide })
    setSaving(false)
    if (error) {
      console.error("Profile save error:", error)
      alert("Failed to save: " + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  function handleDarkModeToggle() {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem("orthotrack_theme", next ? "dark" : "light")
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
  }

  async function handleExportCSV() {
    setExportingCSV(true)

    const { data: sessions } = await supabase
      .from("rom_sessions")
      .select("session_date, exercise, joint, range_of_motion, repetitions, notes, injuries(name)")
      .eq("user_id", user.id)
      .order("session_date", { ascending: true })

    if (!sessions || sessions.length === 0) {
      alert("No sessions to export.")
      setExportingCSV(false)
      return
    }

    const headers = ["Date", "Injury", "Exercise", "Joint", "ROM (°)", "Reps", "Notes"]
    const rows = sessions.map(s => [
      s.session_date,
      s.injuries?.name ?? "",
      s.exercise?.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") ?? "",
      s.joint?.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") ?? "",
      s.range_of_motion,
      s.repetitions ?? "",
      `"${(s.notes ?? "").replace(/"/g, '""')}"`
    ])

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orthotrack-sessions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportingCSV(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Trisha"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Shown on your dashboard instead of your email.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Injured Side</label>
            <div className="flex gap-6">
              {["left", "right"].map(s => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={s}
                    checked={defaultSide === s}
                    onChange={() => setDefaultSide(s)}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Pre-selects this side when adding injuries or uploading ROM sessions.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="self-start bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-gray-400 mb-4">Dark mode styling is coming soon — the toggle is wired up but full dark theming is in progress.</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Dark Mode</span>
          <button
            onClick={handleDarkModeToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </section>

      {/* Data export */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-1">Export Data</h2>
        <p className="text-sm text-gray-500 mb-4">Download all your ROM sessions as a CSV file.</p>
        <button
          onClick={handleExportCSV}
          disabled={exportingCSV}
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
        >
          {exportingCSV ? "Exporting..." : "Export Sessions CSV"}
        </button>
      </section>
    </div>
  )
}

export default Settings

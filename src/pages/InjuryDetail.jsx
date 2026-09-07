import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { supabase } from "../supabaseClient"
import TimelineEventsForm from "../components/TimelineEventsForm"
import TimelineEventEditForm from '../components/TimelineEventEditForm'
import { generateHandoffSummary } from "../lib/geminiClient"
import { jsPDF } from 'jspdf' 


const InjuryDetail = ({ user }) => {
  const { id } = useParams()
  const [injury, setInjury] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState(null)
  const [summary, setSummary] = useState(null)
  const [generatingHandoff, setGeneratingHandoff] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [romSessions, setRomSessions] = useState([])

  useEffect(() => {
    fetchInjury()
    fetchEvents()
  }, [id])

  useEffect(() => {
    if (!injury) return

    async function fetchRomSessions() {
      const { data, error } = await supabase
        .from('rom_sessions')
        .select("*")
        .eq('injury_id', injury.id)
        .order('session_date', { ascending: true })

      if (data) {
        setRomSessions(data)
      }
    }

    fetchRomSessions()
  }, [injury])

  async function fetchInjury() {
    const { data, error } = await supabase
      .from('injuries')
      .select('*')
      .eq('id', id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.log("Error:", error.message)
    } else {
      setInjury(data)
    }
    setLoading(false)
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('injury_id', id)
      .eq("user_id", user.id)
      .order('event_date', { ascending: false })

    if (error) {
      console.log("Error:", error.message)
    } else {
      setEvents(data)
    }
  }

  async function deleteEvent(id){
    const confirmed = window.confirm("Delete this timeline event? This cannot be undone.")
    if (!confirmed) return

    const { error } = await supabase
        .from("timeline_events")
        .delete()
        .eq("id", id)

        if(error){
            console.log(error)
        }
        else{
            console.log("Deleted")
            setEvents(events.filter(event => event.id !== id))
        }
  }

  async function deleteDocument(eventId, documentUrl) {
  
  const urlParts = documentUrl.split('/documents/')[1]

  const { error: deleteError } = await supabase.storage
    .from('documents')
    .remove([urlParts])

  if (deleteError) {
    console.log("Error deleting file:", deleteError.message)
    return
  }

  const { error: updateError } = await supabase
    .from('timeline_events')
    .update({
      document_url: null,
      document_name: null,
    })
    .eq('id', eventId)

  if (updateError) {
    console.log("Error updating event:", updateError.message)
  } else {
    fetchEvents()  // Refresh the list
  }
  }

  function serializeForSummary() {
    const jointDisplay = injury.joint?.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") ?? "Unknown"
    let summary = `INJURY: ${injury.name}\n`
    summary += `Joint: ${jointDisplay}\n`
    summary += `Date of Injury: ${injury.injury_date}\n`
    summary += `Description: ${injury.description || 'None'}\n\n`
    
    summary += `TIMELINE OF EVENTS:\n`
    events.forEach(event => {
      summary += `- [${event.event_date}] ${event.type.toUpperCase()}: ${event.title}\n`
      if (event.notes) {
        summary += `  Notes: ${event.notes}\n`
      }
    })

    if (romSessions.length > 0) {
      summary += `\nROM SESSIONS:\n`
      for (const session of romSessions) {
        const exerciseDisplayName = session.exercise?.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") ?? "Unknown exercise"
        const side = session.joint?.split("_")[0] ?? ""
        let line = `[${session.session_date}] ${exerciseDisplayName}${side ? ` (${side})` : ""} — ROM: ${session.range_of_motion}°, Reps: ${session.repetitions ?? 'N/A'}`
        if (session.notes) {
          line += `, Notes: "${session.notes}"`
        }
        summary += line + '\n'
      }
    }
    
    return summary
  }

  async function handleGenerateHandoff() {
    setGeneratingHandoff(true)

    try{
      const injuryData = serializeForSummary()
      const systemPrompt = 
      `
      You are a clinical documentation assistant helping summarize a patient's orthopedic 
      recovery. You will be given a timeline of recovery events and a log of measured range 
      of motion (ROM) sessions.

      Write a 2-3 paragraph summary that:
      - Describes the ROM trend over time (improving, plateauing, any regressions)
      - Notes any correlation between timeline events and changes in ROM 
        (e.g. ROM improved after PT started, or decreased around a noted pain flare)
      - References the patient's own session notes where relevant
      - Does not diagnose, predict outcomes, or compare to clinical norms
      - Ends with: "This summary is based on your personal recorded data and is not a 
        medical assessment."
      Only state what the data shows. Do not invent or infer facts not present in the data.
      `

      const fullPrompt = `${systemPrompt}\n\nPATIENT DATA:\n${injuryData}`
      console.log(fullPrompt) 
      const result = await generateHandoffSummary(fullPrompt)
      setSummary(result)
      setShowSummaryModal(true)
    }
    
    catch(error){
      console.log("Error generating handoff summary: ", error.message)
    }
    setGeneratingHandoff(false)
  }

  function downloadSummaryPDF(summaryText) {
    const doc = new jsPDF()
    
    doc.setFontSize(14)
    doc.text('Orthopedic Recovery Handoff Summary', 20, 20)
    
    doc.setFontSize(10)
    doc.text(`Patient: ${user.email}`, 20, 30)
    doc.text(`Injury: ${injury.name}`, 20, 38)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 46)
    
    doc.setFontSize(9)
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = 170
    
    const lines = doc.splitTextToSize(summaryText, maxWidth)
    doc.text(lines, margin, 60)
    
    doc.setFontSize(7)
    doc.text('⚠️ Generated by OrthoTrack. Not a medical document.', margin, pageHeight - 10)
    
    doc.save(`${injury.name}-handoff-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!injury) return <div className="p-6">Injury not found</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* Nav */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">← Back to Dashboard</Link>
        <Link to={`/rom/${id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          Track ROM →
        </Link>
      </div>

      {/* Injury info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10">
        <h1 className="text-3xl font-bold mb-3">{injury.name}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mb-2">
          <span><strong>Date:</strong> {injury.injury_date}</span>
          <span><strong>Joint:</strong> {injury.joint?.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") ?? "—"}</span>
        </div>
        {injury.description && (
          <p className="text-gray-600 mt-2">{injury.description}</p>
        )}
      </div>

      {/* Timeline */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Timeline</h2>

        {events.length === 0 ? (
          <p className="text-gray-500 mb-6">No events yet. Add one below.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {event.event_date} · {event.type}
                    </p>
                    {event.notes && (
                      <p className="text-gray-600 text-sm mt-2">{event.notes}</p>
                    )}
                    {event.document_url && (
                      <div className="flex items-center gap-3 mt-2">
                        <a href={event.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          📄 {event.document_name}
                        </a>
                        <button onClick={() => deleteDocument(event.id, event.document_url)} className="text-red-500 hover:text-red-700 text-xs">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setEditingEvent(event)} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                      Edit
                    </button>
                    <button onClick={() => deleteEvent(event.id)} className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingEvent && (
          <div className="mb-6">
            <TimelineEventEditForm
              event={editingEvent}
              injuryId={id}
              user={user}
              onEventUpdated={() => { setEditingEvent(null); fetchEvents() }}
              onCancel={() => setEditingEvent(null)}
            />
          </div>
        )}

        <TimelineEventsForm injuryId={id} user={user} onEventCreated={fetchEvents} />
      </section>

      {/* Handoff summary */}
      <section className="mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-1">Handoff Summary</h2>
          <p className="text-sm text-gray-500 mb-4">
            Generate a summary of your recovery timeline and ROM data to share with a new provider.
          </p>
          <button
            onClick={handleGenerateHandoff}
            disabled={generatingHandoff}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium text-sm"
          >
            {generatingHandoff ? "Generating..." : "Generate Handoff Summary"}
          </button>
        </div>
      </section>

      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowSummaryModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl">✕</button>
            <h3 className="text-xl font-bold mb-4">Clinical Handoff Summary</h3>
            <div className="text-gray-700 text-sm whitespace-pre-wrap mb-5 leading-relaxed">
              {summary}
            </div>
            <p className="text-xs text-gray-400 italic mb-4">
              ⚠️ Generated by OrthoTrack. This is a summary of your personal recovery records and is not a medical document or clinical diagnosis.
            </p>
            <button onClick={() => downloadSummaryPDF(summary)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Download as PDF
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default InjuryDetail
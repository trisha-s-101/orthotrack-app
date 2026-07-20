import { useState } from "react"
import { supabase } from "../supabaseClient"

const TimelineEventsForm = ({ injuryId, user, onEventCreated }) => {
  const today = new Date().toISOString().split('T')[0]

  const [title, setTitle] = useState("")
  const [type, setType] = useState("note")
  const [eventDate, setEventDate] = useState(today)
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setUploading(true)

    let documentUrl = null
    let documentName = null

    // Upload file if provided
    if (file) {
      const sanitizedFileName = file.name.replace(/\s+/g, '_')
      const fileName = `${user.id}/${injuryId}/${Date.now()}_${sanitizedFileName}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) {
        console.log("Upload error:", uploadError.message)
        setUploading(false)
        return
      }

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      documentUrl = data.publicUrl
      documentName = file.name
    }

    // Create timeline event
    const { error } = await supabase.from('timeline_events').insert([
      {
        injury_id: injuryId,
        user_id: user.id,
        type,
        title,
        event_date: eventDate,
        notes,
        document_url: documentUrl,
        document_name: documentName,
      },
    ])

    if (error) {
      console.log("Error:", error.message)
    } else {
      setTitle("")
      setType("note")
      setEventDate(today)
      setNotes("")
      setFile(null)
      onEventCreated()
    }

    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add Timeline Event</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="note">Note</option>
          <option value="surgery">Surgery</option>
          <option value="appointment">Appointment</option>
          <option value="PT">Physical Therapy</option>
          <option value="imaging">Imaging</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Surgery with Dr. Smith"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional details..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows="3"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload Document (PDF, Image)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept="image/*,.pdf"
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Add Event"}
      </button>
    </form>
  )
}

export default TimelineEventsForm
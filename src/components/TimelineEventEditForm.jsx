import { useState } from "react"
import { supabase } from "../supabaseClient"

const TimelineEventEditForm = ({ event, injuryId, user, onEventUpdated, onCancel }) => {

  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(event.title || "")
  const [type, setType] = useState(event.type || "note")
  const [eventDate, setEventDate] = useState(event.event_date || today)
  const [notes, setNotes] = useState(event.notes || "")
  const [updating, setUpdating] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setUpdating(true)

    const { error } = await supabase
      .from('timeline_events')
      .update({
        title,
        type,
        event_date: eventDate,
        notes,
      })
      .eq('id', event.id)

    if (error) {
      console.log("Error:", error.message)
    } else {
      onEventUpdated()
    }

    setUpdating(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-yellow-50 border-l-4 border-yellow-600 rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Edit Timeline Event</h3>

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
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows="3"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {updating ? "Updating..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default TimelineEventEditForm
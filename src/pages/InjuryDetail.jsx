import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { supabase } from "../supabaseClient"

const InjuryDetail = ({ user }) => {
  const { id } = useParams()
  const [injury, setInjury] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInjury()
    fetchEvents()
  }, [id])

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

  if (loading) return <div className="p-6">Loading...</div>
  if (!injury) return <div className="p-6">Injury not found</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{injury.name}</h1>
        <p className="text-gray-600 mb-1">
          <strong>Date:</strong> {injury.injury_date}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Body Part:</strong> {injury.body_part}
        </p>
        {injury.description && (
          <p className="text-gray-600">
            <strong>Description:</strong> {injury.description}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Timeline</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No events yet. Add one above!</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-600"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {event.event_date} • {event.type}
                  </p>
                  {event.notes && (
                    <p className="text-gray-700 mb-2">{event.notes}</p>
                  )}
                  {event.document_url && (
                    <a
                        href={event.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        📄 {event.document_name}
                    </a>
                )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default InjuryDetail
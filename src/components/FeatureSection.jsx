const features = [
  { title: "Treatment Timeline", description: "Keep every appointment, surgery, and document in one place.", icon: "🗓️" },
  { title: "Range of Motion Tracker", description: "Track your physical progress over time using AI-powered video analysis.", icon: "📐" },
  { title: "Handoff Summary", description: "Generate a clear summary to bring to a new provider.", icon: "📋" }
]

function FeatureSection() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="p-6 bg-teal-50 border border-teal-100 rounded-xl hover:shadow-md transition">
            <div className="text-2xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-teal-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeatureSection
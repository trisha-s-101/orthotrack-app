const features = [
  { title: "Treatment Timeline", description: "Keep every appointment, surgery, and document in one place." },
  { title: "Range of Motion Tracker", description: "Track your physical progress over time using your webcam." },
  { title: "Handoff Summary", description: "Generate a clear summary to bring to a new provider." }
]

function FeatureSection() {
  return (
    <section className="grid gap-6 px-6 py-16 max-w-5xl mx-auto md:grid-cols-3">
      {features.map((feature) => (
        <div key={feature.title} className="p-6 border border-gray-200 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </section>
  )
}

export default FeatureSection
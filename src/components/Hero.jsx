import { Link } from "react-router-dom"

function Hero({ user }) {
  return (
    <section className="text-center px-6 py-24 max-w-2xl mx-auto">
      <span className="inline-block bg-teal-50 text-teal-700 text-sm font-medium px-3 py-1 rounded-full mb-6 border border-teal-200">
        Orthopedic Recovery Tracker
      </span>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Your recovery, on your terms
      </h2>
      <p className="text-lg text-gray-500 mb-8">
        Track your orthopedic recovery journey — your timeline, your progress,
        your records, all in one place.
      </p>
      <Link
        to={user ? "/dashboard" : "/login"}
        className="px-6 py-3 text-white bg-teal-700 rounded-lg font-medium hover:bg-teal-800 inline-block transition"
      >
        {user ? "Go to Dashboard" : "Sign In"}
      </Link>
      {!user && (
        <p className="mt-3 text-sm text-gray-500">
          Not a user yet?{" "}
          <Link to="/signup" className="text-teal-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      )}
    </section>
  )
}

export default Hero
import { Link } from "react-router-dom"

function Hero({ user }) {
  return (
    <section className="text-center px-6 py-20 max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Your recovery, on your terms
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Track your orthopedic recovery journey — your timeline, your progress,
        your records, all in one place.
      </p>
      <Link
        to={user ? "/dashboard" : "/login"}
        className="px-6 py-3 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 inline-block"
      >
        {user ? "Go to Dashboard" : "Sign In"}
      </Link>
      {!user && (
        <p className="mt-3 text-sm text-gray-500">
          Not a user yet?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      )}
    </section>
  )
}

export default Hero
import Login from "./Login.jsx"
import {Link, Route, Switch} from "react-router-dom"

function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
      <h1 className="text-xl font-bold text-blue-600">OrthoTrack</h1>
      <nav>
        <Switch>
          <Link to="/login">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
            Log in
          </button>
          </Link>
          <Route exact component={Login} path="/login"></Route>
        </Switch>
      </nav>
    </header>
  )
}

export default Header
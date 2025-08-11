import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import { BrowserRouter as Router} from "react-router-dom"
import { Route, Routes} from "react-router-dom"
import About from "./components/About"
import Type from "./components/Type"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./contexts/AuthContext"
import GoogleSuccess from "./pages/GoogleSuccess"
import RoomEntry from "./components/RoomEntry"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
            <Route path="/" element={<Home />} >
              <Route index element={<About />} />
              <Route path="type" element={
                <ProtectedRoute>
                  <Type />
                </ProtectedRoute>
              } />
              <Route path='room' element={
                <ProtectedRoute>
                  <RoomEntry />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/google-success" element={<GoogleSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
 
export default App
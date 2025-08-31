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
import Multiplayer from "./components/Multiplayer"
import { WebSocketProvider } from "./contexts/WebSocketContext"
import { Outlet, useParams } from "react-router-dom";
import Race from "./components/Race";
import Leaderboard from "./pages/Leaderboard";
import Results from "./components/Results";
import Profile from "./pages/Profile";
import SetUsername from "./components/SetUsername";

function WebSocketWrapper() {
  const { roomCode } = useParams();
  return (
    <WebSocketProvider roomCode={roomCode}>
      <Outlet />
    </WebSocketProvider>
  );
}

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
              <Route path="multiplayer/:roomCode" element={<WebSocketWrapper />}>
                <Route index element={<ProtectedRoute><Multiplayer /></ProtectedRoute>} />
                <Route path="race" element={<ProtectedRoute><Race /></ProtectedRoute>} />
                <Route path="results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              </Route>
            </Route>
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/google-success" element={<GoogleSuccess />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/set-username" element={<SetUsername />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
 
export default App
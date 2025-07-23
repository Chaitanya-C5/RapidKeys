import Home from "./pages/Home"
import { BrowserRouter as Router} from "react-router-dom"
import { Route, Routes} from "react-router-dom"
import About from "./components/About"
import Type from "./components/Type"

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Home />} >
            <Route index element={<About />} />
            <Route path="/type" element={<Type />} />
          </Route>
      </Routes>
    </Router>
  )
}
 
export default App
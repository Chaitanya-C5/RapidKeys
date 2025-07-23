import Header from "../components/Header"
import { Outlet } from "react-router-dom"

function Home() {
  return (
    <div className="bg-black min-h-screen font-mono">
      <Header />
      <Outlet />
    </div>
  )
}

export default Home

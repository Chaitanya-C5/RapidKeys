import Hero from "../components/Hero"
import Why from "../components/Why"

function About() {
  return (
    <div>
      <div className="w-full min-h-screen flex flex-col">
        <Hero />
      </div>

      <div id="why-section" className="w-full min-h-screen flex flex-col justify-center">
        <Why />
      </div>
    </div>
  )
}

export default About

import { Button } from "@/components/ui/button"
import { MoveRight, ChevronDown } from "lucide-react"

function Hero() {
  
  return (
    <div className="flex flex-col items-center justify-center bg-black w-full text-gray-300 font-mono p-4 gap-6 ">
      <div className="md:mt-10">
        <p className="text-white font-bold text-3xl sm:text-5xl md:text-6xl text-center leading-tight">
          Master Your Typing Skills <br />
          with <span className="custom-color">RapidKeys</span>
        </p>
      </div>

      <div className="mt-2 sm:mt-4">
        <p className="text-zinc-400 text-sm sm:text-base md:text-lg font-bold text-center leading-relaxed">
          Practice typing, challenge friends, and track improvements with <br className="hidden sm:block" />
          real-time stats in a sleek, minimalist interface
        </p>
      </div>

      <div className="mt-6 sm:mt-10">
        <Button className="custom-bgcolor text-white font-bold text-[1rem] sm:text-[1.05rem] w-[12rem] sm:w-[15rem] h-[2.75rem] sm:h-[3rem] flex items-center justify-center gap-2">
          Start Typing Now <MoveRight className="text-white w-4 h-4" />
        </Button>
      </div>

      <div className="scroll-hover mt-8 flex flex-col items-center animate-bounce">
        <ChevronDown className="text-zinc-500 w-6 h-6 cursor-pointer scroll-item" 
          onClick={() => {
            document.getElementById("why-section")?.scrollIntoView({ behavior: "smooth" })
          }}
        />
        <p className="scroll-item text-xs text-zinc-500 mt-1">Scroll</p>
      </div>
    </div>
  )
}

export default Hero

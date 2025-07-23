import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, Swords, ChartNoAxesCombined, Zap, Bolt } from "lucide-react"

function Why() {
    const features = [
        {
            icon: <Activity className="text-[#59b59b] w-10 h-10" />,
            title: "Real-time Feedback",
            description: "Get instant feedback of your typing speed and accuracy.",
        },
        {
            icon: <Swords className="text-[#46a6dd] w-10 h-10" />,
            title: "Challenge Friends",
            description: "Compete with friends real-time typing access.",
        },
        {
            icon: <ChartNoAxesCombined className="text-[#ddcb43] w-10 h-10" />,
            title: "Detailed Analytics",
            description: "Track progress over time with comprehensive stats.",
        },
        {
            icon: <Bolt className="text-[#b6a6e9] w-10 h-10"/>,
            title: "Customizable Options",
            description: "Choose from different typing modes to suit your needs.",
        },
        {
            icon: <Zap className="text-[#e0aaff] w-8 h-8" />,
            title: "Minimalist Interface",
            description: "Enjoy a sleek design that enhances your focus.",
        },
    ]
  return (
    <div className="flex flex-col items-center">
        <div className="my-10 text-center">
            <p className='text-5xl text-white'>Why choose <span className='custom-color'>RapidKeys?</span></p>
        </div>

        <div className='grid grid-cols-6 grid-rows-2 gap-x-8 gap-y-8 p-10 rounded-lg w-[85%]'>
            {
                features.map((feature, index) => (
                    <Card 
                        key={index} 
                        className="bg-zinc-900 text-white hover:shadow-lg transition-all duration-300 border-none col-span-2"
                        style={index > 2 ? {  gridColumn: index === 3 ? '2 / 4' : '4 / 6' } : {}}
                    >
                        <CardHeader className="flex items-center justify-center gap-3">
                        {feature.icon}
                        <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-zinc-400">
                        <p>{feature.description}</p>
                        </CardContent>
                    </Card>
                ))
            }
        </div>
        
        <div className="flex flex-col items-center mt-10 gap-3 hover-custom cursor-pointer">
            <div className="line w-10 h-1 bg-zinc-700 rounded-full transition-all duration-300" />
            <p className="text text-zinc-500 text-sm italic transition-all duration-300">
                Built for coders, designed for flow.
            </p>
        </div>
    </div>
  )
}

export default Why
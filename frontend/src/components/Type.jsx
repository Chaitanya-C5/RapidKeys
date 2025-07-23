import { Hourglass, TypeOutline } from "lucide-react"

function Type() {
  return (
    <div className="w-full flex flex-col items-center"> 
        { /* This is where the typing header options will go */}
        <div className="flex gap-4">
            <div className="flex gap-8">
                <button className="flex gap-1">
                    <Hourglass className="text-gray-400" size={32}/> 
                    <span className="text-gray-400 text-md mt-1">time</span>
                </button>

                <button className="flex gap-3">
                    <TypeOutline className="text-gray-400" size={32}/>
                    <span className="text-gray-400 text-md mt-1">words</span>
                </button>
            </div>

            <div className="w-0.25 h-8 bg-gray-600"></div>

            <div>

            </div>
        </div>

        {/* This is where the typing text appears */}
        <div>

        </div>

        {/* This is analytics appear*/}
        <div>

        </div>

        {/* This is graph will be visible */}
        <div>

        </div>
    </div>
  )
}

export default Type
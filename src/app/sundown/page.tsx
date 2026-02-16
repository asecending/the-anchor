import { Moon, PhoneOff } from 'lucide-react'

export default function SundownPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-8 max-w-md">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Moon className="w-24 h-24 text-emerald-500/20" />
            <PhoneOff className="w-12 h-12 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight">
          Digital Sundown Active
        </h1>

        <div className="space-y-4">
          <p className="text-slate-400 text-lg leading-relaxed">
            It is past 9:00 PM. The protocol demands your phone be placed outside the bedroom.
          </p>
          
          <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
            <p className="text-emerald-400 font-medium">
              Disconnect to Reconnect.
            </p>
          </div>
        </div>

        <div className="pt-12 text-slate-600 text-sm">
          Access resumes at 4:00 AM.
        </div>
      </div>
    </main>
  )
}

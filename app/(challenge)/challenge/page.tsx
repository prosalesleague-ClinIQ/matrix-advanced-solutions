import Link from 'next/link'
import { Clock, Layers, BarChart3, Scale, Ruler, Heart, Camera, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STATS = [
  { icon: Clock, label: '12 Weeks', description: 'Study Duration' },
  { icon: Layers, label: '3 Phases', description: 'Structured Protocol' },
  { icon: BarChart3, label: 'Full Tracking', description: 'Every Metric Measured' },
]

const PHASES = [
  {
    phase: 1,
    name: 'Baseline',
    weeks: 'Weeks 1-2',
    description:
      'Establish your starting measurements, body composition, and wellness markers. This data becomes the foundation for tracking all future progress.',
  },
  {
    phase: 2,
    name: 'Protocol',
    weeks: 'Weeks 3-10',
    description:
      'Follow the MuscleLock protocol with weekly check-ins. Track weight, measurements, vitals, energy, sleep, and lifestyle factors throughout the active phase.',
  },
  {
    phase: 3,
    name: 'Results',
    weeks: 'Weeks 11-12',
    description:
      'Final measurements and comprehensive comparison against your baseline. Full progress report with visual documentation of your transformation.',
  },
]

const TRACKING = [
  { icon: Scale, label: 'Weight', description: 'Weekly weigh-ins' },
  { icon: Ruler, label: 'Body Composition', description: 'Body fat percentage, key circumferences' },
  { icon: Activity, label: 'Measurements', description: 'Waist, hips, chest, arms, thighs' },
  { icon: Heart, label: 'Vitals', description: 'Resting heart rate, blood pressure' },
  { icon: Camera, label: 'Photos', description: 'Front, side, and back progress photos' },
]

export default function ChallengeLandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="accent" className="mb-6">
            Now Enrolling
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text-accent mb-6">
            MuscleLock Transformation Study
          </h1>
          <p className="text-lg sm:text-xl text-steel-400 max-w-2xl mx-auto mb-10">
            A structured 12-week clinical study designed to measure and document
            the real-world impact of the MuscleLock protocol on body composition,
            strength, and overall wellness.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {STATS.map((stat) => (
              <Card key={stat.label} variant="glass">
                <CardContent className="flex flex-col items-center py-6">
                  <stat.icon className="h-8 w-8 text-accent-cyan mb-3" />
                  <p className="text-xl font-bold text-white">{stat.label}</p>
                  <p className="text-sm text-steel-400">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            Study Phases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PHASES.map((phase) => (
              <Card key={phase.phase} variant="glass">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-accent-cyan/15 text-accent-cyan">
                    Phase {phase.phase}
                  </Badge>
                  <CardTitle className="text-xl">{phase.name}</CardTitle>
                  <p className="text-sm text-accent-cyan">{phase.weeks}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-steel-400">{phase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Track */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            What You&apos;ll Track
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKING.map((item) => (
              <Card key={item.label} variant="glass">
                <CardContent className="flex items-start gap-4 py-4">
                  <div className="rounded-lg bg-accent-cyan/10 p-2.5">
                    <item.icon className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-steel-400">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card variant="glass" className="p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Begin?
            </h2>
            <p className="text-steel-400 mb-8 max-w-lg mx-auto">
              Join the MuscleLock Transformation Study and get structured tracking,
              weekly check-ins, and a complete progress report.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/challenge/signup">
                <Button size="lg">Join the Study</Button>
              </Link>
              <Link href="/challenge/login">
                <Button variant="ghost" size="lg">
                  Already enrolled? Log in
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}

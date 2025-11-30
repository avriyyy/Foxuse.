import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Target, CheckSquare, Rocket, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b-4 border-black">
          <div className="relative h-[500px] w-full">
            <img
              src="/banner-pink.png"
              alt="FOXuse Banner"
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-6 text-center">
                <h1 className="mb-6 text-5xl font-black uppercase leading-tight text-white md:text-7xl drop-shadow-lg">
                  Hunt Web3 Airdrops<br />Like a Pro
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-xl font-bold text-zinc-200 md:text-2xl drop-shadow-lg">
                  Track tasks, interact with dApps, and manage your airdrop portfolio in one focused workspace.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b-4 border-black bg-zinc-50 py-20">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-black uppercase md:text-5xl">
              Why FOXuse?
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <Card className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary p-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black uppercase">
                  Multi-Airdrop Tracking
                </h3>
                <p className="text-sm font-medium text-zinc-600">
                  Track multiple Web3 airdrops in one centralized dashboard.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-secondary p-4">
                    <CheckSquare className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black uppercase">
                  Task Management
                </h3>
                <p className="text-sm font-medium text-zinc-600">
                  Check off tasks as you complete them with real-time progress tracking.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-accent p-4">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black uppercase">
                  Popup Browser
                </h3>
                <p className="text-sm font-medium text-zinc-600">
                  Interact with dApps in popup windows while tracking your tasks.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary p-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black uppercase">
                  Organized Workspace
                </h3>
                <p className="text-sm font-medium text-zinc-600">
                  Split-screen interface keeps everything you need in one place.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-b-4 border-black bg-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-4xl font-black uppercase md:text-5xl">
              How It Works
            </h2>
            <div className="mx-auto max-w-4xl space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-black bg-primary neo-shadow">
                  <span className="text-3xl font-black text-white">1</span>
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-black uppercase">
                    Browse Available Airdrops
                  </h3>
                  <p className="text-lg font-medium text-zinc-600">
                    Explore curated Web3 airdrop opportunities with difficulty ratings and potential rewards.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-black bg-secondary neo-shadow">
                  <span className="text-3xl font-black text-white">2</span>
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-black uppercase">
                    Launch Workspace & Complete Tasks
                  </h3>
                  <p className="text-lg font-medium text-zinc-600">
                    Open the focused workspace with task list and popup browser to interact with dApps seamlessly.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-black bg-accent neo-shadow">
                  <span className="text-3xl font-black text-white">3</span>
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-black uppercase">
                    Track Your Progress
                  </h3>
                  <p className="text-lg font-medium text-zinc-600">
                    Check off completed tasks and monitor your progress with the built-in progress bar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Footer CTA */}
        <section className="border-t-4 border-black bg-black py-16 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase md:text-5xl">
              Ready to Start Hunting?
            </h2>
            <p className="mb-8 text-xl font-bold text-zinc-300">
              Join the Web3 airdrop revolution today.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Explore Airdrops
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

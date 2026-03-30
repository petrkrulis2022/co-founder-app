import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Founder{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00d4ff]">
              OS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            Your AI co-founder for web3 startups
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Go from idea to investor pitch across 13 structured stages with an
            AI advisor that knows web3 inside out.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-[#00ff9d] text-[#050505] hover:bg-[#00ff9d]/90"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

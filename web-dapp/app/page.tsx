import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Fingerprint, Users, Vote, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fly-in-from-bottom-5 duration-700 ease-out">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Blockchain-backed civic participation
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl animate-in fly-in-from-bottom-8 duration-700 ease-out delay-100 text-foreground">
            A Transparent Community for <span className="text-primary">Local Governance</span>
          </h1>
          <p className="mt-6 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 animate-in fly-in-from-bottom-8 duration-700 ease-out delay-200">
            Submit issues anonymously, participate in local polls, and track resolution timelines—all secured by cryptographic verification. Your voice matters, and your identity stays protected.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md animate-in fly-in-from-bottom-8 duration-700 ease-out delay-300">
            <Link href="/report" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full shadow-primary/25 shadow-xl hover:-translate-y-1 transition-transform">
                Report an Issue
              </Button>
            </Link>
            <Link href="/issues" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 rounded-full border-primary/20 hover:bg-primary/5">
                Explore Issues <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
              Core Principles
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-lg/relaxed lg:text-xl/relaxed xl:text-xl/relaxed">
              Designed to build trust between citizens and local authorities through technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg shadow-black/5 bg-card hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Fingerprint className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Anonymity</CardTitle>
                <CardDescription>
                  Report sensitive issues without fear. Decoupled identity services ensure your submissions cannot be traced back to you.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-lg shadow-black/5 bg-card hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl">Immutable Integrity</CardTitle>
                <CardDescription>
                  Records are anchored to a permissioned blockchain. Once submitted, records cannot be altered or manipulated.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-lg shadow-black/5 bg-card hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Community Assessed</CardTitle>
                <CardDescription>
                  Community upvotes highlight the most pressing issues, bringing immediate attention to severe public challenges.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-lg shadow-black/5 bg-card hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="bg-warning/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Vote className="h-6 w-6 text-warning" />
                </div>
                <CardTitle className="text-xl">Opinion Polling</CardTitle>
                <CardDescription>
                  Cast your vote on active municipal proposals and securely participate in local decision-making processes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            Ready to shape your community?
          </h2>
          <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg mb-10">
            Join the platform today to stay informed and help resolve local infrastructure issues.
          </p>
          <Link href="/polls">
            <Button size="lg" className="rounded-full shadow-lg">
              View Active Polls <Vote className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

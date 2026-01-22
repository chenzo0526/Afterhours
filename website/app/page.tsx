import CallNarrativeSection from "@/components/CallNarrativeSection";
import HomeHero from "@/components/HomeHero";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <HomeHero />
      <CallNarrativeSection />
    </div>
  );
}

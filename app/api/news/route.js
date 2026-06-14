export const dynamic = 'force-dynamic';

export async function GET() {
  const news = [
    {
      id: "1",
      title: "Apple Announces New Spatial Computing Features at WWDC 2026",
      description: "Vision Pro gets deep integration with local LLMs, allowing users to control complex environments with conversational natural voice commands.",
      source: "TechCrunch",
      time: "2h ago"
    },
    {
      id: "2",
      title: "Vercel Releases Next.js 16 with Instant Compilation and Turbopack by Default",
      description: "The new compiler reduces cold start times by 70% and enables instant module replacement for large scale applications.",
      source: "Next.js Blog",
      time: "4h ago"
    },
    {
      id: "3",
      title: "SpaceX Starship Completes Fifth Orbital Test Flight with Precision Landing",
      description: "Both the Super Heavy booster and Starship spacecraft returned to their designated targets, marking a historic milestone in reusable space travel.",
      source: "SpaceNews",
      time: "6h ago"
    },
    {
      id: "4",
      title: "AI Models Reach New Benchmarks in Scientific Discovery and Material Science",
      description: "Researchers deploy customized transformers to discover three new superconducting materials that operate at higher temperatures.",
      source: "MIT Technology Review",
      time: "1d ago"
    },
    {
      id: "5",
      title: "Global Grid Operators Transition to AI-Driven Dynamic Load Balancing",
      description: "Over 15 European countries report a 12% decrease in peak power grid failures thanks to predictive scheduling systems.",
      source: "Reuters",
      time: "1d ago"
    }
  ];

  return new Response(JSON.stringify(news), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=1800" // Cache for 30 minutes
    }
  });
}

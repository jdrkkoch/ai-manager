export async function GET() {
  const events = [
    {
      id: "1",
      time: "09:00 - 10:00",
      title: "Daily Standup Meeting",
      description: "Sync with the development team and align on today's priorities.",
      color: "#3897f1" // Calendar category color (blue for work)
    },
    {
      id: "2",
      time: "11:30 - 12:00",
      title: "Review UI/UX Design System",
      description: "Approve final widgets design with the product manager.",
      color: "#a28cf2" // Purple for design/creative
    },
    {
      id: "3",
      time: "13:00 - 14:00",
      title: "Lunch with Marketing Team",
      description: "Discussing Vercel deployment launch and social strategy.",
      color: "#4cd964" // Green for social/lunch
    },
    {
      id: "4",
      time: "15:30 - 16:30",
      title: "Deep Work: Core Dashboard Logic",
      description: "Implement API integrations and finalize styling tokens.",
      color: "#ff9500" // Orange for engineering focus
    },
    {
      id: "5",
      time: "19:00 - 20:30",
      title: "Gym & Workout Session",
      description: "Weekly high intensity interval training (HIIT) workout.",
      color: "#ff2d55" // Red for personal health
    }
  ];

  return new Response(JSON.stringify(events), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

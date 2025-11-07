/**
 * Simple rule-based itinerary generator.
 * Packs attractions by interest and spreads across days.
 */
export const generateItinerary = ({ durationDays, interests = [], attractions = [] }) => {
  const days = Math.max(1, Number(durationDays || 1));
  const sortScore = (a) => {
    const name = (a.name || "").toLowerCase();
    return interests.reduce((acc, tag) => acc + (name.includes(tag.toLowerCase()) ? 2 : 0), 0) + (a.rating || 0);
  };

  const sorted = [...attractions].sort((a, b) => sortScore(b) - sortScore(a));
  const perDay = Math.max(2, Math.round(sorted.length / days) || 2);

  const plan = [];
  for (let d = 1; d <= days; d++) {
    const start = (d - 1) * perDay;
    const chunk = sorted.slice(start, start + perDay);
    plan.push({
      day: d,
      title: `Day ${d}`,
      activities: chunk.map(a => `${a.name} (${a.rating || "N/A"}★)`)
    });
  }
  return plan;
};

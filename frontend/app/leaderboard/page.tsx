
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-12">Leaderboard</h1>
      <LeaderboardTable />
    </div>
  );
}
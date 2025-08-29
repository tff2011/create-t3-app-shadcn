import { Card, CardContent } from "@/components/ui/card";

interface StrategyStats {
  totalOperations: number;
  winRate: number;
  totalPips: number;
  profitOperations: number;
  lossOperations: number;
}

interface StatisticsProps {
  stats: StrategyStats | undefined;
}

const Statistics = ({ stats }: StatisticsProps) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-300 font-mono">{stats.totalOperations}</div>
          <p className="text-green-400/70 text-sm">Total Operations</p>
        </CardContent>
      </Card>
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-300 font-mono">{Number(stats.winRate).toFixed(1)}%</div>
          <p className="text-green-400/70 text-sm">Win Rate</p>
        </CardContent>
      </Card>
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-300 font-mono">{Number(stats.totalPips).toFixed(2)}</div>
          <p className="text-green-400/70 text-sm">Total Pips</p>
        </CardContent>
      </Card>
      <Card className="bg-black/90 border-green-500/60">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-300 font-mono">{stats.profitOperations}/{stats.lossOperations}</div>
          <p className="text-green-400/70 text-sm">Wins/Losses</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
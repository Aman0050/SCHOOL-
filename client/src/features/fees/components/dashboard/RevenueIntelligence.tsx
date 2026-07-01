import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';

export const RevenueIntelligence: React.FC<any> = ({ stats }) => {
  const expected = stats?.totalAssigned || 0;
  const collected = stats?.totalCollected || 0;
  const gap = expected - collected;
  const percentage = expected > 0 ? Math.round((collected / expected) * 100) : 0;

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-h4">
          <Target className="h-5 w-5 text-primary" />
          Revenue Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground font-medium">Collection Progress</span>
          <span className="text-primary font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 mb-6">
          <div className="bg-primary h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
            <div className="text-caption text-primary mb-1">Expected Revenue</div>
            <div className="text-lg font-bold text-foreground">₹{expected.toLocaleString()}</div>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <div className="text-caption text-amber-500 mb-1">Revenue Gap</div>
            <div className="text-lg font-bold text-foreground">₹{gap.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

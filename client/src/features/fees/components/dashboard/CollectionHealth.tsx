import React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';

export const CollectionHealth: React.FC<any> = ({ stats }) => {
  const getHealthColor = (score: string) => {
    switch (score) {
      case 'Excellent': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'Good': return 'text-primary bg-primary/10 border-primary/20';
      case 'Warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'Critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const healthScore = stats?.healthScore || 'Pending';
  const colorClasses = getHealthColor(healthScore);

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-h4">
          <Activity className="h-5 w-5 text-primary" />
          Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-full text-center py-6 rounded-xl border ${colorClasses}`}>
          <div className="text-3xl font-black uppercase tracking-wider">{healthScore}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full mt-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-caption">Defaulters</div>
            <div className="text-xl font-bold text-foreground mt-1">{stats?.defaultersCount || 0}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-caption">Fines Due</div>
            <div className="text-xl font-bold text-foreground mt-1">₹{stats?.outstandingFines?.toLocaleString() || 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

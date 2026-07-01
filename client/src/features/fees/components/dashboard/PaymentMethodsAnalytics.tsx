import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';

export const PaymentMethodsAnalytics: React.FC<any> = ({ methods }) => {
  const data = Object.keys(methods || {}).map(key => ({
    name: key,
    value: methods[key]
  }));

  if (data.length === 0) {
    data.push({ name: 'No Data', value: 1 });
  }

  // Use token-equivalent hex codes or rely on CSS vars if possible
  // For Recharts we often need hex, but these match the emerald, blue, amber, violet palette.
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'];

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-h4">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

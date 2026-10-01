'use client';

import { memo } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartSpec {
  type: string;
  title: string;
  x_label?: string;
  y_label?: string;
  data: Record<string, string | number>[];
}

export default memo(function AnalyticsCharts({ charts }: { charts: ChartSpec[] }) {
  if (!Array.isArray(charts)) return null;
  return <div className="space-y-5 mt-4 border-t border-slate-800 pt-4">
    {charts.filter(chart => Array.isArray(chart.data) && chart.data.length).map((chart, index) => {
      const line = chart.type === 'line';
      const Chart = line ? LineChart : BarChart;
      const first = chart.data[0];
      const xKey = ['x', 'date', 'label', 'name'].find(key => key in first) || Object.keys(first)[0];
      const series = Object.keys(first).filter(key => key !== xKey && chart.data.some(row => typeof row[key] === 'number'));
      if (!series.length) return null;
      const colors = ['#f59e0b', '#38bdf8', '#34d399', '#a78bfa'];
      return <section key={`${chart.title}-${index}`}>
        <h4 className="text-sm font-medium text-slate-200 mb-1">{chart.title}</h4>
        <p className="text-xs text-slate-400 mb-3">{[chart.x_label, chart.y_label].filter(Boolean).join(' · ')}</p>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              {series.length > 1 && <Legend />}
              {series.map((key, i) => line
                ? <Line key={key} dataKey={key} stroke={colors[i % colors.length]} dot={false} isAnimationActive={false} />
                : <Bar key={key} dataKey={key} fill={colors[i % colors.length]} isAnimationActive={false} />)}
            </Chart>
          </ResponsiveContainer>
        </div>
      </section>;
    })}
  </div>;
});

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TypingStatsProps {
  wpmHistory: { time: string; wpm: number }[];
}

const TypingStats: React.FC<TypingStatsProps> = ({ wpmHistory }) => {
  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Live Speed (WPM)</h3>
      <div className="h-48 w-full bg-white rounded-xl shadow-sm border border-macos-border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={wpmHistory}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007aff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007aff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis dataKey="time" hide />
            <YAxis 
                tick={{fontSize: 10, fill: '#999'}} 
                axisLine={false} 
                tickLine={false}
                domain={[0, 'auto']} 
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#007aff', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Area 
                type="monotone" 
                dataKey="wpm" 
                stroke="#007aff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorWpm)" 
                isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TypingStats;

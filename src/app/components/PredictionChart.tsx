import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: '1', value: 75 },
  { name: '2', value: 50 },
  { name: '3', value: 90 },
  { name: '4', value: 65 },
  { name: '5', value: 85 },
  { name: '6', value: 55 },
  { name: '7', value: 45 },
];

export function PredictionChart() {
  return (
    <div className="border border-gray-300 bg-white p-6">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Bar dataKey="value" fill="#d1d5db" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

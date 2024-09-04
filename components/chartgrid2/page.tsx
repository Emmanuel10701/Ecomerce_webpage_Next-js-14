// components/ChartGridComponent.tsx

"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip } from 'recharts';
import { ScatterChart, Scatter, XAxis as ScatterXAxis, YAxis as ScatterYAxis, Tooltip as ScatterTooltip } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as PieTooltip } from 'recharts';

// Define the data types
interface LineChartData {
  name: string;
  value: number;
}

interface ScatterPlotData {
  x: number;
  y: number;
}

interface PieChartData {
  name: string;
  value: number;
}

// Sample data for charts
const lineChartData: LineChartData[] = [
  { name: 'Page A', value: 4000 },
  { name: 'Page B', value: 3000 },
  { name: 'Page C', value: 2000 },
  { name: 'Page D', value: 2780 },
  { name: 'Page E', value: 1890 },
];

const scatterPlotData: ScatterPlotData[] = [
  { x: 1, y: 4000 },
  { x: 2, y: 3000 },
  { x: 3, y: 2000 },
  { x: 4, y: 2780 },
  { x: 5, y: 1890 },
];

const pieChartData: PieChartData[] = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartGridComponent: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      {/* Line Chart */}
      <div className="flex-1 min-w-[150px] max-w-[250px] p-4 border rounded-lg bg-gray-50">
        <h2 className="text-sm font-semibold mb-2 text-center">Line Chart</h2>
        <LineChart width={160} height={100} data={lineChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <LineTooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>

      {/* Scatter Plot */}
      <div className="flex-1 min-w-[150px] max-w-[250px] p-4 border rounded-lg bg-gray-50">
        <h2 className="text-sm font-semibold mb-2 text-center">Scatter Plot</h2>
        <ScatterChart width={160} height={100}>
          <ScatterXAxis dataKey="x" />
          <ScatterYAxis dataKey="y" />
          <Scatter data={scatterPlotData} fill="#8884d8" />
          <ScatterTooltip />
        </ScatterChart>
      </div>

      {/* Pie Chart */}
      <div className="flex-1 min-w-[150px] max-w-[250px] p-4 border rounded-lg bg-gray-50">
        <h2 className="text-sm font-semibold mb-2 text-center">Pie Chart</h2>
        <PieChart width={160} height={120}>
          <Pie data={pieChartData} dataKey="value" outerRadius={50}>
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <PieTooltip />
        </PieChart>
      </div>
    </div>
  );
};

export default ChartGridComponent;

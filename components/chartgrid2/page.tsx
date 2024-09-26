"use client";

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip
} from 'recharts';
import {
  ScatterChart, Scatter, XAxis as ScatterXAxis, YAxis as ScatterYAxis, Tooltip as ScatterTooltip
} from 'recharts';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartGridComponent: React.FC = () => {
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [scatterPlotData, setScatterPlotData] = useState<ScatterPlotData[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);

  useEffect(() => {
    // Fetch line chart data (assuming API endpoints are correct)
    const fetchLineChartData = async () => {
      const response = await fetch('/api/subscribers');
      const data = await response.json();
      setLineChartData(data);
    };

    // Fetch scatter plot data (count of products and their prices)
    const fetchScatterPlotData = async () => {
      const response = await fetch('/actions/products');
      const data = await response.json();
      const formattedData = data.map((product: any, index: number) => ({
        x: index + 1,
        y: product.price,
      }));
      setScatterPlotData(formattedData);
    };

    // Fetch pie chart data (admins and users)
    const fetchPieChartData = async () => {
      const [subscribersResponse, adminsResponse, usersResponse] = await Promise.all([
        fetch('/api/subs'),
        fetch('/api/admins'),
        fetch('/api/users'),
      ]);

      const [subscribers, admins, users] = await Promise.all([
        subscribersResponse.json(),
        adminsResponse.json(),
        usersResponse.json(),
      ]);

      const pieData = [
        { name: 'Subscribers', value: subscribers.count },
        { name: 'Admins', value: admins.count },
        { name: 'Users', value: users.count },
      ];

      setPieChartData(pieData);
    };

    fetchLineChartData();
    fetchScatterPlotData();
    fetchPieChartData();
  }, []);

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

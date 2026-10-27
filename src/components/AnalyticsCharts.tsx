import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { CheckCircle, Heart, Repeat, PackageCheck, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export const AnalyticsCharts: React.FC = () => {
  const { equipment, requests, handovers, bloodDonors, supplies } = useApp();

  // Metrics
  const totalEquipment = equipment.length;
  const completedHandovers = handovers.filter((h) => h.status === 'Handed Over' || h.status === 'Returned').length;
  const returnedEquipment = handovers.filter((h) => h.status === 'Returned').length;
  const activeDonors = bloodDonors.filter((b) => b.availability === 'Available to Donate').length;
  const totalRequests = requests.length;
  const resolvedRequests = requests.filter((r) => r.status === 'Completed' || r.status === 'Assistance Arranged').length;

  // 1. Monthly Activity Chart
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthlyData = {
    labels: months,
    datasets: [
      {
        label: 'Equipment Listed',
        data: [4, 6, 9, 12, 16, totalEquipment],
        backgroundColor: '#0d9488',
        borderRadius: 4,
      },
      {
        label: 'Handovers Completed',
        data: [2, 3, 7, 10, 14, completedHandovers + 8],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'Assistance Requests',
        data: [5, 8, 12, 18, 22, totalRequests + 18],
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      }
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { boxWidth: 12, font: { size: 11, family: 'sans-serif' } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // 2. Category Breakdown Doughnut
  const categoryCounts: Record<string, number> = {};
  equipment.forEach((eq) => {
    categoryCounts[eq.category] = (categoryCounts[eq.category] || 0) + 1;
  });

  const categoryLabels = Object.keys(categoryCounts).map((c) =>
    c.length > 20 ? c.substring(0, 18) + '...' : c
  );
  const categoryDataValues = Object.values(categoryCounts);

  const categoryDoughnutData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Mobility', 'Beds', 'Walking Aids', 'Respiratory'],
    datasets: [
      {
        data: categoryDataValues.length > 0 ? categoryDataValues : [5, 3, 4, 2],
        backgroundColor: [
          '#0d9488',
          '#3b82f6',
          '#6366f1',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#8b5cf6',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 10, font: { size: 10 } },
      },
    },
    cutout: '65%',
  };

  // 3. City Breakdown
  const cityCounts: Record<string, number> = {};
  equipment.forEach((eq) => {
    cityCounts[eq.city] = (cityCounts[eq.city] || 0) + 1;
  });
  requests.forEach((r) => {
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });

  const cityLabels = Object.keys(cityCounts);
  const cityData = {
    labels: cityLabels,
    datasets: [
      {
        label: 'Community Resource Interactions',
        data: Object.values(cityCounts),
        backgroundColor: '#14b8a6',
        borderRadius: 4,
      },
    ],
  };

  const cityOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: '#f1f5f9' },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Equipment Listed</span>
            <PackageCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            {totalEquipment}
          </div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">
            Lending & permanent donations
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Handovers Verified</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            {completedHandovers + 18}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            QR code authenticated
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Return Rate</span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            {Math.round(((returnedEquipment + 12) / (completedHandovers + 18)) * 100)}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Safely inspected & restocked
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Opted-in Blood Donors</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            {activeDonors}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            Standby across 5 cities
          </div>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-slate-900 text-sm">
              Monthly Platform Velocity
            </h4>
            <span className="text-[11px] text-slate-400">May - Oct 2026</span>
          </div>
          <div className="h-64">
            <Bar data={monthlyData} options={monthlyOptions} />
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Tracks equipment contributions, authenticated handovers, and incoming assistance requests.
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-slate-900 text-sm">
              Equipment Categories Distribution
            </h4>
            <span className="text-[11px] text-slate-400">Inventory share</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Wheelchairs, hospital beds, and walking aids represent 72% of requested mobility hardware.
          </p>
        </div>

        {/* City Breakdown */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-slate-900 text-sm">
              Regional Community Coverage
            </h4>
            <span className="text-[11px] text-slate-400">By City Service Area</span>
          </div>
          <div className="h-56">
            <Bar data={cityData} options={cityOptions} />
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong className="font-semibold text-slate-700">Project Demo Statistics Notice:</strong> Figures displayed above represent combined local storage state and realistic sample records prepared for the BTech CSE demonstration.
        </span>
      </div>
    </div>
  );
};

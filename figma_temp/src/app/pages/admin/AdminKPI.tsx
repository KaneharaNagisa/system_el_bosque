import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaChartBar } from "react-icons/fa";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const monthlySales = [
  { month: "3月", sales: 120000, reservations: 8 },
  { month: "4月", sales: 180000, reservations: 12 },
  { month: "5月", sales: 250000, reservations: 16 },
  { month: "6月", sales: 150000, reservations: 10 },
  { month: "7月", sales: 320000, reservations: 20 },
  { month: "8月", sales: 450000, reservations: 28 },
  { month: "9月", sales: 280000, reservations: 18 },
  { month: "10月", sales: 220000, reservations: 14 },
  { month: "11月", sales: 160000, reservations: 10 },
  { month: "12月", sales: 90000, reservations: 6 },
];

const repeaterData = [
  { month: "3月", newRate: 70, repeaterRate: 30 },
  { month: "4月", newRate: 60, repeaterRate: 40 },
  { month: "5月", newRate: 55, repeaterRate: 45 },
  { month: "6月", newRate: 50, repeaterRate: 50 },
  { month: "7月", newRate: 45, repeaterRate: 55 },
  { month: "8月", newRate: 40, repeaterRate: 60 },
  { month: "9月", newRate: 42, repeaterRate: 58 },
  { month: "10月", newRate: 38, repeaterRate: 62 },
  { month: "11月", newRate: 35, repeaterRate: 65 },
  { month: "12月", newRate: 33, repeaterRate: 67 },
];

const experiencePopularity = [
  { name: "星空観察(ガイドなし)", count: 85, revenue: 0 },
  { name: "星空ガイド付き", count: 42, revenue: 84000 },
  { name: "BBQプラン", count: 38, revenue: 114000 },
  { name: "川遊び体験", count: 25, revenue: 0 },
  { name: "農業体験", count: 12, revenue: 18000 },
];

const memberStatusData = [
  { name: "個人", value: 25 },
  { name: "カップル", value: 20 },
  { name: "ご夫婦", value: 22 },
  { name: "友人", value: 18 },
  { name: "ご家族", value: 15 },
];
const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

const satisfactionData = [
  { item: "施設全体", score: 4.5 },
  { item: "清潔さ", score: 4.7 },
  { item: "Wi-Fi環境", score: 4.2 },
  { item: "周辺環境", score: 4.8 },
  { item: "ペット対応", score: 4.6 },
  { item: "送迎サービス", score: 4.3 },
  { item: "星空観察", score: 4.9 },
  { item: "コストパフォーマンス", score: 4.4 },
];

// ── 各チャートを独立コンポーネントとして定義（recharts 内部キー衝突を防ぐ）──

function MonthlySalesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlySales} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `¥${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, "売上"]} />
        <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RepeaterRateChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={repeaterData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
        <Tooltip formatter={(value: number) => [`${value}%`]} />
        <Legend />
        <Line type="monotone" dataKey="repeaterRate" name="リピーター率" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="newRate" name="新規率" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MemberStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={memberStatusData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {memberStatusData.map((entry, i) => (
            <Cell key={`pie-cell-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── メインページ ──

export function AdminKPI() {
  const [selectedYear, setSelectedYear] = useState("2025");

  const totalSales = monthlySales.reduce((sum, m) => sum + m.sales, 0);
  const totalReservations = monthlySales.reduce((sum, m) => sum + m.reservations, 0);
  const avgRepeaterRate = (repeaterData.reduce((sum, r) => sum + r.repeaterRate, 0) / repeaterData.length).toFixed(1);
  const avgSatisfaction = (satisfactionData.reduce((s, d) => s + d.score, 0) / satisfactionData.length).toFixed(1);
  const sortedExperiences = [...experiencePopularity].sort((a, b) => b.count - a.count);
  const maxCount = sortedExperiences[0]?.count ?? 1;

  return (
    <AdminLayout currentPage="kpi" title="集計（KPI）">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaChartBar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base text-gray-900">KPI集計ダッシュボード</h2>
              <p className="text-xs text-gray-500">予約状況・売上・リピーター率・体験プログラム効果測定</p>
            </div>
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="2025">2025年度</option>
            <option value="2026">2026年度</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">年間売上</p>
            <p className="text-2xl mt-1" style={{ color: "#0a2105" }}>¥{totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">年間予約数</p>
            <p className="text-2xl text-green-600 mt-1">{totalReservations}件</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">平均リピーター率</p>
            <p className="text-2xl text-amber-600 mt-1">{avgRepeaterRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500">平均満足度</p>
            <p className="text-2xl text-purple-600 mt-1">{avgSatisfaction} / 5.0</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm text-gray-900 mb-4">月次売上推移</h3>
            <MonthlySalesChart />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm text-gray-900 mb-4">リピーター率推移</h3>
            <RepeaterRateChart />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm text-gray-900 mb-4">会員ステータス別利用比率</h3>
            <MemberStatusChart />
          </div>

          {/* Satisfaction bars (no recharts) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm text-gray-900 mb-4">利用後アンケート（満足度）</h3>
            <div className="space-y-3">
              {satisfactionData.map(d => (
                <div key={d.item}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{d.item}</span>
                    <span className="text-gray-900">{d.score} / 5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(d.score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Experience Ranking */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm text-gray-900 mb-4">体験プログラム効果測定</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-4 py-3 text-xs text-gray-500 w-12">順位</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">プログラム名</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">利用回数</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">売上貢献額</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">利用率バー</th>
                </tr>
              </thead>
              <tbody>
                {sortedExperiences.map((e, i) => (
                  <tr key={e.name} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-center">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${
                        i === 0 ? "bg-yellow-400 text-yellow-900"
                        : i === 1 ? "bg-gray-300 text-gray-700"
                        : i === 2 ? "bg-orange-300 text-orange-900"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{e.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{e.count}回</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">¥{e.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(e.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{((e.count / maxCount) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

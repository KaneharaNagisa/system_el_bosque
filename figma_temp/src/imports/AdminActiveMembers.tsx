import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Calendar, UserCheck } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// モックデータ生成関数
const generateMockData = (period: string) => {
  const now = new Date();
  const data = [];

  switch (period) {
    case "7days":
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          active: Math.floor(Math.random() * 30) + 90,
          total: 124,
        });
      }
      break;
    case "30days":
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          active: Math.floor(Math.random() * 35) + 85,
          total: 124,
        });
      }
      break;
    case "3months":
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          active: Math.floor(Math.random() * 40) + 80,
          total: 124,
        });
      }
      break;
    case "1year":
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: `${date.getFullYear()}/${date.getMonth() + 1}`,
          active: Math.floor(Math.random() * 45) + 75,
          total: 124,
        });
      }
      break;
    default:
      break;
  }

  return data;
};

export default function AdminActiveMembers() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState("30days");
  const [chartType, setChartType] = useState<"line" | "area">("area");

  const data = generateMockData(period);
  const latestActive = data[data.length - 1]?.active || 0;
  const averageActive = (
    data.reduce((sum, item) => sum + item.active, 0) / data.length
  ).toFixed(0);
  const activeRate = ((latestActive / 124) * 100).toFixed(1);

  const handleNavigate = (
    page:
      | "dashboard"
      | "members"
      | "accounts"
      | "master-skills"
      | "master-hobbies"
      | "master-personalities"
      | "master-challenges"
  ) => {
    if (page === "dashboard") {
      navigate("/admin/dashboard");
    } else if (page === "members") {
      navigate("/admin/members");
    } else if (page === "accounts") {
      navigate("/admin/accounts");
    } else if (page === "master-skills") {
      navigate("/admin/master-skills");
    } else if (page === "master-hobbies") {
      navigate("/admin/master-hobbies");
    } else if (page === "master-personalities") {
      navigate("/admin/master-personalities");
    } else if (page === "master-challenges") {
      navigate("/admin/master-challenges");
    }
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        currentPage="dashboard"
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="border-b border-border bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    アクティブメンバー数の推移
                  </h1>
                  <p className="text-gray-600">
                    期間を指定してメンバーのアクティビティ動向を確認できます
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardDescription>現在のアクティブメンバー</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{latestActive}人</div>
                  <p className="text-sm text-gray-500 mt-1">過去30日間にログインしたメンバー</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardDescription>平均アクティブメンバー</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{averageActive}人</div>
                  <p className="text-sm text-gray-500 mt-1">期間内の平均値</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardDescription>アクティブ率</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{activeRate}%</div>
                  <p className="text-sm text-gray-500 mt-1">総メンバー数に対する割合</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Section */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>アクティブメンバー数グラフ</CardTitle>
                    <CardDescription className="mt-1">
                      期間とグラフタイプを選択してください
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="w-[180px]">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">過去7日間</SelectItem>
                        <SelectItem value="30days">過去30日間</SelectItem>
                        <SelectItem value="3months">過去3ヶ月</SelectItem>
                        <SelectItem value="1year">過去1年</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={chartType}
                      onValueChange={(value) => setChartType(value as "line" | "area")}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">折れ線グラフ</SelectItem>
                        <SelectItem value="area">エリアグラフ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === "line" ? (
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 150]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="active"
                          name="アクティブメンバー"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={{ fill: "#f97316", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="総メンバー数"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 150]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="総メンバー数"
                          fill="#e2e8f0"
                          stroke="#94a3b8"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="active"
                          name="アクティブメンバー"
                          fill="#fdba74"
                          stroke="#f97316"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="bg-white mt-6">
              <CardHeader>
                <CardTitle>詳細データ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">日付</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          アクティブメンバー
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          活動率
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 text-gray-900">{item.date}</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            {item.active}人
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {((item.active / item.total) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Info Section */}
            <Card className="bg-blue-50 border-blue-200 mt-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">i</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">アクティブメンバーの定義</h4>
                    <p className="text-sm text-blue-800">
                      アクティブメンバーとは、過去30日間にシステムにログインしたメンバーを指します。
                      <br />
                      この指標により、メンバーの実際の活動状況を把握することができます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
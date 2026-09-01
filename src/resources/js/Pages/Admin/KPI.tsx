import AdminLayout from "../../Components/Admin/Layout";
import { FaChartBar } from "react-icons/fa";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface MonthlySales {
    month: string;
    sales: number;
    reservations: number;
}
interface MemberStatus {
    name: string;
    value: number;
}

interface Props {
    monthlySales: MonthlySales[];
    memberStatusData: MemberStatus[];
}

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

export default function KPI({ monthlySales, memberStatusData }: Props) {
    const totalSales = monthlySales.reduce((sum, d) => sum + d.sales, 0);
    const totalReservations = monthlySales.reduce(
        (sum, d) => sum + d.reservations,
        0,
    );

    return (
        <AdminLayout currentPage="kpi" title="集計（KPI）">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-xl text-gray-900 mb-1">KPI・集計</h2>
                    <p className="text-sm text-gray-600">
                        売上・予約数・会員構成のグラフ
                    </p>
                </div>

                {/* サマリカード */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">累計売上</p>
                        <p className="text-3xl text-gray-900">
                            ¥{totalSales.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">累計予約数</p>
                        <p className="text-3xl text-gray-900">
                            {totalReservations}件
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">
                            平均売上/月
                        </p>
                        <p className="text-3xl text-gray-900">
                            ¥
                            {monthlySales.length > 0
                                ? Math.floor(
                                      totalSales / monthlySales.length,
                                  ).toLocaleString()
                                : 0}
                        </p>
                    </div>
                </div>

                {/* 月別売上グラフ */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h3 className="text-base text-gray-900 mb-4">
                        月別売上・予約数
                    </h3>
                    {monthlySales.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlySales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(v) =>
                                        `¥${(v / 10000).toFixed(0)}万`
                                    }
                                />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(v, name) => [
                                        name === "sales"
                                            ? `¥${(v as number).toLocaleString()}`
                                            : `${v}件`,
                                        name === "sales" ? "売上" : "予約数",
                                    ]}
                                />
                                <Legend
                                    formatter={(v) =>
                                        v === "sales" ? "売上" : "予約数"
                                    }
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="sales"
                                    fill="#2c976c"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="reservations"
                                    fill="#6ee7a8"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-300 flex items-center justify-center text-gray-400 text-sm py-16">
                            売上データがありません（支払済みの請求が発生すると表示されます）
                        </div>
                    )}
                </div>

                {/* 会員構成 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-base text-gray-900 mb-4">
                        会員の宿泊形態
                    </h3>
                    {memberStatusData.length > 0 ? (
                        <div className="flex gap-8 items-center">
                            <ResponsiveContainer width={280} height={280}>
                                <PieChart>
                                    <Pie
                                        data={memberStatusData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {memberStatusData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    PIE_COLORS[
                                                        i % PIE_COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {memberStatusData.map((item, i) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{
                                                backgroundColor:
                                                    PIE_COLORS[
                                                        i % PIE_COLORS.length
                                                    ],
                                            }}
                                        />
                                        <span className="text-sm text-gray-700">
                                            {item.name}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {item.value}名
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 py-8 text-center">
                            会員データがありません
                        </p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

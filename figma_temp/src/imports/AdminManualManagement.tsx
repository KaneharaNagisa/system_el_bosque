import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  FileText,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { mockManuals, Manual } from "../data/mockData";
import { toast } from "sonner@2.0.3";

export default function AdminManualManagement() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [selectedManual, setSelectedManual] =
    useState<Manual | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  // 検索フィルター
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "front" | "admin"
  >("all");

  // 管理画面モードの設定
  useEffect(() => {
    document.body.setAttribute("data-admin", "true");
    return () => {
      document.body.removeAttribute("data-admin");
    };
  }, []);

  // マニュアルデータの読み込み（論理削除されていないもののみ）
  useEffect(() => {
    const activeManuals = mockManuals.filter(
      (manual) => !manual.deletedAt,
    );
    setManuals(activeManuals);
  }, []);

  // フィルタリングされたマニュアル
  const filteredManuals = manuals.filter((manual) => {
    const matchesSearch = manual.screenName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" || manual.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // 種別の日本語表示
  const getTypeLabel = (type: "front" | "admin") => {
    return type === "front" ? "フロント" : "管理画面";
  };

  // ステータスの日本語表示
  const getStatusBadge = (status: 0 | 1) => {
    if (status === 1) {
      return <Badge className="bg-green-500">有効</Badge>;
    }
    return <Badge variant="secondary">無効</Badge>;
  };

  // 削除処理（論理削除）
  const handleDelete = () => {
    if (!selectedManual) return;

    // 実際にはAPIで論理削除を実行
    const updatedManuals = manuals.filter(
      (manual) => manual.id !== selectedManual.id,
    );
    setManuals(updatedManuals);
    setIsDeleteDialogOpen(false);
    setSelectedManual(null);
    toast.success("マニュアルを削除しました");
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        currentPage="manuals"
        isCollapsed={isSidebarCollapsed}
        onToggle={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
      />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64",
        )}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  マニュアル管理
                </h1>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                フロント画面と管理画面のマニュアルを管理します
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/manuals/add")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規登録
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* 検索フィルター */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">
                絞り込み
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 画面名検索 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-700">
                  画面名を検索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="画面名を検索..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="pl-10 bg-white"
                  />
                </div>
              </div>

              {/* 種別フィルター */}
              <div className="space-y-2">
                <label className="text-sm text-gray-700">
                  種別
                </label>
                <Select
                  value={typeFilter}
                  onValueChange={(
                    value: "all" | "front" | "admin",
                  ) => setTypeFilter(value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="front">
                      フロント
                    </SelectItem>
                    <SelectItem value="admin">
                      管理画面
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    種別
                  </TableHead>
                  <TableHead>画面名</TableHead>
                  <TableHead className="w-[200px]">
                    ターム名
                  </TableHead>
                  <TableHead className="w-[120px]">
                    ステータス
                  </TableHead>
                  <TableHead className="w-[120px]">
                    作成日
                  </TableHead>
                  <TableHead className="w-[120px]">
                    更新日
                  </TableHead>
                  <TableHead className="w-[150px] text-right">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManuals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      マニュアルが登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredManuals.map((manual) => (
                    <TableRow key={manual.id}>
                      <TableCell className="font-medium">
                        {getTypeLabel(manual.type)}
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {manual.screenName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {manual.term}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(manual.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {manual.createdAt}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {manual.updatedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(
                                `/admin/manuals/preview/${manual.id}`,
                              )
                            }
                            title="プレビュー"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(
                                `/admin/manuals/edit/${manual.id}`,
                              )
                            }
                            title="編集"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedManual(manual);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="削除"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マニュアルの削除</DialogTitle>
            <DialogDescription>
              {selectedManual?.screenName}{" "}
              のマニュアルを削除しますか？
              <br />
              この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
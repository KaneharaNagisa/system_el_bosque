import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UserPlus, Edit, Trash2, Shield, LogOut } from "lucide-react";
import { toast } from "sonner@2.0.3";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "system_admin" | "facility_admin";
  createdAt: string;
  lastLoginAt?: string; // 最終ログイン日時を追加
}

interface AdminAccountManagementProps {
  onBack: () => void;
  onMemberManagement?: () => void;
  onMasterSkills?: () => void;
  onMasterHobbies?: () => void;
  onMasterPersonalities?: () => void;
  onMasterChallenges?: () => void;
}

// モックデータ
const mockAdminAccounts: AdminAccount[] = [
  {
    id: "admin-001",
    name: "システム管理者",
    email: "system@admin.com",
    role: "system_admin",
    createdAt: "2024-01-01",
    lastLoginAt: "2025-01-07 14:30",
  },
  {
    id: "admin-002",
    name: "管理者A",
    email: "admin-a@example.com",
    role: "facility_admin",
    createdAt: "2024-01-05",
    lastLoginAt: "2025-01-06 09:15",
  },
  {
    id: "admin-003",
    name: "管理者B",
    email: "admin-b@example.com",
    role: "facility_admin",
    createdAt: "2024-01-10",
    lastLoginAt: "2025-01-05 16:45",
  },
];

export default function AdminAccountManagement() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AdminAccount[]>(
    mockAdminAccounts,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<AdminAccount | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  // 管理画面モードの設定（Portal対応）
  React.useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    return () => {
      document.body.removeAttribute('data-admin');
    };
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "facility_admin",
    password: "",
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "system_admin":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            システム管理者
          </Badge>
        );
      case "facility_admin":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            編集者
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleOpenDialog = (account?: AdminAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        email: account.email,
        role: account.role,
        password: "",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: "",
        email: "",
        role: "facility_admin",
        password: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingAccount) {
      // 編集
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccount.id
            ? {
                ...acc,
                name: formData.name,
                email: formData.email,
                role: formData.role as any,
              }
            : acc,
        ),
      );
      toast.success("アカウント情報を更新しました");
    } else {
      // 新規作成
      const newAccount: AdminAccount = {
        id: `admin-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role as any,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAccounts((prev) => [...prev, newAccount]);
      toast.success("新しいアカウントを作成しました");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このアカウントを削除しますか？")) {
      setAccounts((prev) =>
        prev.filter((acc) => acc.id !== id),
      );
      toast.success("アカウントを削除しました");
    }
  };

  const handleNavigate = (
    page: 
      | "dashboard" 
      | "members" 
      | "accounts" 
      | "master-stages"
      | "master-songs"
      | "master-sound-categories"
      | "master-sounds"
      | "master-survey-options"
      | "news"
      | "groups"
      | "pages",
  ) => {
    if (page === "dashboard") {
      navigate("/admin/dashboard");
    }
    if (page === "members") {
      navigate("/admin/members");
    }
    if (page === "master-stages") {
      navigate("/admin/master/stages");
    }
    if (page === "master-songs") {
      navigate("/admin/master/songs");
    }
    if (page === "master-sound-categories") {
      navigate("/admin/master/sound-categories");
    }
    if (page === "master-sounds") {
      navigate("/admin/master/sounds");
    }
    if (page === "master-survey-options") {
      navigate("/admin/master/survey-options");
    }
    if (page === "news") {
      navigate("/admin/news");
    }
    if (page === "groups") {
      navigate("/admin/groups");
    }
    if (page === "pages") {
      navigate("/admin/pages");
    }
    // accounts は現在の画面なので何もしない
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        currentPage="accounts"
        isCollapsed={isSidebarCollapsed}
        onToggle={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
      />

      {/* Main Content with offset */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64",
        )}
      >
        {/* Header */}
        <header className="border-b border-border bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                アカウント管理
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>管理者アカウント一覧</CardTitle>
                    <CardDescription>
                      登録されている管理者アカウント:{" "}
                      {accounts.length}件
                    </CardDescription>
                  </div>
                </div>
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      新規アカウント作成
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white text-gray-900 font-sans">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">
                        {editingAccount
                          ? "アカウント編集"
                          : "新規アカウント作成"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        管理者アカウントの情報を入力してください
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-900">氏名</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="山田 太郎"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900">
                          メールアドレス
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="example@admin.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-900">権限</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              role: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system_admin">
                              システム管理者
                            </SelectItem>
                            <SelectItem value="facility_admin">
                              編集者
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-900">
                          パスワード{" "}
                          {editingAccount &&
                            "(変更する場合のみ)"}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          placeholder="パスワード"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
                      >
                        キャンセル
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {editingAccount ? "更新" : "作成"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>氏名</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead>最終ログイン</TableHead>
                    <TableHead className="text-right">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-transparent">
                      <TableCell className="font-medium">
                        {account.name}
                      </TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>
                        {getRoleBadge(account.role)}
                      </TableCell>
                      <TableCell>{account.createdAt}</TableCell>
                      <TableCell>
                        {account.lastLoginAt || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleOpenDialog(account)
                            }
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDelete(account.id)
                            }
                            className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
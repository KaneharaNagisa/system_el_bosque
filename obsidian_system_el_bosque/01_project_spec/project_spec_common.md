アプリの確定仕様（Copilotの物忘れ防止）

# プロジェクト確定仕様書

## プロジェクト概要

- アプリ名: エルボスケ予約システム
- 目的: エルボスケというシステム依頼者が所有しているログハウスの一棟貸しの予約システムを構築

## 技術スタック

- フロントエンド: React、Inertia.js
- バックエンド: Laravel
- DB / 環境: Docker (コンテナ名: system_el_bosque)

## 絶対に崩してはいけない重要仕様

Reactは「Inertia.js」を利用してLaravelとつなげてください。

### エンドユーザー画面：要件

01_project_spec/admin/project_spec_common_enduser

### 管理画面：要件

01_project_spec/admin/project_spec_common_admin

## 禁止事項

### システム全体共通

- プロジェクト名\figma_temp内のソースは変更しないでください。

### エンドユーザー画面

-

### 管理画面

- 管理画面はPCでのみ操作のためレスポンシブ対応は不要です。

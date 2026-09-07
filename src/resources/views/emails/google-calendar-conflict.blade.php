<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Google Calendar Conflict</title>
</head>
<body style="font-family: sans-serif; color: #1f2937; line-height: 1.6;">
    <h2>【System El Bosque】Googleカレンダー予定と予約の重複を検知しました</h2>

    <p>以下の日付に、Googleカレンダーの予定と確定予約が重複しています。</p>

    <ul>
        @foreach ($dates as $date)
            <li>{{ $date }}</li>
        @endforeach
    </ul>

    <p>該当日の予約枠はGoogleカレンダー同期で手動ブロックに設定されていますが、既存予約がある日です。確認と対応をお願いします。</p>
</body>
</html>

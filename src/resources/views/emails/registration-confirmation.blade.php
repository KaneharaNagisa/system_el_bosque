<!doctype html>
<html lang="ja">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>本会員登録のご案内</title>
</head>
<body style="margin:0; padding:0; background:#f4f1e8; color:#2c1e10; font-family:'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height:1.8;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1e8; padding:32px 16px;">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#ffffff; border:1px solid #e4ddcd;">
					<tr>
						<td style="padding:28px 32px; background:#1e3c0e; color:#ffffff;">
							<p style="margin:0; font-size:20px; font-weight:bold;">System El Bosque</p>
							<p style="margin:4px 0 0; font-size:14px;">本会員登録のご案内</p>
						</td>
					</tr>
					<tr>
						<td style="padding:32px; font-size:15px;">
							<p style="margin:0 0 20px;">{{ $recipientEmail }} 様</p>
							<p style="margin:0 0 20px;">このたびは、会員登録の仮登録をいただき、誠にありがとうございます。</p>
							<p style="margin:0 0 24px;">以下のボタンから本会員登録へお進みください。</p>
							<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px;">
								<tr>
									<td style="background:#1e3c0e;">
										<a href="{{ $registrationUrl }}" style="display:inline-block; padding:14px 24px; color:#ffffff; font-weight:bold; text-decoration:none;">本会員登録へ進む</a>
									</td>
								</tr>
							</table>
							<p style="margin:0 0 20px; color:#6b5845; font-size:14px;">このURLの有効期限は、仮登録から1時間です。期限を過ぎた場合は、お手数ですが会員登録画面から再度仮登録をお願いいたします。</p>
							<p style="margin:0; color:#6b5845; font-size:14px;">ボタンをクリックできない場合は、以下のURLをブラウザに貼り付けてください。<br><a href="{{ $registrationUrl }}" style="color:#1e3c0e; overflow-wrap:anywhere;">{{ $registrationUrl }}</a></p>
						</td>
					</tr>
					<tr>
						<td style="padding:20px 32px; border-top:1px solid #e4ddcd; color:#6b5845; font-size:13px;">
							このメールにお心当たりがない場合は、恐れ入りますが破棄してください。
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>

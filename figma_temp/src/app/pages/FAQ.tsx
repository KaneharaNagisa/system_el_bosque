import { useState } from "react";
import { Link } from "react-router";
import {
  FaChevronDown,
  FaCalendarAlt,
  FaHome,
  FaPaw,
  FaCar,
  FaLeaf,
  FaCommentDots,
} from "react-icons/fa";

const categories = [
  {
    label: "ご予約について",
    icon: <FaCalendarAlt size={16} color="#d4b070" />,
    faqs: [
      {
        q: "予約方法を教えてください",
        a: "当サイトの予約フォームよりお申し込みいただくか、メールにてご連絡ください。ご予約確定はメールにてご案内いたします。",
      },
      {
        q: "チェックイン・チェックアウト時間を教えてください",
        a: "チェックインは15:00以降、チェックアウトは11:00までを標準としています。ご都合に応じて事前にご相談ください。時間変更に応じられる場合があります。",
      },
      {
        q: "支払い方法を教えてください",
        a: "すべて来場時（当日）現金払いのみとなります。クレジットカード・電子マネー・銀行振込はご利用いただけません。",
      },
      {
        q: "連泊は可能ですか？",
        a: "もちろん可能です。連泊をご希望の場合は予約フォームにてご記入いただくか、メールにてお問い合わせください。",
      },
    ],
  },
  {
    label: "施設・設備について",
    icon: <FaHome size={16} color="#d4b070" />,
    faqs: [
      {
        q: "定員は何名ですか？",
        a: "最大10名様まで宿泊可能です。1〜5名様が基本料金で、6名以上の場合は1名追加につき¥3,000（曜日問わず一律）の追加料金が発生します。",
      },
      {
        q: "Wi-Fiはありますか？",
        a: "はい、高速Wi-Fiを完備しています。テレワーク・ワーケーションにも対応できる速度です。",
      },
      {
        q: "薪ストーブはどの時期に使えますか？",
        a: "秋〜冬（10月〜12月）が特に活躍します。春・夏は涼しいためエアコンで快適に過ごせます。薪は施設内にご用意しています（消耗した場合は薪割り体験で追加可）。",
      },
      {
        q: "駐車場はありますか？",
        a: "敷地内に無料駐車場を完備しています（2〜3台）。大型車でのアクセスの際はご相談ください。",
      },
      {
        q: "キッチンの設備を教えてください",
        a: "IHクッキングヒーター、冷蔵庫、電子レンジ、炊飯器、コーヒーメーカー、調理器具一式が揃っています。自炊が十分にお楽しみいただける設備です。",
      },
    ],
  },
  {
    label: "ペットについて",
    icon: <FaPaw size={16} color="#d4b070" />,
    faqs: [
      {
        q: "ペットを連れて来られますか？",
        a: "はい、ペット同伴を歓迎しています。小型犬2頭まで（1頭目¥2,500・2頭目¥1,500）、または大型犬2頭まで（1頭目¥3,500・2頭目¥2,500）ご一緒いただけます。",
      },
      {
        q: "ペットのルールを教えてください",
        a: "・必ずリードをつけてください\n・室内でのケージ利用を推奨します\n・排泄物は責任をもって処理してください\n・他のゲストへの配慮をお願いします\n・アレルギー対応のため、ご利用後の清掃にご協力ください",
      },
      {
        q: "対応していないペットはありますか？",
        a: "犬以外のペット（猫、鳥、爬虫類など）のご同伴はお断りしています。ご不明な場合はお問い��わせください。",
      },
    ],
  },
  {
    label: "送迎・買い出しサービスについて",
    icon: <FaCar size={16} color="#d4b070" />,
    faqs: [
      {
        q: "送迎サービスはどこから対応していますか？",
        a: "飯田市内および最寄りの飯田線各駅からの送迎に対応しています。1〜4名様は滞在サポート料（¥8,000）に含まれます。5名以上の場合は追加車両手配費として+¥5,000（人数に関係なく一律）が必要です。",
      },
      {
        q: "買い出し代行とはどのようなサービスですか？",
        a: "ご到着前に、飯田市内のスーパーで食材・飲料・日用品などをリストに基づいて代行購入するサービスです。BBQの食材も自由にお選びいただけます。",
      },
      {
        q: "送迎の時間はいつでも対応していますか？",
        a: "ご希望の時間をご予約時にお知らせください。深夜・早朝は対応できない場合があります。事前にご相談ください。",
      },
    ],
  },
  {
    label: "体験プログラムについて",
    icon: <FaLeaf size={16} color="#d4b070" />,
    faqs: [
      {
        q: "体験プログラムはいつでも参加できますか？",
        a: "田植えは5〜6月、稲刈りは9〜10月、夏野菜収穫は7〜8月の期間限定です。薪割り・BBQ・星空観察は通年ご参加いただけます。",
      },
      {
        q: "体験の予約は必要ですか？",
        a: "はい、事前のお申し込みが必要です。ご宿泊の予約と同時にお申し込みいただくか、前日までにお知らせください。",
      },
      {
        q: "子どもでも参加できる体験はありますか？",
        a: "夏野菜収穫・田植え・稲刈りは子ども連れで大人気です。薪割りは10歳以上を推奨しています。星空観察はどなたでもお楽しみいただけます。",
      },
      {
        q: "BBQ食材の提供はありますか？",
        a: "食材セットの提供はしていません。買い出しサポートで飯田市内のスーパーにてお客様が自由に食材をお選びいただけます。グリル機材は¥3,500でレンタルできます。",
      },
    ],
  },
  {
    label: "その他",
    icon: <FaCommentDots size={16} color="#d4b070" />,
    faqs: [
      {
        q: "喫煙はできますか？",
        a: "施設内（ログハウス内）は全面禁煙です。屋外の指定場所でのみ喫煙をお願いします。",
      },
      {
        q: "花火はできますか？",
        a: "森の中に位置する施設のため、火を使った花火はお断りしています。手持ち花火については事前にご相談ください。",
      },
      {
        q: "近隣への配慮について教えてください",
        a: "新野は静かな農村地帯です。夜22:00以降は音楽・大声はお控えください。ご近所の方々と共存するため、マナーを守ったご利用をお願いします。",
      },
      {
        q: "緊急時の連絡先はありますか？",
        a: "ご予約確定時に緊急連絡先をお知らせします。医療機関は飯田市内の病院が最寄りです（車で約40分）。",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(180,140,80,0.15)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          padding: "1.25rem 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: "0.9rem", color: "#2c1e10", fontWeight: 500, lineHeight: 1.6 }}>
          Q. {q}
        </span>
        <FaChevronDown
          size={14}
          color="#1e3c0e"
          style={{
            flexShrink: 0,
            marginTop: "3px",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            paddingBottom: "1.25rem",
            paddingLeft: "1rem",
            borderLeft: "3px solid #d4b070",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "#5a4838",
              lineHeight: 2,
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
          padding: "8rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#d4b070",
            fontSize: "0.72rem",
            letterSpacing: "0.25em",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          FAQ
        </p>
        <h1
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            color: "#f0e8d0",
            lineHeight: 1.3,
          }}
        >
          よくある質問
        </h1>
        <p style={{ color: "rgba(240,232,208,0.7)", marginTop: "1rem", fontSize: "0.92rem" }}>
          ご不明な点はお気軽にお問い合わせください
        </p>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {categories.map((cat) => (
              <div
                key={cat.label}
                style={{
                  backgroundColor: "#faf5e8",
                  borderRadius: "4px",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(180,140,80,0.12)",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#1b2f0e",
                    padding: "1.1rem 1.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.15rem", display: "flex", alignItems: "center" }}>{cat.icon}</span>
                  <h2
                    style={{
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#f0e8d0",
                      margin: 0,
                    }}
                  >
                    {cat.label}
                  </h2>
                </div>
                <div style={{ padding: "0 1.75rem" }}>
                  {cat.faqs.map((faq) => (
                    <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            style={{
              marginTop: "3rem",
              backgroundColor: "#1b2f0e",
              borderRadius: "4px",
              padding: "2.5rem",
              textAlign: "center",
              border: "1px solid rgba(212,176,112,0.18)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#f0e8d0",
                marginBottom: "0.75rem",
              }}
            >
              お探しの答えが見つかりませんでしたか？
            </h3>
            <p
              style={{
                color: "rgba(240,232,208,0.72)",
                fontSize: "0.875rem",
                lineHeight: 1.9,
                marginBottom: "1.5rem",
              }}
            >
              お気軽にお問い合わせください。
              <br />
              メールにてご返答いたします（通常2〜3営業日以内）。
            </p>
            <Link
              to="/contact"
              style={{
                display: "inline-block",
                backgroundColor: "#5c2e12",
                color: "#f0e8d0",
                padding: "0.875rem 2rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "1px solid rgba(212,176,112,0.2)",
              }}
            >
              お問い合わせフォーム
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
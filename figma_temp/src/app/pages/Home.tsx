import { useState } from "react";
import { Link } from "react-router";
import {
  FaWifi, FaPaw, FaCar, FaStar, FaChevronRight,
  FaLeaf, FaFire, FaTree, FaBell, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const HERO_IMG =
  "https://images.unsplash.com/photo-1709209509834-d02055e6f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920";
const LAKE_IMG =
  "https://images.unsplash.com/photo-1762099375590-c0da4daa3d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const INTERIOR_IMG =
  "https://images.unsplash.com/photo-1661885546898-11ebd4ce29e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const STARS_IMG =
  "https://images.unsplash.com/photo-1570399747403-6f3af992698f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const BBQ_IMG =
  "https://images.unsplash.com/photo-1763062690254-be377d55dacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

const features = [
  {
    icon: <FaTree size={26} color="#d4b070" />,
    title: "森の静寂",
    desc: "巣山湖のほとり、深い森に囲まれた一棟貸しのログハウス。都会の喧騒を忘れて、自然の中でリフレッシュ。",
  },
  {
    icon: <FaPaw size={26} color="#d4b070" />,
    title: "ペットOK",
    desc: "小型犬2頭、または大型犬2頭まで歓迎。大切な家族と一緒にお過ごしください。",
  },
  {
    icon: <FaCar size={26} color="#d4b070" />,
    title: "送迎・買い出しサポート",
    desc: "飯田市・最寄駅からの送迎サービスや、到着前の買い出し代行で、安心の滞在をお約束します。",
  },
  {
    icon: <FaWifi size={26} color="#d4b070" />,
    title: "Wi-Fi完備",
    desc: "高速Wi-Fi搭載でワーケーションにも最適。仕事と休暇を自由に組み合わせてお楽しみください。",
  },
  {
    icon: <FaFire size={26} color="#d4b070" />,
    title: "薪ストーブ",
    desc: "肌寒い季節には薪ストーブが心を温めます。パチパチと燃える炎のそばで過ごす夜は格別です。",
  },
  {
    icon: <FaLeaf size={26} color="#d4b070" />,
    title: "体験プログラム",
    desc: "田植え・稲刈り・薪割り・夏野菜収穫・BBQなど。南信州の大自然と暮らしに触れる体験が充実。",
  },
];

const seasons = [
  {
    month: "3〜5月",
    label: "春",
    desc: "新緑と野鳥の声。田植え体験や山歩きが楽しめます。",
  },
  {
    month: "6〜8月",
    label: "夏",
    desc: "涼しい高原の夏。夏野菜収穫やBBQ、星空観察を。",
  },
  {
    month: "9〜11月",
    label: "秋",
    desc: "紅葉と黄金の稲穂。稲刈り体験と温泉でほっこり。",
  },
  {
    month: "12月",
    label: "初冬",
    desc: "雪景色のログハウス。薪ストーブで温かな冬の休日。",
  },
];

const heroBadges = ["一棟貸し切り", "ペットOK", "Wi-Fi完備", "送迎サポート付"];

// ── トップ向けお知らせ（管理画面 target:"top"|"both" × status:"published" と同期） ──
interface TopNewsItem {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  isNew?: boolean;
}
const topNews: TopNewsItem[] = [
  {
    id: "NEWS-006",
    title: "2026年夏シーズン予約受付中",
    content: "夏シーズン（6月〜8月）のご予約を受付中です。夏野菜収穫体験・BBQグリルレンタル・星空ガイドなど夏ならではの体験オプションをご用意しています。標高の高い新野は夏でも涼しく、快適にお過ごしいただけます。",
    publishDate: "2026-06-01",
    isNew: true,
  },
  {
    id: "NEWS-003",
    title: "GW期間の予約受付開始",
    content: "ゴールデンウィーク期間（4/29〜5/5）の予約受付を開始いたしました。GW期間は特別料金期間となります。田植え体験もあわせてお楽しみください。お早めのご予約をおすすめします。",
    publishDate: "2026-03-01",
  },
  {
    id: "NEWS-002",
    title: "星空観察ガイドサービス開始",
    content: "新たに星空観察ガイドサービスを開始いたしました。専門スタッフが星座の解説をしながら南信州の夜空をご案内します。ガイドなし（無料）とガイド付き（1組¥2,000）からお選びいただけます。",
    publishDate: "2026-03-01",
  },
  {
    id: "NEWS-001",
    title: "2026年シーズン営業開始のお知らせ",
    content: "3月1日より2026年シーズンの営業を開始いたします。今シーズンも安心・快適な滞在をご提供できるよう、スタッフ一同心よりお待ちしております。ご不明な点はお問い合わせフォームよりご連絡ください。",
    publishDate: "2026-02-15",
  },
];

export function Home() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: "600px",
          overflow: "hidden",
        }}
      >
        <ImageWithFallback
          src={HERO_IMG}
          alt="エルボスケ外観"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(5,12,3,0.55) 0%, rgba(5,12,3,0.35) 45%, rgba(10,22,5,0.78) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 1.5rem",
          }}
        >
          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "1.75rem",
            }}
            className="hero-badges"
          >
            {heroBadges.map((badge) => (
              <span
                key={badge}
                style={{
                  backgroundColor: "rgba(212,176,112,0.18)",
                  border: "1px solid rgba(212,176,112,0.5)",
                  color: "#d4b070",
                  padding: "0.3rem 1rem",
                  borderRadius: "2px",
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <FaStar size={10} />
                {badge}
              </span>
            ))}
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
              color: "#d4b070",
              letterSpacing: "0.3em",
              marginBottom: "0.75rem",
              fontWeight: 400,
            }}
          >
            El bosque — 森の別荘
          </p>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
              fontWeight: 700,
              color: "#f5f0e5",
              lineHeight: 1.2,
              marginBottom: "1.5rem",
              textShadow: "0 2px 20px rgba(0,0,0,0.6)",
            }}
          >
            深い森の中の
            <br />
            ログハウスへ
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(0.9rem, 2.2vw, 1.15rem)",
              color: "rgba(240,232,210,0.85)",
              maxWidth: "560px",
              lineHeight: 1.9,
              marginBottom: "2.5rem",
            }}
          >
            長野県南信州・巣山湖畔。貸別荘エルボスケで過ごす、
            <br />
            自分だけの特別な時間。
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              to="/reservation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "#5c2e12",
                color: "#f5f0e5",
                padding: "0.9rem 2.2rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.05em",
                border: "1px solid rgba(212,176,112,0.3)",
                transition: "all 0.2s",
              }}
            >
              ご予約はこちら <FaChevronRight size={13} />
            </Link>
            <Link
              to="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#f5f0e5",
                padding: "0.9rem 2rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
                border: "1px solid rgba(255,255,255,0.25)",
                transition: "all 0.2s",
              }}
            >
              施設を見る <FaChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "40px",
              background:
                "linear-gradient(to bottom, transparent, rgba(212,176,112,0.7))",
            }}
          />
          <span
            style={{
              fontSize: "0.65rem",
              color: "rgba(212,176,112,0.7)",
              letterSpacing: "0.2em",
            }}
          >
            SCROLL
          </span>
        </div>
      </section>

      {/* ── News ── */}
      <section style={{ backgroundColor: "#f2e8d0", padding: "4.5rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>

          {/* セクションヘッダー */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
            <div>
              <p
                style={{
                  color: "#7a4020",
                  fontSize: "0.72rem",
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaBell size={11} color="#7a4020" />
                News
              </p>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.35rem, 3vw, 1.75rem)",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                お知らせ
              </h2>
            </div>
          </div>

          {/* お知らせリスト */}
          <div
            style={{
              backgroundColor: "#faf5e8",
              borderRadius: "4px",
              border: "1px solid rgba(180,140,80,0.18)",
              overflow: "hidden",
            }}
          >
            {topNews.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const isLast = idx === topNews.length - 1;
              const [y, m, d] = item.publishDate.split("-").map(Number);
              const dateStr = `${y}年${m}月${d}日`;

              return (
                <div
                  key={item.id}
                  style={{
                    borderBottom: isLast ? "none" : "1px solid rgba(180,140,80,0.12)",
                  }}
                >
                  {/* タイトル行 */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1.1rem 1.5rem",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "'Noto Sans JP', sans-serif",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,176,112,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    {/* 左帯 */}
                    <div
                      style={{
                        width: "3px",
                        alignSelf: "stretch",
                        borderRadius: "2px",
                        backgroundColor: isExpanded ? "#5c2e12" : "rgba(180,140,80,0.3)",
                        flexShrink: 0,
                        transition: "background-color 0.2s",
                      }}
                    />

                    {/* 本文エリア */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* 日付 + NEWバッジ */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "#8a7868",
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {dateStr}
                        </span>
                        {item.isNew && (
                          <span
                            style={{
                              backgroundColor: "#a03020",
                              color: "#fff",
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              padding: "0.1rem 0.45rem",
                              borderRadius: "2px",
                              letterSpacing: "0.08em",
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      {/* タイトル */}
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: isExpanded ? 700 : 500,
                          color: isExpanded ? "#5c2e12" : "#2c1e10",
                          lineHeight: 1.55,
                          display: "block",
                          transition: "color 0.2s",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    {/* 開閉アイコン */}
                    <span style={{ color: "#8a7868", flexShrink: 0 }}>
                      {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </span>
                  </button>

                  {/* 展開コンテンツ */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "0 1.5rem 1.25rem 3.5rem",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "rgba(92,46,18,0.04)",
                          border: "1px solid rgba(92,46,18,0.1)",
                          borderLeft: "3px solid #d4b070",
                          borderRadius: "2px",
                          padding: "1rem 1.25rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.87rem",
                            color: "#3a2c1e",
                            lineHeight: 1.9,
                            margin: 0,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ backgroundColor: "#f2e8d0", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p
              style={{
                color: "#7a4020",
                fontSize: "0.72rem",
                letterSpacing: "0.25em",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Features
            </p>
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                fontWeight: 700,
                color: "#1e3c0e",
                lineHeight: 1.4,
              }}
            >
              エルボスケで過ごす時間
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
            className="features-grid"
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: "#faf5e8",
                  borderRadius: "4px",
                  padding: "2rem 1.75rem",
                  border: "1px solid rgba(180,140,80,0.18)",
                  borderLeft: "3px solid #d4b070",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{ marginBottom: "1rem" }}>{f.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    marginBottom: "0.6rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.86rem", color: "#5a4838", lineHeight: 1.85 }}>
                  {f.desc}
                </p>
              </div>
            ))}

            {/* 周囲に住居なし バナー（全幅） */}
            <div
              style={{
                marginTop: "1.5rem",
                gridColumn: "1 / -1",
                backgroundColor: "rgba(30,60,14,0.07)",
                border: "1px solid rgba(30,60,14,0.18)",
                borderLeft: "4px solid #1e3c0e",
                borderRadius: "4px",
                padding: "1.1rem 1.4rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.9rem",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  backgroundColor: "#1e3c0e",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                <svg viewBox="0 0 20 20" width="15" height="15" fill="#d4b070">
                  <path d="M10 3L5 7H2a1 1 0 00-1 1v4a1 1 0 001 1h3l5 4V3z" />
                  <path d="M14.07 5.93a7 7 0 010 8.14M16.95 3.05a11 11 0 010 13.9" stroke="#d4b070" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    marginBottom: "0.35rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  周囲に住居なし — 気兼ねなく過ごせる完全プライベート空間
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#5a4838",
                    lineHeight: 1.85,
                    margin: 0,
                  }}
                >
                  近隣に他の住居がないため、夜遅くまで大きな声で会話したり、ペットが鳴いても、楽器を弾いても、音楽を流しても問題ありません。周りを気にせず、自分たちだけの時間を思いきり楽しめます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seasons ── */}
      <section style={{ backgroundColor: "#1b2f0e", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
              Seasons
            </p>
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                fontWeight: 700,
                color: "#f0e8d0",
              }}
            >
              四季を感じる南信州
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1px",
              backgroundColor: "rgba(212,176,112,0.15)",
            }}
          >
            {seasons.map((season) => (
              <div
                key={season.label}
                style={{
                  backgroundColor: "#1b2f0e",
                  padding: "2.5rem 1.75rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#d4b070",
                    fontSize: "0.72rem",
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                    textTransform: "uppercase",
                  }}
                >
                  {season.month}
                </div>
                <div
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#f0e8d0",
                    marginBottom: "1rem",
                  }}
                >
                  {season.label}
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(240,232,208,0.72)",
                    lineHeight: 1.8,
                  }}
                >
                  {season.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Mini ── */}
      <section style={{ backgroundColor: "#f2e8d0", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "#7a4020",
                  fontSize: "0.72rem",
                  letterSpacing: "0.25em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                Log House
              </p>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  lineHeight: 1.45,
                  marginBottom: "1.5rem",
                }}
              >
                巣山湖のほとりに佇む
                <br />
                特別なログハウス
              </h2>
              <p
                style={{
                  color: "#5a4838",
                  lineHeight: 2,
                  fontSize: "0.92rem",
                  marginBottom: "1rem",
                }}
              >
                「El bosque（エル ボスケ）」はスペイン語で「森」。長野県南信州、阿南町新野の巣山湖畔に位置するこのログハウスは、手付かずの森と静かな湖に囲まれた、特別な一棟貸し施設です。
              </p>
              <p
                style={{
                  color: "#5a4838",
                  lineHeight: 2,
                  fontSize: "0.92rem",
                  marginBottom: "2rem",
                }}
              >
                薪ストーブの温もりと、夜には満天の星空が広がります。標高の高い新野は夏でも涼しく、四季折々の自然を満喫できます。
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderBottom: "2px solid #d4b070",
                  paddingBottom: "0.2rem",
                }}
              >
                <Link
                  to="/about"
                  style={{
                    color: "#1e3c0e",
                    textDecoration: "none",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  施設の詳細を見る <FaChevronRight size={11} />
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <ImageWithFallback
                src={INTERIOR_IMG}
                alt="ログハウス内装"
                style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "4px" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="home-img-subgrid">
                <ImageWithFallback
                  src={LAKE_IMG}
                  alt="巣山湖"
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px" }}
                />
                <ImageWithFallback
                  src={STARS_IMG}
                  alt="星空"
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Price Intro ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
          padding: "6rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              color: "#d4b070",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Price From
          </p>
          <h2
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
              fontWeight: 700,
              color: "#f0e8d0",
              marginBottom: "0.75rem",
            }}
          >
            料金のご案内
          </h2>
          <p
            style={{
              color: "rgba(240,232,208,0.65)",
              fontSize: "0.88rem",
              marginBottom: "2.5rem",
            }}
          >
            ※ 基本宿泊料＋滞在サポート料¥8,000の合計（別途保証料¥10,000・トラブルなければ返金）
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              backgroundColor: "rgba(212,176,112,0.15)",
              marginBottom: "2.5rem",
            }}
            className="price-grid"
          >
            {[
              { label: "平日", sub: "日〜木", price: "¥28,000〜" },
              { label: "休前日", sub: "金・土", price: "¥34,000〜" },
              { label: "特別日", sub: "GW・お盆等", price: "¥41,000〜" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#d4b070",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    marginBottom: "0.25rem",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: "rgba(240,232,208,0.55)",
                    fontSize: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {item.sub}
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#f0e8d0",
                    fontFamily: "'Noto Serif JP', serif",
                  }}
                >
                  {item.price}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "#d4b070",
                color: "#1b2f0e",
                padding: "0.85rem 2rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              料金の詳細を見る <FaChevronRight size={12} />
            </Link>
            <Link
              to="/reservation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "transparent",
                color: "#f0e8d0",
                padding: "0.85rem 2rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "1px solid rgba(240,232,208,0.35)",
              }}
            >
              ご予約 <FaChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BBQ Photo Strip ── */}
      <section style={{ position: "relative", height: "320px", overflow: "hidden" }}>
        <ImageWithFallback
          src={BBQ_IMG}
          alt="BBQシーン"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,22,5,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              color: "#d4b070",
              fontSize: "0.72rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Experiences
          </p>
          <h2
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "#f0e8d0",
              marginBottom: "1.25rem",
            }}
          >
            豊かな体験プログラム
          </h2>
          <Link
            to="/experiences"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#d4b070",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 700,
              border: "1px solid rgba(212,176,112,0.5)",
              padding: "0.6rem 1.5rem",
              borderRadius: "3px",
            }}
          >
            体験を見る <FaChevronRight size={11} />
          </Link>
        </div>
      </section>
    </div>
  );
}
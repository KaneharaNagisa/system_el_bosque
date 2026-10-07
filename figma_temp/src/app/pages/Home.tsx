import image_260924_0103 from '@/imports/260924-0103.jpg'
import image_260924_0074_1 from '@/imports/260924-0074-1.jpg'
import image_260924_0074 from '@/imports/260924-0074.jpg'
import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FaWifi, FaPaw, FaCar, FaStar, FaChevronRight,
  FaLeaf, FaFire, FaTree, FaBell, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import heroLakeSrc from "../../imports/260924-0111.jpg";
import heroCabinSrc from "../../imports/260924-0015.jpg";

const HERO_SLIDES = [heroLakeSrc, heroCabinSrc];
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
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: "640px",
          overflow: "hidden",
        }}
      >
        {/* 背景写真：クロスフェードスライドショー */}
        {HERO_SLIDES.map((src, i) => (
          <ImageWithFallback
            key={src}
            src={src}
            alt="エルボスケの風景"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: i === 1 ? "center 50%" : "center 40%",
              opacity: heroIndex === i ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
              zIndex: heroIndex === i ? 1 : 0,
            }}
          />
        ))}

        {/* グラデーションオーバーレイ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: [
              "linear-gradient(to bottom,",
              "  rgba(255,255,255,0.72) 0%,",
              "  rgba(255,255,255,0.42) 18%,",
              "  rgba(255,255,255,0.08) 36%,",
              "  rgba(0,0,0,0) 52%,",
              "  rgba(0,0,0,0.18) 72%,",
              "  rgba(0,0,0,0.48) 100%",
              ")",
            ].join(" "),
          }}
        />

        {/* コンテンツ */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "72px 1.5rem 3rem",
          }}
        >
          {/* ── メインコピー・CTA ── */}
          <div
            style={{
              textAlign: "center",
            }}
          >
            {/* Badges */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
              className="hero-badges"
            >
              {heroBadges.map((badge) => (
                <span
                  key={badge}
                  style={{
                    backgroundColor: "rgba(80,40,15,0.75)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#ffffff",
                    padding: "0.28rem 0.9rem",
                    borderRadius: "20px",
                    fontSize: "0.73rem",
                    letterSpacing: "0.08em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <FaStar size={9} />
                  {badge}
                </span>
              ))}
            </div>

            {/* Main Title */}
            <h1
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(1.85rem, 5.5vw, 3.6rem)",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.25,
                marginBottom: "1rem",
                textShadow: "0 2px 16px rgba(0,0,0,0.55)",
              }}
            >
              深い森の中の
              <br />
              ログハウスへ
            </h1>

            {/* Sub */}
            <p
              style={{
                fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
                color: "rgba(255,255,255,0.88)",
                maxWidth: "520px",
                margin: "0 auto 2rem",
                lineHeight: 1.9,
                textShadow: "0 1px 8px rgba(0,0,0,0.4)",
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
                  backgroundColor: heroIndex === 1 ? "#256840" : "#c8251a",
                  color: "#ffffff",
                  padding: "0.85rem 2rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  letterSpacing: "0.04em",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  transition: "background-color 1.5s ease-in-out",
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
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  padding: "0.85rem 1.75rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "0.92rem",
                  border: "1px solid rgba(255,255,255,0.45)",
                  backdropFilter: "blur(6px)",
                  transition: "all 0.2s",
                }}
              >
                施設を見る <FaChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.35rem",
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: "1px",
              height: "36px",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))",
            }}
          />
          <span
            style={{
              fontSize: "0.62rem",
              color: "rgba(255,255,255,0.65)",
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
                  color: "#7a4a1e",
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
                <FaBell size={11} color="#7a4a1e" />
                News
              </p>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.35rem, 3vw, 1.75rem)",
                  fontWeight: 700,
                  color: "#7a4a1e",
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
              borderRadius: "12px",
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
                        borderRadius: "8px",
                        backgroundColor: isExpanded ? "#7a4a1e" : "rgba(180,140,80,0.3)",
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
                              borderRadius: "8px",
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
                          color: isExpanded ? "#7a4a1e" : "#2c1e10",
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
                          borderRadius: "8px",
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
                color: "#7a4a1e",
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
                color: "#256840",
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
                  borderRadius: "12px",
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
                    color: "#7a4a1e",
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
                backgroundColor: "rgba(100,55,20,0.07)",
                border: "1px solid rgba(100,55,20,0.18)",
                borderLeft: "4px solid #7a4a1e",
                borderRadius: "12px",
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
                  backgroundColor: "#3abcb0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                <svg viewBox="0 0 20 20" width="15" height="15" fill="#ffffff">
                  <path d="M10 3L5 7H2a1 1 0 00-1 1v4a1 1 0 001 1h3l5 4V3z" />
                  <path d="M14.07 5.93a7 7 0 010 8.14M16.95 3.05a11 11 0 010 13.9" stroke="#ffffff" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#7a4a1e",
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
      <section style={{ backgroundColor: "#1e5c2e", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
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
                color: "#ffffff",
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
              backgroundColor: "rgba(80,180,100,0.2)",
            }}
          >
            {seasons.map((season) => (
              <div
                key={season.label}
                style={{
                  backgroundColor: "#1e5c2e",
                  padding: "2.5rem 1.75rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
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
                    color: "#ffffff",
                    marginBottom: "1rem",
                  }}
                >
                  {season.label}
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.68)",
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
                  color: "#7a4a1e",
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
                  color: "#256840",
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
                    color: "#7a4a1e",
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
                src={image_260924_0074_1}
                alt="ログハウス内装"
                style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "12px" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="home-img-subgrid">
                <ImageWithFallback
                  src={image_260924_0103}
                  alt="巣山湖"
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "12px" }}
                />
                <ImageWithFallback
                  src={STARS_IMG}
                  alt="星空"
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "12px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Price Intro ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #55cce8 0%, #3abcb0 100%)",
          padding: "6rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
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
              color: "#ffffff",
              marginBottom: "0.75rem",
            }}
          >
            料金のご案内
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
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
              backgroundColor: "rgba(255,255,255,0.2)",
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
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
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
                    color: "rgba(255,255,255,0.6)",
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
                    color: "#ffffff",
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
                backgroundColor: "#f5ede0",
                color: "#5c3317",
                padding: "0.85rem 2rem",
                borderRadius: "12px",
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
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#ffffff",
                padding: "0.85rem 2rem",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "1px solid rgba(255,255,255,0.5)",
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
            background: "rgba(0,0,0,0.52)",
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
              borderRadius: "12px",
            }}
          >
            体験を見る <FaChevronRight size={11} />
          </Link>
        </div>
      </section>
    </div>
  );
}
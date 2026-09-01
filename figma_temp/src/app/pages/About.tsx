import bbqPhoto from "figma:asset/c232c6053b1490db7b5dc90637581a4da86b4682.png";
import cabinPhoto from "figma:asset/0b3064ec72e9db4af32817c032fdcc52faa8d748.png";
import livingPhoto from "figma:asset/cefee1687153313be4a93e924c2d47762b764e35.png";
import kitchenPhoto from "figma:asset/051ba647ed3b30d30bbf8b5eb0e7a7d11aa5aa53.png";
import loftPhoto from "figma:asset/4776090ab6a75676e3ccee00c2cda4a78c0952e8.png";
import { Link } from "react-router";
import {
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaSmokingBan,
  FaDog,
  FaTrash,
  FaVolumeMute,
  FaFire,
  FaCouch,
  FaUtensils,
  FaBath,
  FaBed,
  FaLayerGroup,
  FaLeaf,
  FaVolumeUp,
} from "react-icons/fa";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/* ── 画像 ── */
const IMG_LIVING =
  "https://images.unsplash.com/photo-1768413309479-2f3416829a19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const IMG_KITCHEN =
  "https://images.unsplash.com/photo-1649446326916-a25f51098f32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const IMG_LOFT =
  "https://images.unsplash.com/photo-1706048111522-e4865f909940?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const IMG_BBQ =
  "https://images.unsplash.com/photo-1703782997446-fba282cbfce6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const IMG_LAKE =
  "https://images.unsplash.com/photo-1760243875402-57c8dd5a8cf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const IMG_STARS =
  "https://images.unsplash.com/photo-1715535478808-8b01355c7c8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

/* ── ギャラリー ── */
const gallery = [
  { src: livingPhoto, alt: "リビング・薪ストーブ", caption: "リビング・薪ストーブ" },
  { src: kitchenPhoto, alt: "キッチン", caption: "フルキッチン" },
  { src: loftPhoto, alt: "ロフト寝室", caption: "ロフト寝室" },
  { src: IMG_LAKE, alt: "巣山湖", caption: "すぐそばの巣山湖" },
  { src: bbqPhoto, alt: "BBQ", caption: "BBQ" },
  { src: IMG_STARS, alt: "満天の星空", caption: "満天の星空" },
];

/* ── 設備・アメニティ ── */
const amenityCategories = [
  {
    label: "リビング・ダイニング",
    icon: <FaCouch size={15} color="#1e3c0e" />,
    items: [
      "ソファ・ダイニングテーブル",
      "薪ストーブ",
      "Wi-Fi完備",
      "書棚・ボードゲーム",
    ],
  },
  {
    label: "キッチン",
    icon: <FaUtensils size={15} color="#1e3c0e" />,
    items: [
      "冷蔵庫（大型）",
      "IHコンロ（2口）",
      "電子レンジ・オーブントースター",
      "炊飯器",
      "電気ケトル",
      "食器・調理器具一式",
      "調味料（基本セット）",
    ],
  },
  {
    label: "バス・トイレ",
    icon: <FaBath size={15} color="#1e3c0e" />,
    items: [
      "バスルーム（浴槽あり）",
      "シャワー",
      "洗面台",
      "トイレ",
      "ドライヤー",
      "ボディソープ・シャンプー",
    ],
  },
  {
    label: "寝室",
    icon: <FaBed size={15} color="#1e3c0e" />,
    items: [
      "ロフト寝室（布団6セット）",
      "毛布・枕（全員分）",
    ],
  },
  {
    label: "タオル・寝具",
    icon: <FaLayerGroup size={15} color="#1e3c0e" />,
    items: [
      "バスタオル（全員分）",
      "フェイスタオル（全員分）",
      "掛け布団・敷き布団（全員分）",
      "枕カバー・シーツ",
    ],
  },
  {
    label: "ベランダ・屋外",
    icon: <FaLeaf size={15} color="#1e3c0e" />,
    items: [
      "ウッドデッキ",
      "アウトドテーブル・チェア",
      "BBQグリル（レンタル¥3,500）",
      "焚き火台（要申請）",
      "駐車場（無料・3台）",
    ],
  },
];

/* ── 利用ルール ── */
const rules = [
  {
    icon: <FaSmokingBan size={15} color="#7a4020" />,
    text: "施設内は全館禁煙です。喫煙は指定の屋外スペースにてお願いします。",
  },
  {
    icon: <FaDog size={15} color="#7a4020" />,
    text: "ペットは小型犬2頭または大型犬2頭まで。就寝時はケージをご用ください。",
  },
  {
    icon: <FaTrash size={15} color="#7a4020" />,
    text: "ゴミは分別のうえ、指定の回収袋に入れてご退去時にまとめて所定の場所へ。",
  },
  {
    icon: <FaFire size={15} color="#7a4020" />,
    text: "BBQ・焚き火は指定エリアのみ可。火の後始末は必ず完全に消火してください。",
  },
  {
    icon: <FaExclamationTriangle size={15} color="#7a4020" />,
    text: "定員を超えての宿泊はお断りしています。追加ゲストは事前にご相談ください。",
  },
];

/* ── セクションタイトル共通スタイル ── */
const SectionHeading = ({
  en,
  ja,
  dark = false,
}: {
  en: string;
  ja: string;
  dark?: boolean;
}) => (
  <div style={{ textAlign: "center", marginBottom: "3rem" }}>
    <p
      style={{
        color: dark ? "#d4b070" : "#7a4020",
        fontSize: "0.72rem",
        letterSpacing: "0.25em",
        fontWeight: 700,
        textTransform: "uppercase",
        marginBottom: "0.5rem",
      }}
    >
      {en}
    </p>
    <h2
      style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
        fontWeight: 700,
        color: dark ? "#f0e8d0" : "#1e3c0e",
      }}
    >
      {ja}
    </h2>
  </div>
);

export function About() {
  return (
    <div>
      {/* ── ページヘッダー ── */}
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
          About El bosque
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
          施設紹介
        </h1>
        <p
          style={{
            color: "rgba(240,232,208,0.65)",
            marginTop: "0.85rem",
            fontSize: "0.88rem",
          }}
        >
          木の温もりと森の静けさ、巣山湖のほとりに佇む特別な空間
        </p>
      </div>

      {/* ── ログハウス介紹 ── */}
      <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
            className="about-intro-grid"
          >
            {/* 左：テキスト */}
            <div>
              <p
                style={{
                  color: "#c47a30",
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "0.85rem",
                }}
              >
                Log House
              </p>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
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
                  fontSize: "0.88rem",
                  lineHeight: 2,
                  marginBottom: "1rem",
                }}
              >
                「El bosque（エル ボスケ）」はスペイン語で「森」を意味します。長野県南信州、阿南町新野の巣山湖畔に位置するこのログハウスは、手付かずの森と静かな湖に囲まれた、特別な一棟貸し施設です。
              </p>
              <p
                style={{
                  color: "#5a4838",
                  fontSize: "0.88rem",
                  lineHeight: 2,
                  marginBottom: "2rem",
                }}
              >
                木の温もりあふれる空間には薪ストーブが鎮座し、夜には満天の星空が広がります。標高の高い新野は夏でも涼しく、自然の恵みを満喫できます。
              </p>

              {/* 周囲に住居なし メリットバナー */}
              <div
                style={{
                  backgroundColor: "rgba(30,60,14,0.07)",
                  border: "1px solid rgba(30,60,14,0.18)",
                  borderLeft: "4px solid #1e3c0e",
                  borderRadius: "4px",
                  padding: "1rem 1.25rem",
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.85rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#1e3c0e",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "0.1rem",
                  }}
                >
                  <FaVolumeUp size={14} color="#d4b070" />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#1e3c0e",
                      marginBottom: "0.35rem",
                      letterSpacing: "0.03em",
                    }}
                  >
                    周囲に住居なし — 気兼ねなく過ごせる完全プライベート空間
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#5a4838",
                      lineHeight: 1.85,
                      margin: 0,
                    }}
                  >
                    近隣に他の住居がないため、夜遅くまで大きな声で会話したり、ペットが鳴いても、楽器を弾いても、音楽を流しても問題ありません。周りを気にせず、自分たちだけの時間を思いきり楽しめます。
                  </p>
                </div>
              </div>

              {/* スペック 2×2グリッド */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0",
                  border: "1px solid rgba(180,140,80,0.25)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
                className="about-spec-grid"
              >
                {[
                  { label: "定員", value: "最大10名（推奨1〜5名）" },
                  { label: "タイプ", value: "一棟貸し切り" },
                  { label: "営業期間", value: "3月〜12月" },
                  { label: "ペット", value: "小型犬2頭 or 大型犬2頭" },
                ].map((spec, idx) => (
                  <div
                    key={spec.label}
                    style={{
                      padding: "1rem 1.25rem",
                      backgroundColor: idx % 2 === 0 ? "#faf5e8" : "#f5edd8",
                      borderRight: idx % 2 === 0 ? "1px solid rgba(180,140,80,0.2)" : "none",
                      borderBottom: idx < 2 ? "1px solid rgba(180,140,80,0.2)" : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "#8a7868",
                        fontWeight: 600,
                        marginBottom: "0.3rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {spec.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        color: "#2c1e10",
                        fontWeight: 600,
                      }}
                    >
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右：写真 */}
            <div>
              <img
                src={cabinPhoto}
                alt="エルボスケ外観"
                style={{
                  width: "100%",
                  height: "460px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── フォトギャラリー ── */}
      <section style={{ backgroundColor: "#faf5e8", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeading en="Photo Gallery" ja="フォトギャラリー" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "240px 240px",
              gap: "0.6rem",
            }}
            className="about-gallery-grid"
          >
            {gallery.map((item, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <ImageWithFallback
                  src={item.src}
                  alt={item.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                    display: "block",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
                  }
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(to top, rgba(10,18,5,0.75) 0%, transparent 100%)",
                    padding: "1rem 0.85rem 0.6rem",
                  }}
                >
                  <p
                    style={{
                      color: "#f0e8d0",
                      fontSize: "0.8rem",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 設備・アメニティ ── */}
      <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <SectionHeading en="Facilities & Amenities" ja="設備・アメニティ" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {amenityCategories.map((cat) => (
              <div
                key={cat.label}
                style={{
                  backgroundColor: "#faf5e8",
                  border: "1px solid rgba(180,140,80,0.18)",
                  borderTop: "3px solid #1e3c0e",
                  borderRadius: "6px",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: "rgba(30,60,14,0.08)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1e3c0e",
                    }}
                  >
                    {cat.label}
                  </h3>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.3rem 0",
                        fontSize: "0.83rem",
                        color: "#4a3828",
                        borderBottom: "1px solid rgba(180,140,80,0.1)",
                      }}
                    >
                      <FaCheckCircle
                        size={11}
                        color="#452009"
                        style={{ flexShrink: 0 }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── チェックイン・チェックアウト ── */}
      <section style={{ backgroundColor: "#1b2f0e", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <SectionHeading en="Check-in / Check-out" ja="チェックイン・チェックアウト" dark />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* チェックイン */}
            <div
              style={{
                backgroundColor: "rgba(242,232,208,0.07)",
                border: "1px solid rgba(212,176,112,0.2)",
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "#d4b070",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <FaSignInAlt size={22} color="#ffffff" />
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#d4b070",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                チェックイン
              </div>
              <div
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  color: "#f0e8d0",
                  lineHeight: 1.2,
                }}
              >
                15:00〜
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(240,232,208,0.6)",
                  marginTop: "0.75rem",
                  lineHeight: 1.8,
                }}
              >
                ご到着が遅れる場合は事前にご連絡ください。深夜着（22:00以降）は別途ご相談が必要です。
              </p>
            </div>

            {/* チェックアウト */}
            <div
              style={{
                backgroundColor: "rgba(242,232,208,0.07)",
                border: "1px solid rgba(212,176,112,0.2)",
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "#d4b070",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <FaSignOutAlt size={22} color="#ffffff" />
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#d4b070",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                チェックアウト
              </div>
              <div
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  color: "#f0e8d0",
                  lineHeight: 1.2,
                }}
              >
                〜10:00
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(240,232,208,0.6)",
                  marginTop: "0.75rem",
                  lineHeight: 1.8,
                }}
              >
                チェックアウト後の荷物一時預かりには対応しておりません。お時間にゆとりを持ってご利用ください。
              </p>
            </div>
          </div>

          {/* 追加メモ */}
          <div
            style={{
              marginTop: "1.5rem",
              backgroundColor: "rgba(212,176,112,0.08)",
              border: "1px solid rgba(212,176,112,0.2)",
              borderRadius: "6px",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <FaClock size={15} color="#d4b070" style={{ flexShrink: 0 }} />
            <p
              style={{
                fontSize: "0.8rem",
                color: "rgba(240,232,208,0.7)",
                margin: 0,
                lineHeight: 1.8,
              }}
            >
              アーリーチェックイン（14:00〜）・レイトチェックアウト（〜11:00）は状況により対応可能な場合があります。事前にお問い合わせください。
            </p>
          </div>
        </div>
      </section>

      {/* ── 利用ルール ── */}
      <section style={{ backgroundColor: "#faf5e8", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <SectionHeading en="House Rules" ja="利用ルール" />
          <div
            style={{
              backgroundColor: "#f2e8d0",
              border: "1px solid rgba(180,140,80,0.2)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {rules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1.1rem 1.5rem",
                  borderBottom:
                    idx < rules.length - 1
                      ? "1px solid rgba(180,140,80,0.15)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "rgba(122,64,32,0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "0.1rem",
                  }}
                >
                  {rule.icon}
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#4a3828",
                    lineHeight: 1.9,
                    margin: 0,
                  }}
                >
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.78rem",
              color: "#8a7868",
              marginTop: "1.25rem",
              lineHeight: 1.8,
            }}
          >
            ルールを守ってご利用いただけない場合は、退去をお願いする場合があります。<br />
            快適な滞在のため、ご協力をよろしくお願いいたします。
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #1b2f0e 0%, #0e1a08 100%)",
          padding: "4.5rem 1.5rem",
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
          Reservation
        </p>
        <h2
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            color: "#f0e8d0",
            marginBottom: "0.75rem",
            lineHeight: 1.45,
          }}
        >
          森の静けさに包まれる、特別な時間を
        </h2>
        <p
          style={{
            color: "rgba(240,232,208,0.7)",
            marginBottom: "2rem",
            fontSize: "0.88rem",
            lineHeight: 1.9,
          }}
        >
          ご予約・お問い合わせはお気軽にどうぞ
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: "transparent",
              color: "#f0e8d0",
              padding: "0.8rem 1.75rem",
              borderRadius: "4px",
              border: "1px solid rgba(240,232,208,0.4)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            料金を確認 <FaChevronRight size={12} />
          </Link>
          <Link
            to="/reservation"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: "#c47a30",
              color: "#fff",
              padding: "0.8rem 1.75rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            予約・お問い合わせ <FaChevronRight size={12} />
          </Link>
        </div>
      </section>
    </div>
  );
}
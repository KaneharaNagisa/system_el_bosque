import { Link } from "react-router";
import {
  FaCalendarCheck,
  FaChevronRight,
  FaClock,
  FaLine,
  FaQuestionCircle,
} from "react-icons/fa";

const LINE_URL = "https://lin.ee/TONhASj";

export function Contact() {
  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, #5c3317 0%, #7d4820 100%)",
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
          Contact
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
          お問い合わせ
        </h1>
        <p
          style={{
            color: "rgba(240,232,208,0.7)",
            marginTop: "1rem",
            fontSize: "0.92rem",
          }}
        >
          ご質問・ご相談は公式LINEから承ります
        </p>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div
            style={{
              overflow: "hidden",
              backgroundColor: "#faf5e8",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(74,45,20,0.1)",
              border: "1px solid rgba(180,140,80,0.18)",
            }}
          >
            <div
              style={{
                padding: "3.5rem 2rem 3rem",
                textAlign: "center",
                borderBottom: "1px solid rgba(180,140,80,0.16)",
              }}
            >
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  margin: "0 auto 1.5rem",
                  borderRadius: "50%",
                  backgroundColor: "#256840",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(37,104,64,0.2)",
                }}
              >
                <FaLine size={42} aria-hidden="true" />
              </div>
              <p
                style={{
                  color: "#9a6b35",
                  fontSize: "0.72rem",
                  letterSpacing: "0.18em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "0.65rem",
                }}
              >
                El bosque Official LINE
              </p>
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(1.35rem, 3vw, 1.8rem)",
                  fontWeight: 700,
                  color: "#5c2e12",
                  marginBottom: "1rem",
                  lineHeight: 1.5,
                }}
              >
                公式LINEからお気軽に
                <br />
                お問い合わせください
              </h2>
              <p
                style={{
                  maxWidth: "560px",
                  margin: "0 auto 2rem",
                  color: "#5a4838",
                  fontSize: "0.9rem",
                  lineHeight: 2,
                }}
              >
                施設や設備、アクセス、ご予約前のご相談などを承ります。
                <br />
                友だち追加後、トーク画面からメッセージをお送りください。
              </p>
              <a
                href={LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.65rem",
                  minWidth: "280px",
                  maxWidth: "100%",
                  backgroundColor: "#256840",
                  color: "#ffffff",
                  padding: "1rem 2rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 6px 18px rgba(37,104,64,0.2)",
                }}
                aria-label="エルボスケ公式LINEを開く（新しいタブ）"
              >
                <FaLine size={22} aria-hidden="true" />
                公式LINEを友だち追加
                <FaChevronRight size={12} aria-hidden="true" />
              </a>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  color: "#8a7868",
                  fontSize: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <FaClock size={11} aria-hidden="true" />
                ご返信までお時間をいただく場合がございます
              </p>
            </div>

            <div
              className="contact-support-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
              }}
            >
              <div
                style={{
                  padding: "1.75rem",
                  textAlign: "center",
                  borderRight: "1px solid rgba(180,140,80,0.16)",
                }}
              >
                <FaQuestionCircle
                  size={22}
                  color="#9a6b35"
                  style={{ marginBottom: "0.75rem" }}
                  aria-hidden="true"
                />
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    color: "#5c2e12",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  よくある質問
                </h3>
                <p
                  style={{
                    color: "#6d5a49",
                    fontSize: "0.78rem",
                    lineHeight: 1.8,
                    marginBottom: "0.85rem",
                  }}
                >
                  よくいただくご質問をまとめています
                </p>
                <Link
                  to="/faq"
                  style={{
                    color: "#256840",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  質問を見る <FaChevronRight size={10} />
                </Link>
              </div>

              <div style={{ padding: "1.75rem", textAlign: "center" }}>
                <FaCalendarCheck
                  size={22}
                  color="#9a6b35"
                  style={{ marginBottom: "0.75rem" }}
                  aria-hidden="true"
                />
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    color: "#5c2e12",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  ご予約
                </h3>
                <p
                  style={{
                    color: "#6d5a49",
                    fontSize: "0.78rem",
                    lineHeight: 1.8,
                    marginBottom: "0.85rem",
                  }}
                >
                  宿泊のご予約は専用ページから承ります
                </p>
                <Link
                  to="/reservation"
                  style={{
                    color: "#256840",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  予約ページへ <FaChevronRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 560px) {
          .contact-support-grid {
            grid-template-columns: 1fr !important;
          }

          .contact-support-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid rgba(180,140,80,0.16);
          }
        }
      `}</style>
    </div>
  );
}

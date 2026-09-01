import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { FaBars, FaTimes, FaTree, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSignInAlt, FaUserCircle, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "\u30DB\u30FC\u30E0" },
  { path: "/about", label: "\u65BD\u8A2D\u7D39\u4ECB" },
  { path: "/pricing", label: "\u6599\u91D1" },
  { path: "/experiences", label: "\u4F53\u9A13\u30D7\u30ED\u30B0\u30E9\u30E0" },
  { path: "/area", label: "\u5468\u8FBA\u60C5\u5831" },
  { path: "/faq", label: "\u3088\u304F\u3042\u308B\u8CEA\u554F" },
  { path: "/contact", label: "\u304A\u554F\u3044\u5408\u308F\u305B" },
  { path: "/reservation", label: "\u3054\u4E88\u7D04" },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // スマホメニュー展開時にbodyスクロールをロック
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isHome = location.pathname === "/";

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#1c1408" }}>
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor:
            scrolled || !isHome
              ? "rgba(14, 26, 8, 0.97)"
              : "rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
          transition: "background-color 0.35s ease",
          boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.5)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,176,112,0.15)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <FaTree size={22} color="#d4b070" />
            <div>
              <div
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.04em",
                  lineHeight: 1.1,
                }}
              >
                {"\u8CB8\u5225\u8358\u30A8\u30EB\u30DC\u30B9\u30B1"}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#d4b070",
                  letterSpacing: "0.2em",
                  fontStyle: "italic",
                }}
              >
                El bosque
              </div>
            </div>
          </Link>

          {/* Desktop Nav - hidden below md(768px) */}
          <nav
            className="desktop-nav"
            style={{
              gap: "0.15rem",
              alignItems: "center",
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isReservation = item.path === "/reservation";
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: "0.45rem 0.8rem",
                    borderRadius: "0.3rem",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    color: isActive ? "#d4b070" : "#e8dcc0",
                    backgroundColor: isReservation
                      ? "#5c2e12"
                      : isActive
                      ? "rgba(212,176,112,0.12)"
                      : "transparent",
                    border: isReservation ? "1px solid rgba(212,176,112,0.3)" : "none",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    if (!isReservation)
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "rgba(212,176,112,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isReservation)
                      (e.currentTarget as HTMLElement).style.backgroundColor = isActive
                        ? "rgba(212,176,112,0.12)"
                        : "transparent";
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Login / MyPage Button */}
            <div style={{ marginLeft: "0.5rem", borderLeft: "1px solid rgba(212,176,112,0.2)", paddingLeft: "0.65rem" }}>
              {isLoggedIn ? (
                <Link
                  to="/mypage"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.3rem",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#d4b070",
                    backgroundColor: location.pathname === "/mypage" ? "rgba(212,176,112,0.15)" : "rgba(212,176,112,0.08)",
                    border: "1px solid rgba(212,176,112,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  <FaUserCircle size={14} />
                  マイページ
                </Link>
              ) : (
                <Link
                  to="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.3rem",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "#e8dcc0",
                    backgroundColor: location.pathname === "/login" ? "rgba(212,176,112,0.12)" : "transparent",
                    border: "1px solid rgba(240,232,208,0.2)",
                    transition: "all 0.2s",
                  }}
                >
                  <FaSignInAlt size={13} />
                  ログイン
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile hamburger + auth button - visible below md(768px) */}
          <div className="mobile-nav-toggle">
            {isLoggedIn ? (
              <Link
                to="/mypage"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.35rem 0.6rem",
                  borderRadius: "0.3rem",
                  textDecoration: "none",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#d4b070",
                  backgroundColor: "rgba(212,176,112,0.08)",
                  border: "1px solid rgba(212,176,112,0.25)",
                }}
              >
                <FaUserCircle size={13} />
                マイページ
              </Link>
            ) : (
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.35rem 0.6rem",
                  borderRadius: "0.3rem",
                  textDecoration: "none",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: "#e8dcc0",
                  border: "1px solid rgba(240,232,208,0.2)",
                }}
              >
                <FaSignInAlt size={12} />
                ログイン
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#e8dcc0",
                cursor: "pointer",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="メニューを開く"
            >
              <FaBars size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        className="mobile-menu"
      />

      {/* ── Mobile Drawer Panel (右からスライド) ── */}
      <nav
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          width: "100%",
          maxWidth: "320px",
          backgroundColor: "#0e1a08",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          boxShadow: menuOpen ? "-8px 0 30px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(212,176,112,0.15)",
            flexShrink: 0,
          }}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaTree size={18} color="#d4b070" />
            <div>
              <div
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.04em",
                  lineHeight: 1.1,
                }}
              >
                {"\u8CB8\u5225\u8358\u30A8\u30EB\u30DC\u30B9\u30B1"}
              </div>
              <div
                style={{
                  fontSize: "0.55rem",
                  color: "#d4b070",
                  letterSpacing: "0.2em",
                  fontStyle: "italic",
                }}
              >
                El bosque
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              background: "none",
              border: "1px solid rgba(212,176,112,0.2)",
              borderRadius: "6px",
              color: "#e8dcc0",
              cursor: "pointer",
              padding: "0.45rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            aria-label="メニューを閉じる"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <div style={{ flex: 1, padding: "1rem 1rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isReservation = item.path === "/reservation";
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#d4b070" : "#e8dcc0",
                  borderRadius: "0.4rem",
                  backgroundColor: isReservation
                    ? "#5c2e12"
                    : isActive
                    ? "rgba(212,176,112,0.1)"
                    : "transparent",
                  borderLeft: isActive && !isReservation ? "3px solid #d4b070" : "3px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <span>{item.label}</span>
                <FaChevronRight
                  size={10}
                  color={isActive ? "#d4b070" : "rgba(232,220,192,0.3)"}
                />
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer - Login/MyPage */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid rgba(212,176,112,0.12)",
            flexShrink: 0,
          }}
        >
          {isLoggedIn ? (
            <Link
              to="/mypage"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.4rem",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#d4b070",
                backgroundColor: "rgba(212,176,112,0.1)",
                border: "1px solid rgba(212,176,112,0.25)",
                transition: "all 0.2s",
              }}
            >
              <FaUserCircle size={16} />
              マイページ
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.4rem",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#e8dcc0",
                backgroundColor: "rgba(240,232,208,0.06)",
                border: "1px solid rgba(240,232,208,0.2)",
                transition: "all 0.2s",
              }}
            >
              <FaSignInAlt size={14} />
              ログイン
            </Link>
          )}
          <div
            style={{
              marginTop: "1rem",
              textAlign: "center",
              fontSize: "0.72rem",
              color: "rgba(138,122,104,0.6)",
              lineHeight: 1.6,
            }}
          >
            長野県下伊那郡阿南町新野
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#0e1a08",
          color: "#a09080",
          paddingTop: "3.5rem",
          borderTop: "1px solid rgba(212,176,112,0.12)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "2.5rem",
              paddingBottom: "3rem",
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "1.25rem",
                }}
              >
                <FaTree size={20} color="#d4b070" />
                <div>
                  <div
                    style={{
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#f0e8d0",
                    }}
                  >
                    {"\u8CB8\u5225\u8358\u30A8\u30EB\u30DC\u30B9\u30B1"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "#d4b070",
                      letterSpacing: "0.2em",
                      fontStyle: "italic",
                    }}
                  >
                    El bosque
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  lineHeight: 1.9,
                  color: "#8a7a68",
                }}
              >
                長野県南信州、巣山湖のほとり。
                <br />
                深い森に抱かれたログハウスで、
                <br />
                特別なひとときをお過ごしください。
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4
                style={{
                  color: "#d4b070",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  marginBottom: "1.1rem",
                  textTransform: "uppercase",
                }}
              >
                Menu
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      style={{
                        textDecoration: "none",
                        color: "#8a7a68",
                        fontSize: "0.85rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = "#d4b070")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = "#8a7a68")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                style={{
                  color: "#d4b070",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  marginBottom: "1.1rem",
                  textTransform: "uppercase",
                }}
              >
                Access
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <FaMapMarkerAlt
                    size={13}
                    color="#d4b070"
                    style={{ flexShrink: 0, marginTop: "3px" }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "#8a7a68", lineHeight: 1.7 }}>
                    〒399-1612
                    <br />
                    長野県下伊那郡阿南町
                    <br />
                    新野3728-96
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <FaEnvelope size={12} color="#d4b070" />
                  <span style={{ fontSize: "0.82rem", color: "#8a7a68" }}>
                    info@elbosque.jp
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <FaPhone size={12} color="#d4b070" />
                  <span style={{ fontSize: "0.82rem", color: "#8a7a68" }}>
                    お問い合わせはメールにて
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div>
              <h4
                style={{
                  color: "#d4b070",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  marginBottom: "1.1rem",
                  textTransform: "uppercase",
                }}
              >
                Info
              </h4>
              <div style={{ fontSize: "0.82rem", color: "#8a7a68", lineHeight: 2 }}>
                <div>営業期間：3月〜12月</div>
                <div>定員：最大6名（推奨1〜4名）</div>
                <div>タイプ：ログハウス一棟貸し</div>
                <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#1b2f0e",
                      color: "#d4b070",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      border: "1px solid rgba(212,176,112,0.25)",
                    }}
                  >
                    ペットOK
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#1b2f0e",
                      color: "#d4b070",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      border: "1px solid rgba(212,176,112,0.25)",
                    }}
                  >
                    Wi-Fi完備
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(212,176,112,0.12)",
              padding: "1.25rem 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <p style={{ fontSize: "0.78rem", color: "#5a4a38", margin: 0 }}>
              {"\u00A9 2026 \u8CB8\u5225\u8358\u30A8\u30EB\u30DC\u30B9\u30B1\uFF08El bosque\uFF09All rights reserved."}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#4a3a2a", margin: 0 }}>
              長野県下伊那郡阿南町新野
            </p>
            <Link
              to="/admin"
              style={{
                fontSize: "0.68rem",
                color: "#5a4a38",
                opacity: 0.45,
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.45")}
            >
              管理画面
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

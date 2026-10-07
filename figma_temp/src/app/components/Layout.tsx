import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { FaBars, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSignInAlt, FaUserCircle, FaChevronRight, FaCalendarAlt, FaStar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import logo4Src from "../../imports/logo4.png";
import logo1Src from "../../imports/logo1.png";
import logo4_1Src from "../../imports/logo4-1.png";
import logo10Src from "../../imports/logo10.png";

const navItems = [
  { path: "/", label: "ホーム" },
  { path: "/about", label: "施設紹介" },
  { path: "/pricing", label: "料金" },
  { path: "/experiences", label: "体験プログラム" },
  { path: "/area", label: "周辺情報" },
  { path: "/faq", label: "よくある質問" },
  { path: "/contact", label: "お問い合わせ" },
  { path: "/reservation", label: "ご予約" },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isHome = location.pathname === "/";
  const showWhiteBg = scrolled || !isHome;

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#1c2810" }}>
      {/* ── Header ── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          overflow: "visible",
          backgroundColor: showWhiteBg ? "#ffffff" : "transparent",
          backdropFilter: showWhiteBg ? "none" : "blur(4px)",
          transition: "background-color 0.35s ease, box-shadow 0.35s ease",
          boxShadow: showWhiteBg ? "0 2px 20px rgba(0,0,0,0.1)" : "none",
          borderBottom: showWhiteBg ? "1px solid rgba(45,112,69,0.12)" : "none",
        }}
      >
        {/* ── 3-column: left nav | spacer | right nav (logo is absolute) ── */}
        <div
          className="desktop-nav"
          style={{
            maxWidth: "1200px", margin: "0 auto",
            padding: "0 1rem",
            display: "grid",
            gridTemplateColumns: "1fr 110px 1fr",
            alignItems: "center",
            height: "68px",
            position: "relative",
          }}
        >
          {/* Left nav: 施設紹介・料金・体験プログラム・周辺情報 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.05rem", paddingRight: "5px" }}>
            {navItems.slice(1, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  style={{
                    padding: "0.45rem 0.6rem", borderRadius: "8px", textDecoration: "none",
                    fontSize: "0.8rem", fontWeight: 500, transition: "all 0.2s",
                    color: isActive ? "#7a4a1e" : "#4a2810",
                    backgroundColor: isActive ? "rgba(45,112,69,0.12)" : "transparent",
                    letterSpacing: "0.02em", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(45,112,69,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? "rgba(45,112,69,0.12)" : "transparent"; }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Center spacer: absolute logo bump lives here */}
          <div />

          {/* Right nav: よくある質問・お問い合わせ・ご予約 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "0.05rem", paddingLeft: "5px" }}>
            {navItems.slice(5).map((item) => {
              const isActive = location.pathname === item.path;
              const isReservation = item.path === "/reservation";
              return (
                <Link key={item.path} to={item.path}
                  style={{
                    padding: "0.45rem 0.6rem", borderRadius: "8px", textDecoration: "none",
                    fontSize: "0.8rem", fontWeight: isReservation ? 700 : 500, transition: "all 0.2s",
                    color: isReservation ? "#ffffff" : isActive ? "#7a4a1e" : "#4a2810",
                    backgroundColor: isReservation ? "#c8251a" : isActive ? "rgba(45,112,69,0.12)" : "transparent",
                    letterSpacing: "0.02em", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { if (!isReservation) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(45,112,69,0.1)"; }}
                  onMouseLeave={(e) => { if (!isReservation) (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? "rgba(45,112,69,0.12)" : "transparent"; }}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Login / MyPage */}
            <div style={{ marginLeft: "0.4rem", borderLeft: "1px solid rgba(45,112,69,0.25)", paddingLeft: "0.5rem" }}>
              {isLoggedIn ? (
                <Link to="/mypage" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.7rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.78rem", fontWeight: 700, color: "#7a4a1e", backgroundColor: "rgba(45,112,69,0.08)", border: "1px solid rgba(45,112,69,0.25)" }}>
                  <FaUserCircle size={13} />マイページ
                </Link>
              ) : (
                <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.7rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.78rem", fontWeight: 500, color: "#4a2810", border: "1px solid rgba(45,112,69,0.3)" }}>
                  <FaSignInAlt size={12} />ログイン
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── 丸太断面バンプ: absolute, centered ── */}
        <div
          className="log-bump"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "110px",
            backgroundColor: showWhiteBg ? "#ffffff" : "rgba(255,255,255,0.82)",
            backdropFilter: showWhiteBg ? "none" : "blur(6px)",
            borderRadius: scrolled ? "0" : "0 0 55px 55px",
            paddingTop: scrolled ? "14px" : "9px",
            paddingBottom: scrolled ? "14px" : "18px",
            boxShadow: "none",
            transition: "border-radius 0.35s ease, padding 0.35s ease, box-shadow 0.35s ease, background-color 0.35s ease",
            zIndex: 2,
          }}
        >
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img
              src={scrolled ? logo4_1Src : logo1Src}
              alt="貸別荘エルボスケ"
              style={{
                width: scrolled ? "90px" : "70px",
                height: scrolled ? "40px" : "70px",
                objectFit: "contain",
                display: "block",
                transition: "all 0.35s ease",
              }}
            />
          </Link>
        </div>

        {/* Mobile: logo + hamburger only */}
        <div className="mobile-nav-toggle" style={{ maxWidth: "1200px", margin: "0 auto", padding: `0 1rem 0 ${scrolled ? "1rem" : "0.25rem"}`, alignItems: "center", justifyContent: "space-between", height: "68px" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", position: "relative" }}>
            {/* 白円ロゴ（未スクロール時） */}
            <div style={{
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "15px",
              opacity: scrolled ? 0 : 1,
              transform: scrolled ? "scale(0.8)" : "scale(1)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
              pointerEvents: scrolled ? "none" : "auto",
            }}>
              <img src={logo1Src} alt="貸別荘エルボスケ" style={{ width: "60px", objectFit: "contain", display: "block" }} />
            </div>
            {/* テキストロゴ（スクロール後） */}
            <img
              src={logo4_1Src}
              alt="貸別荘エルボスケ"
              style={{
                position: "absolute",
                left: 0,
                height: "36px",
                objectFit: "contain",
                opacity: scrolled ? 1 : 0,
                transform: scrolled ? "scale(1)" : "scale(0.85)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                pointerEvents: scrolled ? "auto" : "none",
              }}
            />
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#4a2810", cursor: "pointer", padding: "0.5rem", display: "flex", alignItems: "center" }} aria-label="メニューを開く">
            <FaBars size={22} />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        className="mobile-menu"
      />

      {/* ── Mobile Drawer Panel ── */}
      <nav
        className="mobile-menu"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 1200,
          width: "100%", maxWidth: "320px",
          backgroundColor: "#ffffff",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
          boxShadow: menuOpen ? "-8px 0 32px rgba(0,0,0,0.15)" : "none",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1.1rem 1.5rem",
            borderBottom: "1px solid rgba(45,112,69,0.1)",
            flexShrink: 0,
            backgroundColor: "#f5f0e4",
          }}
        >
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
            <img src={logo4Src} alt="貸別荘エルボスケ" style={{ height: "38px", objectFit: "contain" }} />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              background: "none",
              border: "1px solid rgba(45,112,69,0.2)", borderRadius: "8px",
              color: "#8b5828", cursor: "pointer", padding: "0.45rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="メニューを閉じる"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <div style={{ flex: 1, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isReservation = item.path === "/reservation";
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isReservation ? "#ffffff" : isActive ? "#256840" : "#2c3820",
                  borderRadius: "10px",
                  backgroundColor: isReservation
                    ? "#c8251a"
                    : isActive
                    ? "rgba(37,104,64,0.08)"
                    : "transparent",
                  borderLeft: isActive && !isReservation ? "3px solid #256840" : "3px solid transparent",
                  transition: "all 0.2s",
                  marginBottom: isReservation ? "0.25rem" : 0,
                }}
              >
                <span>{item.label}</span>
                <FaChevronRight size={10} color={isActive ? "#256840" : "rgba(44,56,32,0.3)"} />
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid rgba(45,112,69,0.1)", flexShrink: 0,
            backgroundColor: "#f5f0e4",
          }}
        >
          {isLoggedIn ? (
            <Link
              to="/mypage"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.75rem 1rem", borderRadius: "10px", textDecoration: "none",
                fontSize: "0.9rem", fontWeight: 700, color: "#7a4a1e",
                backgroundColor: "rgba(45,112,69,0.1)",
                border: "1px solid rgba(45,112,69,0.2)",
              }}
            >
              <FaUserCircle size={16} /> マイページ
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.75rem 1rem", borderRadius: "10px", textDecoration: "none",
                fontSize: "0.9rem", fontWeight: 600, color: "#7a4a1e",
                border: "1px solid rgba(45,112,69,0.25)",
              }}
            >
              <FaSignInAlt size={14} /> ログイン
            </Link>
          )}
          <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.72rem", color: "rgba(60,80,40,0.45)", lineHeight: 1.6 }}>
            長野県下伊那郡阿南町新野
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* ── Mobile Fixed Bottom Nav ── */}
      <div className="mobile-bottom-nav" style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1050,
        gap: 0,
        margin: 0,
        padding: 0,
        boxShadow: "0 -4px 16px rgba(0,0,0,0.18)",
      }}>
        {[
          { to: "/reservation", label: "予約", icon: <FaCalendarAlt size={15} />, bg: "#c8251a" },
          { to: "/pricing",     label: "料金計算", icon: <FaStar size={14} />,        bg: "#256840" },
          { to: "/contact",    label: "お問合せ", icon: <FaEnvelope size={14} />,    bg: "#3abcb0" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: item.bg,
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              gap: "0.2rem",
              lineHeight: 1,
              padding: "0.6rem 0",
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: "#5c3317",
          color: "rgba(255,255,255,0.85)",
          paddingTop: "3.5rem",
          borderTop: "3px solid rgba(255,255,255,0.12)",
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
              <div style={{ marginBottom: "1.25rem" }}>
                <img
                  src={logo10Src}
                  alt="一棟貸し別荘 El Bosque"
                  style={{
                    height: "56px",
                    objectFit: "contain",
                    filter: "invert(1)",
                    opacity: 0.9,
                  }}
                />
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.9, color: "rgba(255,255,255,0.82)" }}>
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
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.18em", marginBottom: "1.1rem",
                  textTransform: "uppercase",
                }}
              >
                Menu
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      style={{ textDecoration: "none", color: "rgba(255,255,255,0.82)", fontSize: "0.85rem", transition: "color 0.2s" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ffffff")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.82)")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Access */}
            <div>
              <h4
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.18em", marginBottom: "1.1rem",
                  textTransform: "uppercase",
                }}
              >
                Access
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <FaMapMarkerAlt size={13} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0, marginTop: "3px" }} />
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
                    〒399-1612
                    <br />長野県下伊那郡阿南町
                    <br />新野3728-96
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <FaEnvelope size={12} color="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)" }}>info@elbosque.jp</span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <FaPhone size={12} color="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)" }}>お問い合わせはメールにて</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div>
              <h4
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.18em", marginBottom: "1.1rem",
                  textTransform: "uppercase",
                }}
              >
                Info
              </h4>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)", lineHeight: 2 }}>
                <div>営業期間：3月〜12月</div>
                <div>定員：最大6名（推奨1〜4名）</div>
                <div>タイプ：ログハウス一棟貸し</div>
                <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "20px",
                      fontSize: "0.72rem", fontWeight: 700,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    ペットOK
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "20px",
                      fontSize: "0.72rem", fontWeight: 700,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    Wi-Fi完備
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.12)",
              padding: "1.25rem 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
              {"© 2026 貸別荘エルボスケ（El bosque）All rights reserved."}
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
              長野県下伊那郡阿南町新野
            </p>
            <Link
              to="/admin"
              style={{
                fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", opacity: 0.8,
                textDecoration: "none", transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
            >
              管理画面
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

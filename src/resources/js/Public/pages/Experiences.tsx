import sanpoImage from "../assets/a97e6b5c6631c69bf0463a67f2994722a9b13300.png";
import kusakariImage from "../assets/c75a506f2b58dcf5f4dc61afeebdbc400b0a6f8a.png";
import taueImage from "../assets/23a4bdf51706e94b2cd247e5ad989d6411c83608.png";
import inekariImage from "../assets/207a8fdb0ecb3d43739e4e63547e88bed1d255aa.png";
import makiwariImage from "../assets/e7040713674f9ba69db8035323989527e8bcf7d9.png";
import vegImage from "../assets/2fd9fc84b215a469b3716ab729cd06c3e0a97124.png";
import starsImage from "../assets/d736bd7b9fbf79b2b7e3e1acfc214c2d3dd67acf.png";
import { Link } from "../router";
import { usePage } from "@inertiajs/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import React, { useState, useRef } from "react";
import {
    FaYenSign,
    FaClock,
    FaUsers,
    FaCalendarAlt,
    FaChevronRight,
    FaCheckCircle,
    FaClipboardList,
    FaPhoneAlt,
    FaStar,
} from "react-icons/fa";

/* ── 画像 URL ── */
const TAUE_IMG = taueImage;
const INEKARI_IMG = inekariImage;
const WOOD_IMG = makiwariImage;
const VEG_IMG = vegImage;
const BBQ_IMG =
    "https://images.unsplash.com/photo-1765036741158-5a1698974257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";
const SANPO_IMG = sanpoImage;
const KUSAKARI_IMG = kusakariImage;
const STARS_IMG = starsImage;

/* ── 体験データ ── */
interface Experience {
    img: string;
    headerColor: string;
    badgeLabel: string;
    requiresBooking: boolean;
    title: string;
    specs: { icon: React.ReactNode; label: string; value: string }[];
    desc: string;
    bullets: string[];
    note: string;
    imgHeight?: number;
}

const experiences: Experience[] = [
    {
        img: TAUE_IMG,
        headerColor: "#1b3c0e",
        badgeLabel: "春",
        requiresBooking: true,
        title: "田植え体験",
        imgHeight: 400,
        specs: [
            {
                icon: <FaYenSign size={13} />,
                label: "料金",
                value: "¥4,500 / 人",
            },
            {
                icon: <FaClock size={13} />,
                label: "所要時間",
                value: "約 2〜3 時間",
            },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "2〜6 名",
            },
            {
                icon: <FaCalendarAlt size={13} />,
                label: "時期",
                value: "5〜6 月",
            },
        ],
        desc: "南信州の棚田で昔ながらの田植えを体験します。裸足で泥の中に入り、一本一本苗を丁寧に植える作業を通じて、食の大切さと農業のすばらしさを実感できます。地元農家の方が丁寧に指導しますので、初めての方も安心です。",
        bullets: [
            "長靴・汚れてもよい服装でご参加ください（貸し出し要相談）",
            "春の新野の清々しい空気の中で心身とにリフレッシュ",
            "地元農家さんとの交流が旅の思い出になります",
        ],
        note: "前日までのご予約が必要です。当日の天候により内容を変更する場合がありす。",
    },
    {
        img: INEKARI_IMG,
        headerColor: "#5c3810",
        badgeLabel: "秋",
        requiresBooking: true,
        title: "稲刈り体験",
        imgHeight: 400,
        specs: [
            {
                icon: <FaYenSign size={13} />,
                label: "料金",
                value: "¥4,500 / 人",
            },
            {
                icon: <FaClock size={13} />,
                label: "所要時間",
                value: "約 2〜3 時間",
            },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "2〜6 名",
            },
            {
                icon: <FaCalendarAlt size={13} />,
                label: "時期",
                value: "9〜10 月",
            },
        ],
        desc: "黄金色に輝く稲穂を鎌で刈り取る秋の収穫体験です。自分の手で稲を刈り取り、束ねる作業は達成感もひとしお。収穫された米がどのように食卓に届くかを体感できる、特別なひとときです。",
        bullets: [
            "鎌の使い方から丁寧に指導します（安全を最優先）",
            "収穫したお米の一部をお土産としてお持ち帰りいただけます（量は応相談）",
            "秋の高原の澄んだ空気と黄金の棚田の景色は絶景です",
        ],
        note: "前日までのご予約が必要���す。天候・収穫状況により実施できない場合があります。",
    },
    {
        img: WOOD_IMG,
        headerColor: "#4a2810",
        badgeLabel: "通年",
        requiresBooking: false,
        title: "薪割り体験",
        imgHeight: 400,
        specs: [
            {
                icon: <FaYenSign size={13} />,
                label: "料金",
                value: "¥2,000 / 1 時間",
            },
            {
                icon: <FaClock size={13} />,
                label: "所要時間",
                value: "1 時間単位",
            },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "1〜6 名",
            },
            { icon: <FaCalendarAlt size={13} />, label: "時期", value: "通年" },
        ],
        desc: "斧を振るって薪を割る、爽快でシンプルな体験です。薪ストーブ用の薪を自分の手で割ることで、暖かな夜の火を囲む喜びが格段に増します。普段使わない筋肉を使い、心身ともにリフレッシュできます。",
        bullets: [
            "斧・楔（くさび）・安全手袋はすべて貸し出しします",
            "10 歳以上から体験可（お子さまは保護者同伴）",
            "割った薪はそのまま薪ストーブでお使いいただけます",
        ],
        note: "事前予約なしでも当日お申込みいただけます（準備の都合上、前日までのご連絡を推奨）。",
    },
    {
        img: VEG_IMG,
        headerColor: "#7a4010",
        badgeLabel: "夏のみ",
        requiresBooking: false,
        title: "夏野菜収穫体験",
        imgHeight: 400,
        specs: [
            {
                icon: <FaYenSign size={13} />,
                label: "料金",
                value: "¥1,500 / カゴ",
            },
            {
                icon: <FaClock size={13} />,
                label: "所要時間",
                value: "約 30〜60 分",
            },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "1〜6 名",
            },
            {
                icon: <FaCalendarAlt size={13} />,
                label: "時期",
                value: "7〜8 月",
            },
        ],
        desc: "標高が高く涼しい新野の高原で育った新鮮な夏野菜を自分で収穫します。トマト・きゅうり・ナス・とうもろこしなど、旬の野菜を摘みたてで味わえます。収穫した野菜はその日の夕食やBBQにそのまま使えます。",
        bullets: [
            "収穫したものはすべてお持ち帰りOK",
            "お子さまの食育体験としても大変人気があります",
            "BBQグリルレンタルとの組み合わせが特におすすめです",
        ],
        note: "野菜の生育状況により収穫できる品目が変わります。7〜8月のみの季節限定体験です。",
    },
    {
        img: BBQ_IMG,
        headerColor: "#6b2010",
        badgeLabel: "通年",
        requiresBooking: false,
        title: "BBQ準備サポート",
        imgHeight: 400,
        specs: [
            {
                icon: <FaYenSign size={13} />,
                label: "グリルレンタル",
                value: "¥3,500",
            },
            { icon: <FaClock size={13} />, label: "所要時間", value: "自由" },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "1〜6 名",
            },
            { icon: <FaCalendarAlt size={13} />, label: "時期", value: "通年" },
        ],
        desc: "プロ仕様のBBQグリル機材一式をレンタルし、森の中でアウトドアBBQをお楽しみいただけます。食材は滞在サポートの買い出し代行で、飯田市内のスーパーから好きな食材を自由に選んでご購入いただく形です。",
        bullets: [
            "グリル・炭・着火剤・トング・網など道具一式込み",
            "食材は買い出しサポートで飯田市スーパーにて自由に購入",
            "食材セットの提供はありません（お好みで自由に選択）",
        ],
        note: "BBQエリアは指定の屋外スペースのみ。火の後始末は必ず完全消火をお願いします。",
    },
    {
        img: SANPO_IMG,
        headerColor: "#2e5c1a",
        badgeLabel: "通年",
        requiresBooking: false,
        title: "散歩",
        imgHeight: 400,
        specs: [
            { icon: <FaYenSign size={13} />, label: "料金", value: "無料" },
            { icon: <FaClock size={13} />, label: "所要時間", value: "自由" },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "1〜6 名",
            },
            { icon: <FaCalendarAlt size={13} />, label: "時期", value: "通年" },
        ],
        desc: "巣山湖のほとりや新野の里山をのんびり歩く、心地よい散歩コースが楽しめます。春は桜、夏は川遊び、秋は実る果物、冬は雪景色と、四季それぞれに異なる表情を見せる南信州の自然をお楽しみください。",
        bullets: [
            "春：巣山湖周辺の桜並木と芽吹きの緑が見事です",
            "夏・秋：小川での川遊びや、道端で実る果物との出会いも",
            "冬：白銀に包まれた静寂の雪景色は格別のひとときです",
        ],
        note: "足元に適した靴でお出かけください。冬期は積雪・凍結にご注意ください。",
    },
    {
        img: KUSAKARI_IMG,
        headerColor: "#2e5c1a",
        badgeLabel: "通年",
        requiresBooking: false,
        title: "草刈り体験",
        imgHeight: 400,
        specs: [
            { icon: <FaYenSign size={13} />, label: "料金", value: "無料" },
            { icon: <FaClock size={13} />, label: "所要時間", value: "自由" },
            {
                icon: <FaUsers size={13} />,
                label: "推奨人数",
                value: "1〜6 名",
            },
            { icon: <FaCalendarAlt size={13} />, label: "時期", value: "通年" },
        ],
        desc: "ラジコン草刈り機「カルゾー」の操作を体験できます。コントローラーひとつで力強く草を刈り取るロボットの動きは、大人もお子さまも夢中になる楽しさ。里山の景観維持にも貢献する、新しいかたちの田舎体験です。",
        bullets: [
            "ラジコン操作なので体力に自信がない方でも気軽に楽しめます",
            "お子さまも保護者同伴で操作体験OK（安全指導付き）",
            "急斜面もパワフルに刈り取るカルゾーの走破力は圧巻です",
        ],
        note: "事前予約なしでも当日お申込みいただけます。天候や機体整備の状況により体験できない場合があります。",
    },
];

/* ── 星空観察（固定） ── */
const starExp = {
    img: STARS_IMG,
    headerColor: "#1e2e5a",
    badgeLabel: "通年",
    requiresBooking: false,
    title: "星空観察",
    imgHeight: 400,
    specs: [
        {
            icon: <FaYenSign size={13} />,
            label: "料金",
            value: "無料（ガイド付き ¥2,000/組）",
        },
        {
            icon: <FaClock size={13} />,
            label: "所要時間",
            value: "自由（ガイド：約1時間）",
        },
        { icon: <FaUsers size={13} />, label: "推奨人数", value: "1〜6 名" },
        {
            icon: <FaCalendarAlt size={13} />,
            label: "時期",
            value: "通年（晴天時）",
        },
    ],
    desc: "光害の少ない南信州の夜空は、天の川が肉眼で見える素晴らしい星空が広がります。ログハウスのデッキから、日常では味わえない満天の星空をお楽しみください。星空ガイド（¥2,000/組・要予約）をお申込みいただくと、季節の星座や天体の見どころをスタッフがご案内します。ガイドなしでも無料で星空観察をお楽しみいただけます。",
    bullets: [
        "ガイドなしの場合は申込不要。晴れた夜に随時お楽しみいただけます",
        "星空ガイド（¥2,000/組）は前日までのご予約が必要です",
        "双眼鏡の貸し出しも対応（要相談）",
        "新月の時期が最も多くの星を観察できます",
    ],
    note: "天候により観察できない場合があります。星空ガイドは晴天時のみ実施いたします。",
};

const allExperiences = [...experiences, starExp];

/* ── 予約ステップ ── */
const bookingSteps = [
    {
        icon: <FaClipboardList size={22} color="#d4b070" />,
        step: "STEP 1",
        title: "宿泊予約時にお申込み",
        desc: "ご予約フォームまたはメールにて、体験プログラムの種類と人数をお知らせください。",
    },
    {
        icon: <FaPhoneAlt size={22} color="#d4b070" />,
        step: "STEP 2",
        title: "前日に詳細を確認",
        desc: "天候・準備状況を踏まえ、前日に詳細な集合時間・場所をご案内いたします。",
    },
    {
        icon: <FaStar size={22} color="#d4b070" />,
        step: "STEP 3",
        title: "当日、体験スタート",
        desc: "スタッフが丁寧にサポートします。お気軽にお楽しみください。",
    },
];

/* ── 体験カード コンポーネント ── */
function ExperienceCard({ exp }: { exp: Experience }) {
    const imgContainerRef = useRef<HTMLDivElement>(null);
    const [imgStyle, setImgStyle] = useState<React.CSSProperties>({
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    });

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const naturalH = e.currentTarget.naturalHeight;
        const naturalW = e.currentTarget.naturalWidth;
        const containerH = imgContainerRef.current?.clientHeight ?? 0;
        const containerW = imgContainerRef.current?.clientWidth ?? 0;
        if (containerH > 0 && naturalH <= containerH) {
            const scaledW = naturalW * (containerH / naturalH);
            if (scaledW >= containerW) {
                setImgStyle({
                    width: "auto",
                    height: `${containerH}px`,
                    flexShrink: 0,
                    display: "block",
                });
            } else {
                setImgStyle({
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                });
            }
        } else {
            setImgStyle({
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
            });
        }
    };

    return (
        <div
            style={{
                backgroundColor: "#faf5e8",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
            }}
        >
            {/* ヘッダーバー */}
            <div
                style={{
                    backgroundColor: exp.headerColor,
                    padding: "1rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                }}
            >
                <h2
                    style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#f0e8d0",
                        margin: 0,
                    }}
                >
                    {exp.title}
                </h2>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    {exp.requiresBooking && (
                        <span
                            style={{
                                backgroundColor: "rgba(242,232,208,0.18)",
                                color: "#f0e8d0",
                                border: "1px solid rgba(242,232,208,0.35)",
                                padding: "0.2rem 0.6rem",
                                borderRadius: "2px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                            }}
                        >
                            要予約
                        </span>
                    )}
                    <span
                        style={{
                            backgroundColor: "#d4b070",
                            color: "#1e3c0e",
                            padding: "0.2rem 0.65rem",
                            borderRadius: "2px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                        }}
                    >
                        {exp.badgeLabel}
                    </span>
                </div>
            </div>

            {/* カード本体 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 3fr",
                }}
                className="exp-card-body"
            >
                {/* 写真 */}
                <div
                    ref={imgContainerRef}
                    style={{
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: `${exp.imgHeight ?? 260}px`,
                    }}
                >
                    <img
                        src={exp.img}
                        alt={exp.title}
                        style={imgStyle}
                        onLoad={handleLoad}
                    />
                </div>

                {/* コンテンツ */}
                <div
                    style={{
                        padding: "1.75rem 2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.1rem",
                    }}
                >
                    {/* スペック 2×2 グリッド */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "0.6rem",
                        }}
                        className="exp-spec-grid"
                    >
                        {exp.specs.map((spec) => (
                            <div
                                key={spec.label}
                                style={{
                                    backgroundColor: "#f2e8d0",
                                    border: "1px solid rgba(180,140,80,0.18)",
                                    borderRadius: "4px",
                                    padding: "0.6rem 0.85rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.2rem",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.3rem",
                                        color: "#7a4020",
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    {spec.icon}
                                    {spec.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.88rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                    }}
                                >
                                    {spec.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 説明文 */}
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "#5a4838",
                            lineHeight: 1.95,
                            margin: 0,
                        }}
                    >
                        {exp.desc}
                    </p>

                    {/* 箇条書き */}
                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.45rem",
                        }}
                    >
                        {exp.bullets.map((b) => (
                            <li
                                key={b}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.45rem",
                                    fontSize: "0.8rem",
                                    color: "#5a4838",
                                    lineHeight: 1.6,
                                }}
                            >
                                <FaCheckCircle
                                    size={13}
                                    color="#1e3c0e"
                                    style={{ flexShrink: 0, marginTop: "2px" }}
                                />
                                {b}
                            </li>
                        ))}
                    </ul>

                    {/* 注意事項 */}
                    <p
                        style={{
                            fontSize: "0.75rem",
                            color: "#7a6858",
                            lineHeight: 1.7,
                            margin: 0,
                            paddingTop: "0.25rem",
                            borderTop: "1px solid rgba(180,140,80,0.18)",
                        }}
                    >
                        ※ {exp.note}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── メインコンポーネント ── */
export function Experiences() {
    const { experiences: databaseExperiences = [], images = {} } = usePage()
        .props as unknown as {
        experiences?: Array<{
            id: number;
            name: string;
            description: string;
            price: number;
            priceNote: string;
            duration: string;
            recommendedPeople: string;
            season: string;
            seasonTag: string;
            period: string;
            periodStart?: string;
            periodEnd?: string;
            requiresReservation: boolean;
            points: string[] | null;
            notes: string;
            image: string | null;
        }>;
    };
    const fallbackExperiences = allExperiences;
    const displayedExperiences: Experience[] = databaseExperiences.map(
        (item, index) => {
            const fallback =
                fallbackExperiences[index % fallbackExperiences.length];
            return {
                img: item.image || fallback.img,
                headerColor:
                    allExperiences[index % allExperiences.length].headerColor,
                badgeLabel: item.seasonTag || item.season || "通年",
                requiresBooking: item.requiresReservation,
                title: item.name,
                specs: [
                    {
                        icon: <FaYenSign size={13} />,
                        label: "料金",
                        value:
                            item.priceNote || `¥${item.price.toLocaleString()}`,
                    },
                    {
                        icon: <FaClock size={13} />,
                        label: "所要時間",
                        value: item.duration || "自由",
                    },
                    {
                        icon: <FaUsers size={13} />,
                        label: "推奨人数",
                        value: item.recommendedPeople || "1〜6名",
                    },
                    {
                        icon: <FaCalendarAlt size={13} />,
                        label: "時期",
                        value:
                            item.period ||
                            (item.periodStart && item.periodEnd
                                ? `${item.periodStart}〜${item.periodEnd}`
                                : item.season || "通年"),
                    },
                ],
                desc: item.description,
                bullets: item.points ?? [],
                note: item.notes || "詳細はご予約時にお問い合わせください。",
                imgHeight: 400,
            };
        },
    );

    const experiencesToDisplay = databaseExperiences.length
        ? displayedExperiences
        : fallbackExperiences;

    return (
        <div>
            {/* ── ページヘッダー ── */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
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
                    Experiences
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
                    田舎体験プログラム
                </h1>
                <p
                    style={{
                        color: "rgba(240,232,208,0.72)",
                        marginTop: "1rem",
                        fontSize: "0.92rem",
                        maxWidth: "520px",
                        margin: "1rem auto 0",
                        lineHeight: 1.9,
                    }}
                >
                    自然とふれあい、暮らしに触れる
                    <br />
                    飾らないものの良い体験を
                </p>
            </div>

            {/* ── 体験カード一覧 ── */}
            <section
                style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}
            >
                <div
                    style={{
                        maxWidth: "1100px",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2.5rem",
                    }}
                >
                    {experiencesToDisplay.map((exp) => (
                        <ExperienceCard key={exp.title} exp={exp} />
                    ))}
                </div>
            </section>

            {/* ── 体験の予約方法 ── */}
            <section
                style={{ backgroundColor: "#faf5e8", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <p
                            style={{
                                color: "#7a4020",
                                fontSize: "0.72rem",
                                letterSpacing: "0.25em",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                marginBottom: "0.5rem",
                            }}
                        >
                            How to Book
                        </p>
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                                fontWeight: 700,
                                color: "#1e3c0e",
                            }}
                        >
                            体験の予約方法
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "1.5rem",
                            marginBottom: "2.5rem",
                        }}
                    >
                        {bookingSteps.map((step, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    position: "relative",
                                }}
                            >
                                {/* 矢印（最後以外） */}
                                {i < bookingSteps.length - 1 && (
                                    <FaChevronRight
                                        size={14}
                                        color="rgba(180,140,80,0.45)"
                                        style={{
                                            position: "absolute",
                                            right: "-0.75rem",
                                            top: "1.6rem",
                                            zIndex: 1,
                                        }}
                                    />
                                )}

                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        backgroundColor: "#1b2f0e",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "1rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    {step.icon}
                                </div>
                                <p
                                    style={{
                                        fontSize: "0.65rem",
                                        color: "#7a4020",
                                        fontWeight: 700,
                                        letterSpacing: "0.12em",
                                        marginBottom: "0.35rem",
                                    }}
                                >
                                    {step.step}
                                </p>
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "0.95rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                        marginBottom: "0.5rem",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {step.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#5a4838",
                                        lineHeight: 1.75,
                                    }}
                                >
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            backgroundColor: "rgba(30,60,14,0.06)",
                            border: "1px solid rgba(30,60,14,0.15)",
                            borderLeft: "4px solid #1e3c0e",
                            borderRadius: "4px",
                            padding: "1rem 1.35rem",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.82rem",
                                color: "#5a4838",
                                lineHeight: 1.85,
                                margin: 0,
                            }}
                        >
                            ※
                            要予約プログラム（田植え・稲刈り）は前日までのお申込みが必要です。その他の体験も事前にご連絡いただけるとスムーズにご案内できます。
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section
                style={{
                    background:
                        "linear-gradient(135deg, #1b2f0e 0%, #0e1a08 100%)",
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
                        fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                        fontWeight: 700,
                        color: "#f0e8d0",
                        marginBottom: "0.75rem",
                    }}
                >
                    自然とふれあう、飾らないものの良い体験食
                </h2>
                <p
                    style={{
                        color: "rgba(240,232,208,0.7)",
                        fontSize: "0.88rem",
                        lineHeight: 1.9,
                        marginBottom: "2rem",
                        maxWidth: "480px",
                        margin: "0 auto 2rem",
                    }}
                >
                    体験プログラムはご予約時にお知らせください。
                    <br />
                    事前準備の都合上、前日までのお申込みを推奨しています。
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
                        料金案内 <FaChevronRight size={12} />
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
                        予約フォームへ <FaChevronRight size={12} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

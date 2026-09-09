import { usePage } from "@inertiajs/react";

type FixedPageData = {
    title: string;
    content: string;
};

export function FixedPage() {
    const { fixedPage } = usePage().props as unknown as {
        fixedPage: FixedPageData;
    };

    return (
        <div>
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
                    padding: "8rem 1.5rem 4rem",
                    textAlign: "center",
                }}
            >
                <h1
                    style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                        fontWeight: 700,
                        color: "#f0e8d0",
                        lineHeight: 1.3,
                        margin: 0,
                    }}
                >
                    {fixedPage.title}
                </h1>
            </div>

            <section
                style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}
            >
                <div
                    style={{
                        maxWidth: "820px",
                        margin: "0 auto",
                        backgroundColor: "#faf5e8",
                        border: "1px solid rgba(180,140,80,0.12)",
                        borderRadius: "4px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        padding: "clamp(1.5rem, 5vw, 3.5rem)",
                    }}
                >
                    <div
                        style={{
                            color: "#2c1e10",
                            fontSize: "0.95rem",
                            lineHeight: 2,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {fixedPage.content}
                    </div>
                </div>
            </section>
        </div>
    );
}

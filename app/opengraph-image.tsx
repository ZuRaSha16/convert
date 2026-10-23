import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/logo-mark";

export const alt =
  "Convert — Less juggling. More living. A clearer financial future for Georgia.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#f6f8fc",
        padding: "64px 72px",
        color: "#17243a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 36, letterSpacing: -2 }}>
          <LogoMark width={44} height={44} style={{ marginRight: 10 }} />
          convert<span style={{ color: "#6ee7b7" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            letterSpacing: -5,
            marginTop: 74,
          }}
        >
          Less juggling.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            letterSpacing: -5,
            color: "#047857",
          }}
        >
          More living.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 23,
            color: "#63758e",
            marginTop: 28,
            maxWidth: 620,
          }}
        >
          Your loans, bills, and taxes. One clearer picture.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 14,
            color: "#63758e",
            marginTop: 53,
            letterSpacing: 2,
          }}
        >
          MADE FOR GEORGIA · COMING SOON
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: -80,
          top: 50,
          width: 480,
          height: 480,
          border: "1px solid #b3dbca",
          borderRadius: 240,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 370,
            height: 370,
            border: "1px solid #b3dbca",
            borderRadius: 190,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 35,
              width: 275,
              height: 190,
              background: "#dce7f8",
              border: "1px solid #c7d6ec",
              borderRadius: 22,
              transform: "rotate(-8deg)",
            }}
          >
            <span style={{ fontSize: 14, color: "#5f779a" }}>
              A little more in control.
            </span>
            <LogoMark width={64} height={55} style={{ marginTop: 18 }} />
            <span style={{ fontSize: 14, color: "#5f779a", marginTop: 14 }}>
              A lot more you.
            </span>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";

// iOS uses this when you "Add to Home Screen".
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          background: "linear-gradient(160deg, #15803d 0%, #04210f 100%)",
        }}
      >
        ⚽
      </div>
    ),
    { ...size },
  );
}

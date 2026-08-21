/* eslint-disable @next/next/no-img-element */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt =
  "Nelled Studio — Desenvolvimento de Sistemas e Plataformas Web";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export const runtime =
  "nodejs";

export default async function TwitterImage() {
  const [
    logoData,
    markData,
  ] = await Promise.all([
    readFile(
      join(
        process.cwd(),
        "public",
        "nelled-studio-logo-dark.png",
      ),
      "base64",
    ),

    readFile(
      join(
        process.cwd(),
        "public",
        "nelled-studio-mark.png",
      ),
      "base64",
    ),
  ]);

  const logoSrc =
    `data:image/png;base64,${logoData}`;

  const markSrc =
    `data:image/png;base64,${markData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #040a12 0%, #071522 55%, #03111a 100%)",
          color: "#f5f8fa",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 520,
            right: -100,
            top: -180,
            background:
              "rgba(0, 217, 245, 0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 420,
            left: 330,
            bottom: -300,
            background:
              "rgba(0, 153, 255, 0.08)",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding:
              "72px 78px",
          }}
        >
          <div
            style={{
              width: "62%",
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "flex-start",
            }}
          >
            <img
              src={logoSrc}
              alt=""
              width={290}
              height={97}
              style={{
                objectFit:
                  "contain",
                objectPosition:
                  "left center",
                marginBottom: 42,
              }}
            />

            <div
              style={{
                display: "flex",
                color:
                  "#00d9f5",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 3,
                marginBottom: 20,
              }}
            >
              TECNOLOGIA · DESIGN · DESENVOLVIMENTO
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 55,
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: -2,
                maxWidth: 690,
              }}
            >
              Desenvolvimento de
              Sistemas e Plataformas
              Web
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 26,
                maxWidth: 650,
                color:
                  "#9cabb8",
                fontSize: 24,
                lineHeight: 1.45,
              }}
            >
              Produtos digitais
              modernos, rápidos e
              preparados para evoluir
              com o seu negócio.
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 42,
                color:
                  "#6f8291",
                fontSize: 19,
                letterSpacing: 1,
              }}
            >
              nelled.vercel.app
            </div>
          </div>

          <div
            style={{
              width: "38%",
              height: "100%",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <div
              style={{
                width: 390,
                height: 390,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius: 48,
                background:
                  "rgba(0, 217, 245, 0.025)",
                border:
                  "1px solid rgba(0, 217, 245, 0.10)",
              }}
            >
              <img
                src={markSrc}
                alt=""
                width={330}
                height={330}
                style={{
                  objectFit:
                    "contain",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
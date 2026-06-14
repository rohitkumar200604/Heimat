import { NextResponse } from "next/server";

/**
 * Property photo upload using GCS Interop (S3-compatible HMAC) API.
 * Supports legacy JSON metadata request (returns presigned PUT URL)
 * as well as direct FormData multipart upload (uploads to GCS server-side).
 */

/** Produce correctly formatted SigV4 date strings without regex fragility. */
function getDateStrings() {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const datestamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}`;
  const amzdate = `${datestamp}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}Z`;
  return { datestamp, amzdate };
}

const enc = new TextEncoder();

async function hmac(keyData: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey(
    "raw",
    keyData as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let fileName: string;
    let fileType: string;
    let landlordId: string;
    let file: File | null = null;
    let isDirectUpload = false;

    if (contentType.includes("multipart/form-data")) {
      isDirectUpload = true;
      const formData = await req.formData();
      file = formData.get("file") as File;
      landlordId = (formData.get("landlordId") as string) || "anon";
      if (!file) throw new Error("No file uploaded in form data");
      fileName = file.name;
      fileType = file.type || "image/jpeg";
    } else {
      const body = await req.json();
      fileName = body.fileName;
      fileType = body.fileType || "image/jpeg";
      landlordId = body.landlordId || "anon";
    }

    const bucket = process.env.GCS_BUCKET_NAME;
    const accessKeyId = process.env.GCS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.GCS_SECRET_ACCESS_KEY;

    // ── Dev mock fallback ──────────────────────────────────────────────────────
    if (!bucket || !accessKeyId || !secretAccessKey) {
      const key = `${landlordId}/properties/${Date.now()}-${fileName}`;
      let cdnUrl = `https://storage.googleapis.com/mock-bucket/${key}`;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        cdnUrl = `data:${fileType};base64,${base64}`;
      }
      return NextResponse.json({
        success: true,
        mock: true,
        uploadUrl: `https://storage.googleapis.com/mock-bucket/${key}?mock=true`,
        cdnUrl,
        key,
      });
    }

    // ── Production: GCS XML API with SigV4 HMAC presigned PUT URL ─────────────
    const key = `${landlordId}/properties/${Date.now()}-${fileName}`;
    const host = "storage.googleapis.com";
    const region = "auto";
    const { datestamp, amzdate } = getDateStrings();

    const credentialScope = `${datestamp}/${region}/s3/aws4_request`;
    const credential = `${accessKeyId}/${credentialScope}`;

    // Query params must be alphabetically sorted for canonical request
    const queryParams = new URLSearchParams([
      ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
      ["X-Amz-Credential", credential],
      ["X-Amz-Date", amzdate],
      ["X-Amz-Expires", "900"],
      ["X-Amz-SignedHeaders", "host"],
    ]).toString();

    // Canonical URI: each path segment must be URI-encoded separately
    const encodedKey = key
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");
    const canonicalUri = `/${bucket}/${encodedKey}`;

    const canonicalRequest = [
      "PUT",
      canonicalUri,
      queryParams,
      `host:${host}\n`,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzdate,
      credentialScope,
      await sha256hex(canonicalRequest),
    ].join("\n");

    const kDate = await hmac(enc.encode(`AWS4${secretAccessKey}`), datestamp);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, "s3");
    const kSigning = await hmac(kService, "aws4_request");
    const signature = toHex(await hmac(kSigning, stringToSign));

    const uploadUrl = `https://${host}/${bucket}/${key}?${queryParams}&X-Amz-Signature=${signature}`;
    const cdnUrl = `https://${host}/${bucket}/${key}`;

    if (isDirectUpload && file) {
      // Server-side PUT to GCS — avoids browser CORS restrictions
      const arrayBuffer = await file.arrayBuffer();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
          "Content-Length": String(arrayBuffer.byteLength),
        },
        body: arrayBuffer,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("GCS photo upload failed:", uploadRes.status, errText);
        throw new Error(
          `GCS upload failed (${uploadRes.status} ${uploadRes.statusText}): ${errText}`,
        );
      }

      return NextResponse.json({ success: true, key, cdnUrl });
    }

    return NextResponse.json({ success: true, uploadUrl, cdnUrl, key });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload photo route error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

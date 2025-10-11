type BlobLike = Blob | File | ArrayBuffer | ArrayBufferView | string;

type BlobUploadResult = {
  url?: string;
  pathname?: string;
  size?: number;
};

export type PutOptions = {
  access?: "public" | "private";
  contentType?: string;
  metadata?: Record<string, string>;
  token?: string;
  endpoint?: string;
};

export type PutResult = {
  url: string;
  pathname: string;
  size: number;
};

const DEFAULT_ENDPOINT = "https://blob.vercel-storage.com";

function ensureBlob(data: BlobLike, contentType?: string): Blob {
  if (data instanceof Blob) {
    return data;
  }
  if (typeof data === "string") {
    return new Blob([data], { type: contentType ?? "text/plain" });
  }
  if (data instanceof ArrayBuffer) {
    return new Blob([data], { type: contentType ?? "application/octet-stream" });
  }
  if (ArrayBuffer.isView(data)) {
    return new Blob([data.buffer], { type: contentType ?? "application/octet-stream" });
  }

  throw new TypeError("Unsupported blob payload type");
}

function resolveToken(options: PutOptions): string {
  return (
    options.token ??
    process.env.BLOB_READ_WRITE_TOKEN ??
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ??
    ""
  );
}

function resolveEndpoint(options: PutOptions): string {
  return options.endpoint ?? process.env.BLOB_API_URL ?? DEFAULT_ENDPOINT;
}

function serializeMetadata(metadata: Record<string, string> | undefined): Record<string, string> {
  if (!metadata) return {};
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      `x-vercel-meta-${key.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`,
      value
    ])
  );
}

export async function put(path: string, payload: BlobLike, options: PutOptions = {}): Promise<PutResult> {
  const token = resolveToken(options);
  if (!token) {
    throw new Error("Blob storage token is not configured. Set BLOB_READ_WRITE_TOKEN to enable uploads.");
  }

  const blob = ensureBlob(payload, options.contentType);
  const endpoint = resolveEndpoint(options);

  const contentType = options.contentType ?? (blob.type || "application/octet-stream");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "content-type": contentType,
    "x-vercel-blob-path": path,
    "x-vercel-blob-access": options.access ?? "public"
  };

  Object.assign(headers, serializeMetadata(options.metadata));

  const response = await fetch(endpoint, {
    method: "POST",
    body: blob,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to upload blob (${response.status}): ${message || "Unknown error"}`);
  }

  const result = (await response.json()) as BlobUploadResult | undefined;

  return {
    url: result?.url ?? `${endpoint.replace(/\/$/, "")}/${path}`,
    pathname: result?.pathname ?? path,
    size: result?.size ?? blob.size
  };
}

import crypto from "crypto";

const hmacSecret = process.env.HMAC_SECRET || "ds9f9dsa98798sdf"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const buildCanonical = (
    method: HttpMethod,
    url: string,
    authTime: number,
    body: string
) => {
    const u = new URL(url);
    const pathAndQuery = u.pathname + (u.search || "");
    const bodySha256 = crypto.createHash("sha256").update(body).digest("hex");
    return `${method}\n${pathAndQuery}\n${authTime}\n${bodySha256}`;
}

export const signRequest = (
    req: string,
    body: string
) => {
    const method = 'POST';
    const url = 'https://inkybay.com/api/shop/' + req + '.php';
    const authTime = Math.floor(Date.now() / 1000);
    const canonical = buildCanonical(method, url, authTime, body);
    const signature = crypto
        .createHmac("sha256", hmacSecret)
        .update(canonical)
        .digest("base64");
    return { url, authTime, signature };
}
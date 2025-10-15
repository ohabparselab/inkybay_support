import type { ActionFunctionArgs } from "react-router";
import { signRequest } from "~/lib/api.inkybay.server";

export async function action({ request, params }: ActionFunctionArgs) {

    const kind = params.kind ?? ""; // "search" | "history" | "info"
    if (!["search", "history", "info"].includes(kind || "")) {
        return [{ ok: false, error: "invalid kind" }, { status: 400 }];
    }

    // Expect form posts from the component
    const form = await request.formData();

    const bodyObj: Record<string, any> = {};
    if (kind === "search") {
        const srckey = String(form.get("srckey") ?? "");
        const type = String(form.get("type") ?? "all"); // name | url | email | id
        if (!srckey) return [{ ok: false, error: "srckey required" }, { status: 400 }];

        bodyObj.srckey = srckey;
        bodyObj.type = type;
    } else if (kind === "history") {
        const shop = String(form.get("shop") ?? "");
        if (!shop) return [{ ok: false, error: "shop required" }, { status: 400 }];

        bodyObj.shop = shop;
    } else if (kind === "info") {
        const shop = String(form.get("shop") ?? "");
        if (!shop) return [{ ok: false, error: "shop required" }, { status: 400 }];

        bodyObj.shop = shop;
    }

    const method = "POST";
    const body = JSON.stringify(bodyObj);
    const { url, authTime, signature } = signRequest(kind, body);


    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            authKey: `${process.env.INKYBAY_API_KEY}`,
            authTime: String(authTime),
            signature,
        },
        body,
    });
    const text = await res.text();
    let data: any;
    
    try {
        data = JSON.parse(text);
    } catch {
        data = { raw: text };
    }

    return { status: res.status, data };
}
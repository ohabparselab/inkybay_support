
import { handleLogin } from "~/lib/auth.server";
import { loginSchema } from "~/lib/validations";

export async function action({ request }: { request: Request }) {
    try {
        const data = await request.json();
        const parsed = loginSchema.parse(data);
        const { email, password } = parsed;

        const session = await handleLogin(email, password );
        if (session) {
            return session;
        } else {
            return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
        }

        
    } catch (error: any) {
        console.error(" Login fail error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}

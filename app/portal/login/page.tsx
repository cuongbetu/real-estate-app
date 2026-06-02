import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  signSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/session";
import { isAdminSession } from "@/lib/auth";

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Already logged in → go straight to portal
  if (await isAdminSession()) redirect("/portal");

  const { error } = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    const username = (formData.get("username") as string | null) ?? "";
    const password = (formData.get("password") as string | null) ?? "";

    if (!verifyCredentials(username, password)) {
      redirect("/portal/login?error=invalid");
    }

    const store = await cookies();
    store.set(SESSION_COOKIE, signSessionToken(username), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
    redirect("/portal");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-md bg-[var(--color-brand)] text-white grid place-items-center font-bold text-xs">
            24h
          </div>
          <span className="font-bold text-lg text-zinc-900">Nhà đất giá tốt 24h</span>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 mb-1">Đăng nhập quản trị</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Nhập tài khoản để truy cập trang Portal.
        </p>

        {error === "invalid" && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Tên đăng nhập hoặc mật khẩu không đúng.
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-[var(--color-brand)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded-md font-semibold text-sm transition-colors"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

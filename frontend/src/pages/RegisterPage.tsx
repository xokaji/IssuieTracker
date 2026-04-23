import { useMemo, useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import BrandLogo from "../components/ui/BrandLogo";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasUpper(value: string) {
  return /[A-Z]/.test(value);
}

function hasNumber(value: string) {
  return /\d/.test(value);
}

function getAuthErrorMessage(err: unknown, fallback: string) {
  if (!err || typeof err !== "object") return fallback;

  const maybe = err as {
    response?: {
      status?: unknown;
      data?: { error?: unknown };
    };
  };

  const status =
    typeof maybe.response?.status === "number"
      ? maybe.response.status
      : undefined;
  const raw =
    typeof maybe.response?.data?.error === "string"
      ? maybe.response.data.error.toLowerCase()
      : "";

  if (status === 409) return "An account with this email already exists.";
  if (status === 429) return "Too many attempts. Please wait and try again.";
  if (typeof status === "number" && status >= 500)
    return "Server issue. Please try again in a moment.";
  if (raw.includes("network"))
    return "Cannot reach server. Check your connection.";

  return typeof maybe.response?.data?.error === "string"
    ? maybe.response.data.error
    : fallback;
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const errors = useMemo(() => {
    const next: Record<string, string> = {};

    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isEmail(form.email)) next.email = "Enter a valid email address.";

    if (!form.password.trim()) next.password = "Password is required.";
    else if (form.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    else if (!hasUpper(form.password))
      next.password = "Password must include at least 1 uppercase letter.";
    else if (!hasNumber(form.password))
      next.password = "Password must include at least 1 number.";

    if (!form.confirm.trim()) next.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm)
      next.confirm = "Passwords do not match.";

    return next;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (!canSubmit) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success("Account created successfully.");
      navigate("/");
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-6 text-center">
          <BrandLogo size="lg" showText={false} className="mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Set up your account to start managing issues.
          </p>
        </div>

        <div className="surface p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={set("name")}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                aria-invalid={touched.name && !!errors.name}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                aria-invalid={touched.email && !!errors.email}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  aria-invalid={touched.password && !!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Use at least 8 characters with 1 uppercase letter and 1 number.
              </p>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type={showPass ? "text" : "password"}
                className="input"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set("confirm")}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, confirm: true }))
                }
                aria-invalid={touched.confirm && !!errors.confirm}
              />
              {touched.confirm && errors.confirm && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.confirm}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <UserPlus size={16} />
                  Create account
                </span>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

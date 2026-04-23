import { useMemo, useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import BrandLogo from '../components/ui/BrandLogo'

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getAuthErrorMessage(err: any, fallback: string) {
  const status = err?.response?.status
  const raw = (err?.response?.data?.error || '').toString().toLowerCase()

  if (status === 401) return 'Incorrect email or password.'
  if (status === 429) return 'Too many attempts. Please wait and try again.'
  if (status >= 500) return 'Server issue. Please try again in a moment.'
  if (raw.includes('network')) return 'Cannot reach server. Check your connection.'

  return err?.response?.data?.error || fallback
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })

  const { login } = useAuthStore()
  const navigate = useNavigate()

  const errors = useMemo(() => {
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!isEmail(email)) next.email = 'Enter a valid email address.'

    if (!password.trim()) next.password = 'Password is required.'
    return next
  }, [email, password])

  const canSubmit = Object.keys(errors).length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (!canSubmit) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), password)
      toast.success('Logged in successfully.')
      navigate('/')
    } catch (err: any) {
      const reason = getAuthErrorMessage(err, 'Login failed.')
      toast.error(`Login failed: ${reason}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-6 text-center">
          <BrandLogo size="lg" showText={false} className="mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in to continue to your workspace.</p>
        </div>

        <div className="surface p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                autoComplete="email"
                aria-invalid={touched.email && !!errors.email}
              />
              {touched.email && errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  autoComplete="current-password"
                  aria-invalid={touched.password && !!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn size={16} />
                  Sign in
                </span>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

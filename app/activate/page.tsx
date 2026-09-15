'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'ROLL' | 'OTP' | 'PASSWORD' | 'DONE'

export default function ActivatePage() {
  const router = useRouter()
    const [returnTo, setReturnTo] = useState('/')

    useEffect(() => {
      const params = new URLSearchParams(window.location.search)
      setReturnTo(params.get('returnTo') || '/')
    }, [])
  

  const [step, setStep] = useState<Step>('ROLL')
  const [rollNumber, setRollNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [activationToken, setActivationToken] = useState('')
  const [studentName, setStudentName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function requestOtp(e: FormEvent) {
    e.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNumber: rollNumber.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to send OTP')
      }

      setEmail(data.email || '')
      setStudentName(data.student?.name || '')
      setMessage('OTP sent to your college email.')
      setStep('OTP')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/activation/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNumber: rollNumber.trim(),
          otp: otp.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      setActivationToken(data.activationToken)
      setStudentName(data.student?.name || studentName)
      setStep('PASSWORD')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function completeActivation(e: FormEvent) {
    e.preventDefault()

    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/activation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNumber: rollNumber.trim(),
          activationToken,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to activate account')
      }

      setStep('DONE')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function goToLogin() {
    const loginUrl =
      returnTo && returnTo !== '/'
        ? `/login?returnTo=${encodeURIComponent(returnTo)}`
        : '/login'

    router.push(loginUrl)
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 mb-2">
              THAARA THEERAM
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Activate your account
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Use your official college account to get started.
            </p>
          </div>

          {step === 'ROLL' && (
            <form onSubmit={requestOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Roll Number
                </label>

                <input
                  id="rollNumber"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter your roll number"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>

              <button
                type="button"
                onClick={goToLogin}
                className="w-full text-sm text-slate-600 hover:text-blue-600"
              >
                Already activated? Login
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">OTP sent to</p>
                <p className="font-medium text-slate-900 break-all">
                  {email}
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Enter OTP
                </label>

                <input
                  id="otp"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="6-digit OTP"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {message && (
                <p className="text-sm text-green-600 bg-green-50 rounded-xl p-3">
                  {message}
                </p>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('ROLL')
                  setOtp('')
                  setError('')
                  setMessage('')
                }}
                className="w-full text-sm text-slate-600 hover:text-blue-600"
              >
                Change roll number
              </button>
            </form>
          )}

          {step === 'PASSWORD' && (
            <form onSubmit={completeActivation} className="space-y-5">
              <div>
                <p className="text-sm text-slate-500">Welcome</p>
                <p className="text-lg font-semibold text-slate-900">
                  {studentName}
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Create Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {step === 'DONE' && (
            <div className="text-center space-y-5">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Account activated
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Your Thaara Theeram account is ready.
                </p>
              </div>

              <button
                type="button"
                onClick={goToLogin}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
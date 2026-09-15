'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'ROLL' | 'OTP' | 'PASSWORD' | 'DONE'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('ROLL')
  const [rollNumber, setRollNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [collegeEmail, setCollegeEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not send verification code.')
        return
      }

      setCollegeEmail(data.student.collegeEmail)
      setStep('OTP')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNumber,
          otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid verification code.')
        return
      }

      setResetToken(data.resetToken)
      setStep('PASSWORD')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rollNumber,
          resetToken,
          password: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not change your password.')
        return
      }

      setStep('DONE')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {step === 'ROLL' && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight">
                Forgot password?
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Enter your college roll number and we&apos;ll send a
                verification code to your registered college email.
              </p>

              <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="rollNumber"
                    className="mb-2 block text-sm font-medium"
                  >
                    Roll Number
                  </label>

                  <input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(event) => setRollNumber(event.target.value)}
                    placeholder="256f5a0512"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>

                {error && (
                  <ErrorMessage message={error} />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Sending code...' : 'Send verification code'}
                </button>
              </form>
            </>
          )}

          {step === 'OTP' && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight">
                Verify your account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Enter the 6-digit code sent to
              </p>

              <p className="mt-1 text-sm font-medium">
                {maskEmail(collegeEmail)}
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium"
                  >
                    Verification Code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none transition focus:border-black"
                  />
                </div>

                {error && (
                  <ErrorMessage message={error} />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setOtp('')
                    setStep('ROLL')
                  }}
                  className="w-full text-sm text-gray-500 hover:text-black"
                >
                  Use a different roll number
                </button>
              </form>
            </>
          )}

          {step === 'PASSWORD' && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight">
                Create new password
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Choose a new password for your Thaara Theeram account.
              </p>

              <form
                onSubmit={handleChangePassword}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Password must contain at least 8 characters.
                </p>

                {error && (
                  <ErrorMessage message={error} />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Changing password...' : 'Change password'}
                </button>
              </form>
            </>
          )}

          {step === 'DONE' && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                ✓
              </div>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                Password changed
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Your password has been updated successfully.
              </p>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-8 w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90"
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

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@')

  if (!name || !domain) {
    return email
  }

  if (name.length <= 4) {
    return `${name[0]}***@${domain}`
  }

  return `${name.slice(0, 3)}***${name.slice(-2)}@${domain}`
}
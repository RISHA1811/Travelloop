import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const STEPS = ['Email', 'Verify OTP', 'New Password'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const setErr = (msg) => { setError(msg); setSuccess(''); };
  const setOk = (msg) => { setSuccess(msg); setError(''); };

  // Step 1 — get OTP from server
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setGeneratedOtp(data.otp);
      setOk('OTP generated! Use the code below to continue.');
      setStep(1);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      if (!err.response) {
        setErr('Cannot reach server. Make sure the backend is running on port 5000.');
      } else {
        setErr(err.response.data?.message || `Server error ${err.response.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setGeneratedOtp(data.otp);
      setOtp(['', '', '', '', '', '']);
      setOk('New OTP generated!');
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const copyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    setOtpCopied(true);
    // Auto-fill the OTP boxes
    setOtp(generatedOtp.split(''));
    setTimeout(() => setOtpCopied(false), 2000);
  };

  // OTP box handlers
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpVal = otp.join('');
    if (otpVal.length < 6) return setErr('Enter all 6 digits');
    setLoading(true);
    setErr('');
    try {
      await api.post('/auth/verify-otp', { email, otp: otpVal });
      setOk('OTP verified! Set your new password.');
      setStep(2);
    } catch (err) {
      setErr(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — reset password
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setErr('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setErr('Passwords do not match');
    setLoading(true);
    setErr('');
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword });
      setOk('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErr(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { label: 'Too short', color: 'bg-red-400', w: 'w-1/4' };
    if (newPassword.length < 8) return { label: 'Weak', color: 'bg-orange-400', w: 'w-2/4' };
    if (/[A-Z]/.test(newPassword) && /\d/.test(newPassword)) return { label: 'Strong', color: 'bg-green-500', w: 'w-full' };
    return { label: 'Medium', color: 'bg-yellow-400', w: 'w-3/4' };
  })();

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center select-none">🔐</div>
        <Link to="/landing" className="flex items-center gap-2 relative z-10">
          <span className="text-3xl">✈️</span>
          <span className="text-2xl font-bold text-white">Traveloop</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Forgot your<br />password?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Enter your email, get an OTP code, and set a new password in seconds.
          </p>
          {/* Step indicators */}
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-3 transition-all ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                  ${i < step ? 'bg-green-400 text-white' : i === step ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-indigo-200'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-200 text-sm relative z-10">© {new Date().getFullYear()} Traveloop</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Traveloop</span>
          </div>

          {/* Mobile step bar */}
          <div className="lg:hidden flex items-center mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 text-red-700 text-sm mb-5 bg-red-50 border border-red-200 p-3 rounded-xl">
              <span className="text-base mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-700 text-sm mb-5 bg-green-50 border border-green-200 p-3 rounded-xl">
              <span className="text-base">✓</span> {success}
            </div>
          )}

          {/* ── STEP 0: Enter Email ── */}
          {step === 0 && (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Reset password</h1>
              <p className="text-gray-500 mb-8">Enter your registered email to get a reset OTP.</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition placeholder-gray-400 w-full"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200 w-full flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Get OTP →'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 1: Show OTP + Verify ── */}
          {step === 1 && (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Enter OTP</h1>
              <p className="text-gray-500 mb-5">
                Your OTP for <span className="font-semibold text-indigo-600">{email}</span>
              </p>

              {/* OTP Display Box */}
              {generatedOtp && (
                <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">Your OTP Code</p>
                  <div className="text-4xl font-black tracking-[0.3em] text-indigo-700 mb-3 font-mono">
                    {generatedOtp}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={copyOtp}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                      {otpCopied ? '✓ Copied & Filled!' : '📋 Copy & Auto-fill'}
                    </button>
                    <span className="text-xs text-gray-400">Expires in 10 min</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type or paste the OTP below</label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition
                          ${digit ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-800'}
                          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || otp.join('').length < 6}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Verify OTP →'}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Need a new code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-gray-400">Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={handleResend} disabled={loading}
                      className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
                      Regenerate OTP
                    </button>
                  )}
                </p>
              </div>

              <button
                onClick={() => { setStep(0); setOtp(['', '', '', '', '', '']); setGeneratedOtp(''); setError(''); setSuccess(''); }}
                className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition text-center">
                ← Change email
              </button>
            </>
          )}

          {/* ── STEP 2: New Password ── */}
          {step === 2 && (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Set new password</h1>
              <p className="text-gray-500 mb-8">Choose a strong password for your account.</p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition placeholder-gray-400 w-full pr-10"
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                      </div>
                      <p className={`text-xs mt-1 font-medium
                        ${strength.label === 'Strong' ? 'text-green-600' :
                          strength.label === 'Medium' ? 'text-yellow-600' :
                          strength.label === 'Weak' ? 'text-orange-500' : 'text-red-500'}`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition placeholder-gray-400 w-full"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                  )}
                </div>

                <button type="submit"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Reset Password ✓'}
                </button>
              </form>
            </>
          )}

          <p className="text-sm text-center mt-8 text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

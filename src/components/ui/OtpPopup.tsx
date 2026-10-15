import { useEffect, useRef, useState } from 'react';
import { sendOtp, verifyOtp } from '../../lib/api';

type Props = {
  email: string;
  purpose?: 'checkout' | 'signup' | 'password_reset';
  onVerified: () => void;
  onClose: () => void;
};

const RESEND_COOLDOWN_SEC = 30;

export default function OtpPopup({
  email,
  purpose = 'checkout',
  onVerified,
  onClose,
}: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string>('Sending code...');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    void triggerSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const triggerSend = async () => {
    setSending(true);
    setError(null);
    const res = await sendOtp(email, purpose);
    setSending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setInfo(`Code sent to ${email}`);
    setResendIn(RESEND_COOLDOWN_SEC);
  };

  const submit = async (code: string) => {
    setVerifying(true);
    setError(null);
    const res = await verifyOtp(email, code, purpose);
    setVerifying(false);
    if (!res.ok) {
      setError(res.error);
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }
    onVerified();
  };

  const handleChange = (idx: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    setError(null);

    if (v && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (v && idx === 5) {
      const code = next.join('');
      if (code.length === 6) void submit(code);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6)
      .fill('')
      .map((_, i) => text[i] ?? '');
    setDigits(next);
    if (text.length === 6) void submit(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Verify your email</h2>
        <p className="mt-1 text-sm text-gray-600">
          {info || `We sent a 6-digit code to ${email}`}
        </p>

        <div className="mt-5 flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={verifying || sending}
              className="h-12 w-10 rounded-lg border border-gray-300 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => void triggerSend()}
            disabled={resendIn > 0 || sending}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
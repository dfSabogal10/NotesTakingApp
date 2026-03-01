"use client";

type AuthFormProps = {
  email: string;
  password: string;
  showPassword: boolean;
  error: string | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onShowPasswordToggle: () => void;
  emailInputId: string;
  passwordInputId: string;
  passwordAutoComplete: "current-password" | "new-password";
  submitLabel: string;
  submittingLabel: string;
};

export function AuthForm({
  email,
  password,
  showPassword,
  error,
  submitting,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  emailInputId,
  passwordInputId,
  passwordAutoComplete,
  submitLabel,
  submittingLabel,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <input
        id={emailInputId}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Email address"
        className="w-full rounded-xl border-2 border-[#c4a77d] bg-[#f5ede0] px-5 py-3.5 text-base text-black placeholder:text-gray-500 focus:border-[#a08060] focus:outline-none"
      />
      <div className="relative">
        <input
          id={passwordInputId}
          type={showPassword ? "text" : "password"}
          autoComplete={passwordAutoComplete}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border-2 border-[#c4a77d] bg-[#f5ede0] px-5 py-3.5 pr-20 text-base text-black placeholder:text-gray-500 focus:border-[#a08060] focus:outline-none"
        />
        <button
          type="button"
          onClick={onShowPasswordToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-black"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 w-full rounded-full border-2 border-[#c4a77d] bg-[#f5ede0] px-5 py-3.5 font-semibold text-[#704214] hover:bg-[#ede4d5] disabled:opacity-50"
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}

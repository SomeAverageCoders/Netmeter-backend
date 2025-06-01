const otpStore = new Map<string, string>();

export function storeOtp(mobile: string, otp: string) {
  otpStore.set(mobile, otp);
}

export function getOtp(mobile: string): string | undefined {
  return otpStore.get(mobile);
}

export function removeOtp(mobile: string) {
  otpStore.delete(mobile);
}

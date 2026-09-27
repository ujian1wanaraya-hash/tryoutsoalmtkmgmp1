// Service for managing Developer Authentication for Protected Features (Kunci & Pembahasan)

const DEV_AUTH_SESSION_KEY = 'cbt_dev_auth_unlocked';
const DEV_CUSTOM_PASSWORD_KEY = 'cbt_dev_custom_password';

// List of allowed default master passwords for developers/pengembang
const DEFAULT_ALLOWED_PASSWORDS = [
  'pengembang',
  'pengembang2026',
  'batola2026',
  'BATOLA2026',
  'PENGEMBANG',
  'ujian1wanaraya',
  'wanaraya2026',
  'admin1wanaraya',
];

const listeners = new Set<(isAuth: boolean) => void>();

export function isDevAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(DEV_AUTH_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function verifyDevPassword(password: string): boolean {
  if (!password) return false;
  const trimmed = password.trim();

  // Check against custom password set by developer
  try {
    const customPass = localStorage.getItem(DEV_CUSTOM_PASSWORD_KEY);
    if (customPass && trimmed === customPass.trim()) {
      return true;
    }
  } catch (e) {
    // Ignore storage errors
  }

  // Check against default master passwords
  return DEFAULT_ALLOWED_PASSWORDS.some(
    (allowed) => allowed.toLowerCase() === trimmed.toLowerCase()
  );
}

export function loginDev(password: string): boolean {
  if (verifyDevPassword(password)) {
    try {
      sessionStorage.setItem(DEV_AUTH_SESSION_KEY, 'true');
    } catch {
      // Ignore
    }
    notifyListeners(true);
    return true;
  }
  return false;
}

export function logoutDev(): void {
  try {
    sessionStorage.removeItem(DEV_AUTH_SESSION_KEY);
  } catch {
    // Ignore
  }
  notifyListeners(false);
}

export function setCustomDevPassword(newPassword: string): void {
  if (!newPassword || newPassword.trim().length < 4) return;
  try {
    localStorage.setItem(DEV_CUSTOM_PASSWORD_KEY, newPassword.trim());
  } catch {
    // Ignore
  }
}

export function subscribeDevAuth(callback: (isAuth: boolean) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(isAuth: boolean) {
  listeners.forEach((fn) => {
    try {
      fn(isAuth);
    } catch (e) {
      console.error('Error notifying dev auth listener:', e);
    }
  });
}

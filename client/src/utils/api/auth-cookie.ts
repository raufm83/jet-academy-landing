/**
 * Vahid NextAuth session cookie adı — həm Edge middleware, həm də Node auth
 * handler eyni adı oxusun/yazsın deyə ayrıca (yüngül, asılılıqsız) fayl.
 *
 * Cookie adı QƏSDƏN köhnə default `next-auth.session-token`-dan fərqlidir:
 * brauzerdə qalmış köhnə/zədələnmiş cookie-lər (məs. əvvəlki new.jetacademy.az
 * konfiqurasiyasından) tamamilə görməzdən gəlinir → "giriş edən kimi logout"
 * döngüsü aradan qalxır, istifadəçi heç nə təmizləməyə məcbur olmur.
 */

export function isSecureAuthCookies(): boolean {
  const url = process.env.NEXTAUTH_URL || "";
  if (url) return url.startsWith("https://");
  return process.env.NODE_ENV === "production";
}

export function getSessionCookieName(): string {
  return isSecureAuthCookies()
    ? "__Secure-jet-auth.session-token"
    : "jet-auth.session-token";
}

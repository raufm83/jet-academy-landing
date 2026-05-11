/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    /** SSR / server axios; boşdursa NEXT_PUBLIC_API_URL istifadə olunur */
    API_URL?: string;
    /** Proksi marşrutu üçün backend bazası (adətən NEXT_PUBLIC_API_URL ilə eyni) */
    API_PROXY_TARGET?: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_CDN_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}

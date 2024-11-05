import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "@/config/site";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Создаем middleware для интернационализации
const intlMiddleware = createMiddleware({
  locales,
  localePrefix,
  defaultLocale
});

// Список статических расширений файлов
const STATIC_FILE_EXTENSIONS = [
  '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', 
  '.svg', '.ico', '.webp', '.woff', '.woff2'
];

// Проверка является ли путь статическим файлом
const isStaticFile = (pathname: string) => {
  return STATIC_FILE_EXTENSIONS.some(ext => pathname.endsWith(ext));
};

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Пропускаем API маршруты, _next и статические файлы
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    isStaticFile(pathname)
  ) {
    return NextResponse.next();
  }

  // Применяем интернационализацию
  const response = await intlMiddleware(request);
  
  // Если это редирект, сохраняем параметры запроса
  if (response.headers.get("Location")) {
    const redirectUrl = new URL(response.headers.get("Location")!);
    const searchParams = new URL(request.url).searchParams;
    
    // Копируем все параметры запроса в URL редиректа
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Пропускаем API маршруты и статические файлы
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};

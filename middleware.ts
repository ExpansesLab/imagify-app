import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "@/config/site";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from "next-auth/middleware";

// Список статических расширений файлов
const STATIC_FILE_EXTENSIONS = [
  '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', 
  '.svg', '.ico', '.webp', '.woff', '.woff2'
];

// Проверка является ли путь статическим файлом
const isStaticFile = (pathname: string) => {
  return STATIC_FILE_EXTENSIONS.some(ext => pathname.endsWith(ext));
};

// Создаем middleware для интернационализации
const intlMiddleware = createMiddleware({
  locales,
  localePrefix,
  defaultLocale
});

// Создаем комбинированный middleware
async function middleware(request: NextRequest) {
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

// Оборачиваем middleware в withAuth для добавления аутентификации
export default withAuth(middleware as any, {
  callbacks: {
    authorized: ({ req, token }) => {
      // Публичные маршруты, доступные без аутентификации
      const publicPaths = [
        '/',
        '/sign-in',
        '/sign-up',
        '/api/auth',
        '/explore-image',
      ];

      // Проверяем, является ли текущий путь публичным
      const isPublicPath = publicPaths.some(path => 
        req.nextUrl.pathname.startsWith(path) ||
        req.nextUrl.pathname.startsWith(`/${defaultLocale}${path}`)
      );

      // Разрешаем доступ к публичным маршрутам или если пользователь аутентифицирован
      return isPublicPath || !!token;
    }
  }
});

export const config = {
  matcher: [
    // Пропускаем API маршруты и статические файлы
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};

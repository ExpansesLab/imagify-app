"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import UserDropdown from "./UserDropdown";

export default function SignButtonGroup() {
  const { data: session, status } = useSession();
  const t = useTranslations('Auth');
  
  // Показываем загрузку
  if (status === "loading") {
    return null;
  }

  // Если пользователь авторизован, показываем UserDropdown
  if (session?.user) {
    return <UserDropdown user={session.user} />;
  }

  // Если не авторизован, показываем кнопку входа
  return (
    <>
      <Link
        href="/sign-in"
        className="py-2 px-3 block items-center gap-x-2 text-sm font-medium rounded-xl border border-transparent bg-blue-400 text-black hover:bg-blue-500 transition disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-blue-500"
      >
        {t('signInButton')}
      </Link>
    </>
  );
}

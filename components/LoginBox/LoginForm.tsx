"use client";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, validateEmail } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function SignInForm() {
  const router = useRouter();
  const t = useTranslations('Auth');

  const onSignInByEmail = async () => {
    const emailAddress = document.getElementById(
      "emailAddress"
    ) as HTMLInputElement;
    const loggingPassword = document.getElementById(
      "loggingPassword"
    ) as HTMLInputElement;
    
    if (!validateEmail(emailAddress.value)) {
      toast.error("Неверный формат email адреса!");
      return;
    }
    if (!emailAddress.value) {
      toast.error("Email адрес не может быть пустым!");
      return;
    }
    if (!loggingPassword.value) {
      toast.error("Пароль не может быть пустым!");
      return;
    }

    try {
      const response = await signIn("credentials", {
        email: emailAddress.value,
        password: loggingPassword.value,
        redirect: false,
      });

      if (response?.ok) {
        toast.success("Успешный вход!");
        
        // Добавляем задержку для обновления сессии
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Сначала обновляем данные
        await router.refresh();
        
        // Затем делаем редирект с небольшой задержкой
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 500);
      } else {
        toast.error("Неправильный логин или пароль!");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("При входе произошла ошибка");
    }
  };

  return (
    <>
      <div className="mt-4">
        <label
          className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
          htmlFor="emailAddress"
        >
          {t('emailLabel')}
        </label>
        <input
          id="emailAddress"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="email"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div className="mt-4">
        <div className="flex justify-between">
          <label
            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
            htmlFor="loggingPassword"
          >
            {t('passwordLabel')}
          </label>
        </div>

        <input
          id="loggingPassword"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="password"
        />
      </div>

      <div className="mt-6">
        <button
          onClick={onSignInByEmail}
          className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
        >
          {t('signInButton')}
        </button>
      </div>
    </>
  );
}

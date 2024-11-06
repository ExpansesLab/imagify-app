"use client";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { FormEvent } from "react";

export default function SignInForm() {
  const router = useRouter();
  const t = useTranslations('Auth');

  const onSignInByEmail = async (e: FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    if (!validateEmail(emailInput.value)) {
      toast.error("Неверный формат email адреса!");
      return;
    }
    if (!emailInput.value) {
      toast.error("Email адрес не может быть пустым!");
      return;
    }
    if (!passwordInput.value) {
      toast.error("Пароль не может быть пустым!");
      return;
    }

    try {
      const response = await signIn("credentials", {
        email: emailInput.value,
        password: passwordInput.value,
        redirect: false,
      });

      if (response?.ok) {
        toast.success("Вход выполнен успешно!");
        router.push("/ru");
        router.refresh();
      } else {
        toast.error("Неверный email или пароль!");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Произошла ошибка при входе");
    }
  };

  return (
    <form onSubmit={onSignInByEmail} className="space-y-4">
      <div>
        <label
          className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
          htmlFor="email"
        >
          {t('emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="email"
          placeholder={t('emailPlaceholder')}
          required
        />
      </div>

      <div>
        <div className="flex justify-between">
          <label
            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
            htmlFor="password"
          >
            {t('passwordLabel')}
          </label>
        </div>

        <input
          id="password"
          name="password"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="password"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
      >
        {t('signInButton')}
      </button>

      <div className="text-center mt-4">
        <a href="/ru/sign-up" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
          {t('noAccount')} {t('signUp')}
        </a>
      </div>
    </form>
  );
}

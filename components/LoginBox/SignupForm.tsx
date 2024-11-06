"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { FormEvent } from "react";

export default function SignUpForm() {
  const router = useRouter();
  const t = useTranslations('Auth');

  const onSignUp = async (e: FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    const confirmPasswordInput = form.elements.namedItem('confirmPassword') as HTMLInputElement;

    if (!validateEmail(emailInput.value)) {
      toast.error("Неверный формат email адреса!");
      return;
    }
    if (!emailInput.value) {
      toast.error("Email адрес не может быть пустым!");
      return;
    }
    if (!usernameInput.value) {
      toast.error("Имя пользователя не может быть пустым!");
      return;
    }
    if (!passwordInput.value) {
      toast.error("Пароль не может быть пустым!");
      return;
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
      toast.error("Пароли не совпадают!");
      return;
    }

    try {
      const response = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value,
          username: usernameInput.value,
          password: passwordInput.value,
        }),
      });
      
      const data = await response.json();

      if (data.success) {
        toast.success("Регистрация успешна!");
        router.push("/ru/sign-in");
      } else {
        toast.error(data.message || "Ошибка при регистрации");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Произошла ошибка при регистрации");
    }
  };

  return (
    <form onSubmit={onSignUp} className="space-y-4">
      {/* email */}
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

      {/* username */}
      <div>
        <label
          className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
          htmlFor="username"
        >
          {t('usernameLabel')}
        </label>
        <input
          id="username"
          name="username"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="text"
          required
        />
      </div>

      {/* password */}
      <div>
        <label
          className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
          htmlFor="password"
        >
          {t('passwordLabel')}
        </label>
        <input
          id="password"
          name="password"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="password"
          required
          minLength={6}
        />
      </div>

      {/* confirm password */}
      <div>
        <label
          className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
          htmlFor="confirmPassword"
        >
          {t('confirmPasswordLabel')}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
          type="password"
          required
        />
      </div>

      {/* sign up button */}
      <button
        type="submit"
        className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
      >
        {t('signUpButton')}
      </button>

      <div className="text-center mt-4">
        <a href="/ru/sign-in" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
          {t('alreadyHaveAccount')} {t('signIn')}
        </a>
      </div>
    </form>
  );
}

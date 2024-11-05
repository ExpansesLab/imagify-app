import { getServerSession } from "next-auth";
import { Toaster } from "sonner";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { locale: string } }) {
    const t = await getTranslations("Profile");
    return {
        title: t("layoutTitle"),
        description: t("layoutDescription"),
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.png",
            apple: "/favicon.png",
        }
    };
}

export default async function ProfilePage({
    params: { locale },
}: {
    params: { locale: string };
}) {
    const session = await getServerSession();

    if (!session || !session.user) {
        redirect(`/${locale}/login`);
    }

    const user = session.user;
    const dbUser = await prisma.user.findUnique({
        where: { email: user.email || "" }
    });

    return (
        <main className="pt-4 relative z-50">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-neutral-900 shadow rounded-lg p-6">
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="h-24 w-24 rounded-full overflow-hidden">
                                <img
                                    src={user.image || "/default-avatar.png"}
                                    alt={user.name || "User"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                                    {user.name}
                                </h2>
                                <p className="text-gray-600 dark:text-neutral-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                                Информация о пользователе
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                                        Доступные кредиты
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900 dark:text-neutral-100">
                                            {dbUser?.credits || 0}
                                        </p>
                                        <Link 
                                            href={`/${locale}/pricing`}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Купить дополнительные кредиты
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-center" richColors />
        </main>
    );
}

import { siteConfig } from "../../config/site";

const Navs: any[] = [
    {
        label: "Ресурсы",
        items: [
            { title: "FAQ", href: "/#FAQ" },
            { title: "Генерация", href: "/ai-image-generator" },
            { title: "Галерея", href: "/explore-image" },
            { title: "Тарифы", href: "/pricing" },
        ],
    },
    {
        label: "Правовая информация",
        items: [
            {
                href: "/privacy-policy",
                title: "Политика конфиденциальности",
            },
            {
                href: "/terms-of-service",
                title: "Условия использования",
            },
        ],
    },
    {
        label: "Поддержка",
        items: [
            {
                href: `mailto:support@${siteConfig.domain}`,
                title: `support@${siteConfig.domain}`,
            },
        ],
    },
];

export default Navs;

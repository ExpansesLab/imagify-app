/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePrediction } from "../../hooks/usePrediction";
import LoginDialog from "../LoginBox/LoginDialog";
import { useTranslations } from "next-intl";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css'
import { ImageIcon } from "lucide-react";
import ApplicationsOf from "../Applications/ApplicationsOf";
import ImageToolbar from "../Toolbars/ImageToolbar";
import { Icons } from "../Icons";

const ImageGenerator = ({ user, generated, onCreditsUpdate }: any) => {
    const leftElementRef = useRef<any>(null);
    const [elementHeight, setElementHeight] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [openLogin, setOpenLogin] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [textPrompts, setTextPrompts] = useState("");
    const [credits, setCredits] = useState(user?.credits ?? 0);
    const [aspectRatio, setAspectRatio] = useState([
        { label: "1:1", ratio: "1:1", id: "ratio-1-1", checked: true },
        { label: "16:9", ratio: "16:9", id: "ratio-16-9" },
        { label: "9:16", ratio: "9:16", id: "ratio-9-16" },
        { label: "3:2", ratio: "3:2", id: "ratio-3-2" },
        { label: "2:3", ratio: "2:3", id: "ratio-2-3" },
    ]);
    const [model, setModel] = useState([
        { label: "flux.1 schnell", value: "schnell", selected: true },
        { label: "flux.1 dev", value: "dev" },
        { label: "flux.1 pro", value: "pro" },
        { label: "flux 1.1 pro", value: "1.1-pro" },
        { label: "SD 3.5 medium", value: "sd-3.5-medium" },
        { label: "SD 3.5 large turbo", value: "sd-3.5-large-turbo" },
        { label: "SD 3", value: "sd-3" },
        { label: "SDXL", value: "sdxl" }
    ]);
    const [isPublic, setIsPublic] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    
    const {
        error,
        prediction,
        generation,
        translatedPrompt,
        handleSubmit,
    } = usePrediction();
    
    const t = useTranslations();

    useLayoutEffect(() => {
        if (leftElementRef.current) {
            setElementHeight(leftElementRef.current.clientHeight);
        }
    }, []);

    // Обновляем credits при изменении user?.credits
    useLayoutEffect(() => {
        setCredits(user?.credits ?? 0);
    }, [user?.credits]);

    const handleGenerative = async () => {
        if (!user) {
            setOpenLogin(true);
            return;
        }

        if (!textPrompts.trim()) {
            toast.error(t("Please enter the prompt word!"));
            return;
        }

        setGenerating(true);
        try {
            const result = await handleSubmit({
                prompts: textPrompts,
                ratio: aspectRatio.find((item) => item.checked)?.ratio,
                model: model.find((item) => item.selected)?.value,
                isPublic,
                user,
            });
            
            // Обновляем локальное состояние credits и уведомляем родительский компонент
            if (result?.credits !== undefined) {
                setCredits(result.credits);
                if (onCreditsUpdate) {
                    onCreditsUpdate(result.credits);
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleShare = async (social: string) => {
        if (!user) {
            setOpenLogin(true);
            return;
        }

        if (!generation?.url) {
            return;
        }

        const imageUrl = generation.url;
        const shareText = encodeURIComponent("Check this image generated with AI");
        const shareUrl = encodeURIComponent(window.location.href);

        let url = "";
        switch (social) {
            case "telegram":
                url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
                break;
            case "whatsapp":
                url = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;
                break;
            case "instagram":
                // Для Instagram нужно показать уведомление, так как прямой шеринг невозможен
                toast.info("Сохраните изображение и поделитесь им в Instagram");
                return;
            default:
                return;
        }

        window.open(url, "_blank", "width=600,height=400");
    };

    const handleDownload = async (onDownloaded: () => void) => {
        if (!user) {
            setOpenLogin(true);
            return;
        }
        if (generation?.url) {
            try {
                const response = await fetch(generation.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `image-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                onDownloaded();
            } catch (error) {
                console.error('Ошибка при скачивании:', error);
                toast.error('Ошибка при скачивании изображения');
            }
        }
    };

    const handleZoomChange = useCallback((shouldZoom: boolean) => {
        setIsZoomed(shouldZoom);
    }, []);

    return (
        <>
            <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-7 space-y-4" ref={leftElementRef}>
                        <div className="space-y-2">
                            <label htmlFor="prompts" className="inline-block text-sm font-medium text-gray-800 mt-2.5 dark:text-neutral-200">
                                {t("Generation.formPromptsLabel")}
                            </label>

                            <textarea
                                id="prompts"
                                className="py-2 px-3 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                rows={6}
                                placeholder={t("Generation.formPromptsPlaceholer")}
                                value={textPrompts}
                                onChange={(e) => setTextPrompts(e.target.value)}
                            />

                            {/* Отображаем переведенный промпт, если он есть */}
                            {translatedPrompt && (
                                <div className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
                                    <span className="font-medium">Перевод:</span> {translatedPrompt}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="ratio" className="inline-block text-sm font-medium text-gray-800 mt-2.5 dark:text-neutral-200">
                                {t("Generation.formRatioLabel")}
                            </label>

                            <div className="grid sm:grid-cols-5 gap-2">
                                {aspectRatio.map((item, idx) => (
                                    <div key={idx}>
                                        <label htmlFor={item.id} className="flex p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                                            <input
                                                type="radio"
                                                name="aspect-ratio"
                                                className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                                id={item.id}
                                                checked={item.checked}
                                                onChange={() => {
                                                    setAspectRatio(aspectRatio.map(r => ({
                                                        ...r,
                                                        checked: r.id === item.id
                                                    })));
                                                }}
                                            />
                                            <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">
                                                {item.label}
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="model" className="inline-block text-sm font-medium text-gray-800 mt-2.5 dark:text-neutral-200">
                                {t("Generation.formModelsLabel")}
                            </label>

                            <div className="grid sm:grid-cols-5 gap-2">
                                <select
                                    id="model"
                                    className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                    value={model.find(m => m.selected)?.value}
                                    onChange={(e) => {
                                        setModel(model.map(m => ({
                                            ...m,
                                            selected: m.value === e.target.value
                                        })));
                                    }}
                                >
                                    {model.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="public" className="inline-block text-sm font-medium text-gray-800 mt-2.5 dark:text-neutral-200">
                                {t("Generation.formPublicLabel")}
                            </label>

                            <div className="grid sm:grid-cols-5 gap-2">
                                <input
                                    type="checkbox"
                                    id="public"
                                    className="relative w-[3.25rem] h-7 p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-600 before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-neutral-400 dark:checked:before:bg-blue-200"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                            </div>
                        </div>

                        <div className="grid mt-20">
                            <div className="flex flex-col gap-2">
                                <div className="text-sm text-gray-500 dark:text-neutral-400">
                                    Доступно кредитов: {credits ?? 0}
                                </div>
                                <button
                                    type="button"
                                    className="py-2.5 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                                    disabled={generating}
                                    onClick={handleGenerative}
                                >
                                    {generating && (
                                        <span className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full" />
                                    )}
                                    {t("ai-image-generator.generateButton")}
                                    <span className="py-1 px-4 flex items-center gap-x-1 text-xs font-medium text-gray-100 rounded-full">
                                        <Icons.CreditsIcon />1
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-10 lg:mt-0 lg:col-span-5" style={{ maxHeight: elementHeight + "px" }}>
                        <div className="space-y-2 flex flex-col h-full overflow-hidden">
                            <label className="inline-block text-sm font-medium text-gray-800 mt-2.5 dark:text-neutral-200">
                                {t("Generation.formResultLabel")}
                            </label>

                            <div className="group relative flex flex-col w-full min-h-60 flex-1 border border-dashed border-gray-300 bg-gray-100 dark:bg-neutral-900 dark:border-neutral-700 bg-center rounded-xl items-center justify-center focus:outline-none transition overflow-hidden">
                                {!generation ? (
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                ) : (
                                    <>
                                        <ControlledZoom isZoomed={isZoomed} onZoomChange={handleZoomChange}>
                                            <img
                                                src={generation.url}
                                                className="object-contain"
                                                height={elementHeight}
                                                alt="Generated image"
                                                onLoad={() => setImageLoading(false)}
                                            />
                                        </ControlledZoom>
                                        
                                        <div className="absolute bottom-4 end-4">
                                            <div className="gen-image-toolbars flex">
                                                <ImageToolbar
                                                    imgUrl={generation.url}
                                                    handleDownload={handleDownload}
                                                    handleShare={handleShare}
                                                    handleMaximize={() => setIsZoomed(true)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <ApplicationsOf />
            </div>

            <LoginDialog open={openLogin} setOpen={setOpenLogin}>
                <div></div>
            </LoginDialog>
        </>
    );
};

export default ImageGenerator;


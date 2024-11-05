/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Download, Maximize, Share2 } from "lucide-react";
import { useState } from "react";

interface ImageToolbarProps {
    imgUrl?: string;
    handleDownload: (callback: () => void) => void;
    handleShare: (social: string) => void;
    handleMaximize: () => void;
    disabledDownload?: boolean;
    disabledShare?: boolean;
}

const ImageToolbar = ({
    imgUrl,
    handleDownload,
    handleShare,
    handleMaximize,
    disabledDownload,
    disabledShare,
}: ImageToolbarProps) => {
    const [downLoading, setDownLoading] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const handleDownloading = () => {
        setDownLoading(true);
        handleDownload(() => {
            setDownLoading(false);
        });
    };

    const toggleShareMenu = () => {
        setShowShareMenu(!showShareMenu);
    };

    return (
        <>
            {/* Download Button */}
            {!disabledDownload ? <div className="flex items-center gap-x-1 py-1 px-2">
                <button
                    type="button"
                    className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    onClick={handleDownloading}
                >
                    {downLoading ? (
                        <span
                            className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                            role="status"
                            aria-label="loading"
                        ></span>
                    ) : (
                        <Download className="shrink-0 size-4" />
                    )}
                </button>
            </div>: null}

            {/* Share Button */}
            {!disabledShare ? <div className="flex items-center gap-x-1 py-1 px-2 relative">
                <button
                    type="button"
                    className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    onClick={toggleShareMenu}
                >
                    <Share2 className="shrink-0 size-4" />
                </button>

                {showShareMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 z-50">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                onClick={() => {
                                    handleShare("telegram");
                                    setShowShareMenu(false);
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="size-5 fill-current">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                onClick={() => {
                                    handleShare("whatsapp");
                                    setShowShareMenu(false);
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="size-5 fill-current">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                onClick={() => {
                                    handleShare("instagram");
                                    setShowShareMenu(false);
                                }}
                            >
                                <svg viewBox="0 0 24 24" className="size-5 fill-current">
                                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 7.082c1.602 0 1.792.006 2.425.035 1.627.074 2.385.845 2.46 2.459.028.633.034.822.034 2.424s-.006 1.792-.034 2.424c-.075 1.613-.832 2.386-2.46 2.46-.633.028-.822.035-2.425.035-1.602 0-1.792-.006-2.424-.035-1.63-.075-2.385-.849-2.46-2.46-.028-.632-.035-.822-.035-2.424s.007-1.792.035-2.424c.074-1.615.832-2.386 2.46-2.46.632-.029.822-.034 2.424-.034zm0-1.082c-1.63 0-1.833.007-2.474.037-2.18.1-3.39 1.309-3.49 3.489-.029.641-.036.845-.036 2.474 0 1.63.007 1.834.036 2.474.1 2.179 1.31 3.39 3.49 3.49.641.029.844.036 2.474.036 1.63 0 1.834-.007 2.475-.036 2.176-.1 3.391-1.309 3.489-3.49.029-.64.036-.844.036-2.474 0-1.629-.007-1.833-.036-2.474-.098-2.177-1.309-3.39-3.489-3.489-.641-.03-.845-.037-2.475-.037zm0 2.919c-1.701 0-3.081 1.379-3.081 3.081s1.38 3.081 3.081 3.081 3.081-1.379 3.081-3.081c0-1.701-1.38-3.081-3.081-3.081zm0 5.081c-1.105 0-2-.895-2-2 0-1.104.895-2 2-2 1.104 0 2.001.895 2.001 2s-.897 2-2.001 2zm3.202-5.922c-.397 0-.72.322-.72.72 0 .397.322.72.72.72.398 0 .721-.322.721-.72 0-.398-.322-.72-.721-.72z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div> : null}

            {/* Maximize Button */}
            <div className="flex items-center gap-x-1 py-1 px-2">
                <button
                    type="button"
                    className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    onClick={handleMaximize}
                >
                    <Maximize className="shrink-0 size-4" />
                </button>
            </div>
        </>
    );
};

export default ImageToolbar;

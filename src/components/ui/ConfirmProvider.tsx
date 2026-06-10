"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FancyConfirm } from "./FancyConfirm";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info";
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<(ConfirmOptions & { resolve: (val: boolean) => void }) | null>(null);

    const confirm = (options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfig({ ...options, resolve });
        });
    };

    const handleConfirm = () => {
        if (config) {
            config.resolve(true);
            setConfig(null);
        }
    };

    const handleCancel = () => {
        if (config) {
            config.resolve(false);
            setConfig(null);
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {config && (
                <FancyConfirm
                    isOpen={true}
                    title={config.title}
                    message={config.message}
                    confirmText={config.confirmText}
                    cancelText={config.cancelText}
                    type={config.type}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
}

export const useFancyConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useFancyConfirm must be used within a ConfirmProvider");
    }
    return context;
};

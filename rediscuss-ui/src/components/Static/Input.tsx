'use client';

import React from "react";
import { twJoin, twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}


export default function Input({ label, className, ...props }: InputProps) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-semibold ">
                {label || "Gönderi Başlığı"}
            </label>
            <input
                type="text"
                className={twMerge( `border border-input bg-background rounded-md h-8 outline-0
                hover:border-primary-300
                focus:border-primary-400`, className)}
                {...props}
                
            />
        </div>
    );
}

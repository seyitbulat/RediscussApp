'use client';
import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useTransitionStyles } from "@floating-ui/react";
import { ChevronDown, LucideIcon, LucideProps } from "lucide-react";
import React, { ComponentType, useState } from "react";
import { twMerge } from "tailwind-merge";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

interface DropdownButtonProps {
    label?: string,
    className?: string,
    children?: React.ReactNode,
    iconName?: IconName
}

export default function DropdownButton({ label, className, children, iconName }: DropdownButtonProps) {
    const [expanded, setExpanded] = useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: expanded,
        onOpenChange: setExpanded,
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [offset(6), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate
    });

    const dismiss = useDismiss(context);

    const { isMounted, styles } = useTransitionStyles(context, {
        duration: { open: 100, close: 200 },
        initial: ({ side }) => ({
            opacity: 0,
            transform:
                side === 'bottom' ? 'translateY(-6px) scale(0.98)' : 'translateY(6px) scale(0.98)',
        }),
        open: { opacity: 1, transform: 'translateY(0) scale(1)' },
        common: ({ side }) => ({
            transformOrigin:
                side === 'top'
                    ? 'bottom left'
                    : side === 'bottom'
                        ? 'top left'
                        : side === 'left'
                            ? 'right top'
                            : 'left top',
        }),
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        dismiss
    ]);

    const handleClick = () => {
        setExpanded(v => !v);
    };

    const Icon =
        iconName && Icons[iconName]
            ? (Icons[iconName] as React.ComponentType<LucideProps>)
            : null;
    return (
        <div className="relative group">
            <button type="button" className={twMerge(`group rounded-xl min-w-30 inline-flex items-center px-2 gap-1 h-8 bg-background-500 text-primary-500 justify-between border border-secondary-100 shadow
                transition-colors
                hover:bg-background-600
                focus:bg-background-700
            `, className)}
                onClick={() => handleClick()}
                ref={refs.setReference}
                {...getReferenceProps()}
            >
                {Icon && (
                    <Icon
                        className={twMerge('w-5 h-5')}
                    />
                )}
                {label}
                <ChevronDown className={`w-6 h-6 transition-transform duration-400
                    ${expanded ? "rotate-180" : "rotate-0"}
                `}
                />
            </button>

            {isMounted && (
                <div
                    style={floatingStyles}
                    ref={refs.setFloating}
                    {...getFloatingProps()}
                    className="z-[1000]"  
                >
                    <div
                        className="min-w-[10rem] rounded-md border border-secondary-200 bg-white shadow-lg p-2"
                        style={styles}
                    >
                        {children}
                    </div>
                </div>
            )}

        </div>
    );
}
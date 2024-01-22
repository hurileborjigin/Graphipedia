import React, { CSSProperties, ReactNode } from "react";
export interface ControlsContainerProps {
    id?: string;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}
export declare const ControlsContainer: React.FC<ControlsContainerProps>;

import React, { ReactNode, CSSProperties } from "react";
export interface FullScreenControlProps {
    id?: string;
    className?: string;
    style?: CSSProperties;
    customEnterFullScreen?: ReactNode;
    customExitFullScreen?: ReactNode;
}
export declare const FullScreenControl: React.FC<FullScreenControlProps>;

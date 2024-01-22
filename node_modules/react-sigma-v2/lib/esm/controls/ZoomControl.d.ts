import React, { ReactNode, CSSProperties } from "react";
export interface ZoomControlProps {
    className?: string;
    style?: CSSProperties;
    animationDuration?: number;
    customZoomIn?: ReactNode;
    customZoomOut?: ReactNode;
    customZoomCenter?: ReactNode;
}
export declare const ZoomControl: React.FC<ZoomControlProps>;

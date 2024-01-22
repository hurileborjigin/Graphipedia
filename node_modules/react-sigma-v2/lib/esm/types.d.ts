import { CameraState, MouseCoords, TouchCoords, WheelCoords } from "sigma/types";
export interface MouseEvent {
    event: MouseCoords;
    preventSigmaDefault: () => void;
}
export interface TouchEvent {
    event: TouchCoords;
}
export interface NodeEvent {
    node: string;
}
export interface WheelEvent {
    event: WheelCoords;
    preventSigmaDefault: () => void;
}
export interface EdgeEvent {
    edge: string;
}
export declare type MouseNodeEvent = MouseEvent & NodeEvent;
export declare type WheelNodeEvent = WheelEvent & NodeEvent;
export declare type MouseEdgeEvent = MouseEvent & EdgeEvent;
export declare type WheelEdgeEvent = WheelEvent & EdgeEvent;
export interface EventHandlers {
    clickNode: (e: MouseNodeEvent) => void;
    rightClickNode: (e: MouseNodeEvent) => void;
    downNode: (e: MouseNodeEvent) => void;
    doubleClickNode: (e: MouseNodeEvent) => void;
    wheelNode: (e: WheelNodeEvent) => void;
    enterNode: (e: NodeEvent) => void;
    leaveNode: (e: NodeEvent) => void;
    clickEdge: (e: MouseEdgeEvent) => void;
    rightClickEdge: (e: MouseEdgeEvent) => void;
    downEdge: (e: MouseEdgeEvent) => void;
    doubleClickEdge: (e: MouseEdgeEvent) => void;
    wheelEdge: (e: WheelEdgeEvent) => void;
    enterEdge: (e: EdgeEvent) => void;
    leaveEdge: (e: EdgeEvent) => void;
    clickStage: (e: MouseEvent) => void;
    rightClickStage: (e: MouseEvent) => void;
    doubleClickStage: (e: MouseEvent) => void;
    wheelStage: (e: WheelEvent) => void;
    downStage: (e: MouseEvent) => void;
    click: (e: MouseCoords) => void;
    doubleClick: (e: MouseCoords) => void;
    wheel: (e: WheelCoords) => void;
    rightClick: (e: MouseCoords) => void;
    mouseup: (e: MouseCoords) => void;
    mousedown: (e: MouseCoords) => void;
    mousemove: (e: MouseCoords) => void;
    touchup: (e: TouchCoords) => void;
    touchdown: (e: TouchCoords) => void;
    touchmove: (e: TouchCoords) => void;
    kill: () => void;
    cameraUpdated: (e: CameraState) => void;
}

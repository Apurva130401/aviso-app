"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    MousePointer2, Hand, Type, ImageIcon, Square, Circle as CircleIcon,
    Trash2, Download, Copy, Layers, ChevronDown,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
    Lock, Unlock, FlipHorizontal, FlipVertical, RotateCcw,
    Palette, Plus, Minus, Eye, EyeOff, ArrowUp, ArrowDown, ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ToolId = "select" | "pan" | "text" | "image" | "rect" | "circle";

interface CanvasObjectInfo {
    type: string;
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    opacity: number;
    fill: string;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: string;
    fontWeight?: string;
    fontStyle?: string;
    underline?: boolean;
    text?: string;
    scaleX: number;
    scaleY: number;
    lockMovementX: boolean;
    lockMovementY: boolean;
    visible: boolean;
}

const DEFAULT_OBJ: CanvasObjectInfo = {
    type: "", left: 0, top: 0, width: 0, height: 0, angle: 0, opacity: 1, fill: "#ffffff",
    scaleX: 1, scaleY: 1, lockMovementX: false, lockMovementY: false, visible: true,
};

const CANVAS_PRESETS = [
    { label: "Instagram Story", w: 1080, h: 1920 },
    { label: "Instagram Post", w: 1080, h: 1080 },
    { label: "Facebook Ad", w: 1200, h: 628 },
    { label: "Twitter Post", w: 1200, h: 675 },
    { label: "LinkedIn Banner", w: 1584, h: 396 },
    { label: "YouTube Thumbnail", w: 1280, h: 720 },
    { label: "Custom", w: 800, h: 600 },
];

const COLOR_SWATCHES = [
    "#000000", "#FFFFFF", "#FBBF24", "#F97316", "#EF4444",
    "#EC4899", "#8B5CF6", "#10B981", "#06B6D4", "#3B82F6",
];

export default function StudioPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [activeTool, setActiveTool] = useState<ToolId>("select");
    const [selectedObj, setSelectedObj] = useState<CanvasObjectInfo | null>(null);
    const [canvasSize, setCanvasSize] = useState({ w: 1080, h: 1080 });
    const [canvasPreset, setCanvasPreset] = useState("Instagram Post");
    const [showPresets, setShowPresets] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [objectCount, setObjectCount] = useState(0);
    const [canvasBg, setCanvasBg] = useState("#FFFFFF");
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Initialize Fabric canvas
    useEffect(() => {
        let canvas: any = null;

        const initCanvas = async () => {
            const fabric = await import("fabric");
            if (!canvasRef.current) return;

            canvas = new fabric.Canvas(canvasRef.current, {
                width: canvasSize.w,
                height: canvasSize.h,
                backgroundColor: canvasBg,
                preserveObjectStacking: true,
                selection: true,
            });

            fabricRef.current = canvas;

            canvas.on("selection:created", () => syncSelection(canvas));
            canvas.on("selection:updated", () => syncSelection(canvas));
            canvas.on("selection:cleared", () => setSelectedObj(null));
            canvas.on("object:modified", () => syncSelection(canvas));
            canvas.on("object:scaling", () => syncSelection(canvas));
            canvas.on("object:moving", () => syncSelection(canvas));
            canvas.on("object:rotating", () => syncSelection(canvas));
            canvas.on("object:added", () => setObjectCount(canvas.getObjects().length));
            canvas.on("object:removed", () => setObjectCount(canvas.getObjects().length));

            fitCanvasToViewport(canvas);
        };

        initCanvas();

        return () => {
            if (canvas) canvas.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fitCanvasToViewport = useCallback((canvas: any, w?: number, h?: number) => {
        if (!containerRef.current || !canvas) return;
        const cw = w ?? canvasSize.w;
        const ch = h ?? canvasSize.h;
        const container = containerRef.current;
        const padding = 80;
        const availW = container.clientWidth - padding;
        const availH = container.clientHeight - padding;
        const scaleX = availW / cw;
        const scaleY = availH / ch;
        const scale = Math.min(scaleX, scaleY, 1);
        setZoom(Math.round(scale * 100));

        canvas.setZoom(scale);
        canvas.setDimensions({
            width: cw * scale,
            height: ch * scale,
        });
    }, [canvasSize]);

    const syncSelection = (canvas: any) => {
        const obj = canvas.getActiveObject();
        if (!obj) { setSelectedObj(null); return; }

        const info: CanvasObjectInfo = {
            type: obj.type || "",
            left: Math.round(obj.left || 0),
            top: Math.round(obj.top || 0),
            width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
            height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
            angle: Math.round(obj.angle || 0),
            opacity: obj.opacity ?? 1,
            fill: (typeof obj.fill === "string" ? obj.fill : "#000000"),
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            lockMovementX: obj.lockMovementX || false,
            lockMovementY: obj.lockMovementY || false,
            visible: obj.visible !== false,
        };

        if (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") {
            info.fontSize = obj.fontSize;
            info.fontFamily = obj.fontFamily;
            info.textAlign = obj.textAlign;
            info.fontWeight = obj.fontWeight;
            info.fontStyle = obj.fontStyle;
            info.underline = obj.underline;
            info.text = obj.text;
        }

        setSelectedObj(info);
    };

    // -------- TOOL ACTIONS --------
    const addText = async () => {
        const fabric = await import("fabric");
        const canvas = fabricRef.current;
        if (!canvas) return;

        const text = new fabric.IText("Double-click to edit", {
            left: canvasSize.w / 2 - 120,
            top: canvasSize.h / 2 - 20,
            fontSize: 36,
            fontFamily: "Inter, sans-serif",
            fill: "#000000",
            fontWeight: "bold",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addRect = async () => {
        const fabric = await import("fabric");
        const canvas = fabricRef.current;
        if (!canvas) return;

        const rect = new fabric.Rect({
            left: canvasSize.w / 2 - 75,
            top: canvasSize.h / 2 - 75,
            width: 150,
            height: 150,
            fill: "#FBBF24",
            rx: 12,
            ry: 12,
            strokeWidth: 0,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
    };

    const addCircle = async () => {
        const fabric = await import("fabric");
        const canvas = fabricRef.current;
        if (!canvas) return;

        const circle = new fabric.Circle({
            left: canvasSize.w / 2 - 50,
            top: canvasSize.h / 2 - 50,
            radius: 50,
            fill: "#EF4444",
            strokeWidth: 0,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
    };

    const addImage = async (file: File) => {
        const fabric = await import("fabric");
        const canvas = fabricRef.current;
        if (!canvas) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imgEl = document.createElement("img");
            imgEl.src = e.target?.result as string;
            imgEl.onload = () => {
                const img = new fabric.FabricImage(imgEl, {
                    left: 50,
                    top: 50,
                });
                // Scale image to fit canvas
                const maxDim = Math.max(canvasSize.w, canvasSize.h) * 0.6;
                const scale = Math.min(maxDim / imgEl.width, maxDim / imgEl.height, 1);
                img.scaleX = scale;
                img.scaleY = scale;
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            };
        };
        reader.readAsDataURL(file);
    };

    const deleteSelected = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (obj) {
            canvas.remove(obj);
            canvas.discardActiveObject();
            canvas.renderAll();
            setSelectedObj(null);
        }
    };

    const duplicateSelected = async () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;

        const cloned = await obj.clone();
        cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
    };

    const bringForward = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (obj) { canvas.bringObjectForward(obj); canvas.renderAll(); }
    };

    const sendBackward = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (obj) { canvas.sendObjectBackwards(obj); canvas.renderAll(); }
    };

    const exportCanvas = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        // Temporarily reset zoom
        const currentZoom = canvas.getZoom();
        canvas.setZoom(1);
        canvas.setDimensions({ width: canvasSize.w, height: canvasSize.h });

        const dataURL = canvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 1,
        });

        // Restore zoom
        canvas.setZoom(currentZoom);
        canvas.setDimensions({
            width: canvasSize.w * currentZoom,
            height: canvasSize.h * currentZoom,
        });

        const link = document.createElement("a");
        link.download = `aviso-studio-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    };

    const updateObjectProperty = (key: string, value: any) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;

        obj.set(key, value);
        canvas.renderAll();
        syncSelection(canvas);
    };

    const handleToolClick = (tool: ToolId) => {
        setActiveTool(tool);
        const canvas = fabricRef.current;
        if (!canvas) return;

        if (tool === "pan") {
            canvas.defaultCursor = "grab";
            canvas.selection = false;
        } else {
            canvas.defaultCursor = "default";
            canvas.selection = true;
        }

        if (tool === "text") addText();
        if (tool === "rect") addRect();
        if (tool === "circle") addCircle();
        if (tool === "image") fileInputRef.current?.click();
    };

    const handlePresetChange = (preset: typeof CANVAS_PRESETS[0]) => {
        setCanvasSize({ w: preset.w, h: preset.h });
        setCanvasPreset(preset.label);
        setShowPresets(false);

        const canvas = fabricRef.current;
        if (!canvas) return;

        // Update the internal dimensions with the preset values directly
        canvas.setDimensions({ width: preset.w, height: preset.h });
        canvas.setZoom(1);

        // Refit using the preset dimensions directly (avoid stale state)
        setTimeout(() => fitCanvasToViewport(canvas, preset.w, preset.h), 50);
    };

    const handleZoom = (delta: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const newZoom = Math.max(10, Math.min(300, zoom + delta));
        setZoom(newZoom);
        const scale = newZoom / 100;
        canvas.setZoom(scale);
        canvas.setDimensions({
            width: canvasSize.w * scale,
            height: canvasSize.h * scale,
        });
    };

    const handleBgChange = (color: string) => {
        setCanvasBg(color);
        const canvas = fabricRef.current;
        if (canvas) {
            canvas.backgroundColor = color;
            canvas.renderAll();
        }
    };

    const tools: { id: ToolId; icon: React.ReactNode; label: string }[] = [
        { id: "select", icon: <MousePointer2 size={18} />, label: "Select" },
        { id: "pan", icon: <Hand size={18} />, label: "Pan" },
        { id: "text", icon: <Type size={18} />, label: "Text" },
        { id: "image", icon: <ImageIcon size={18} />, label: "Image" },
        { id: "rect", icon: <Square size={18} />, label: "Rectangle" },
        { id: "circle", icon: <CircleIcon size={18} />, label: "Circle" },
    ];

    return (
        <div className="h-screen w-screen bg-[#030303] text-white flex flex-col p-4 gap-4 overflow-hidden font-sans">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) addImage(file);
                    e.target.value = "";
                }}
            />

            {/* ---- TOP BAR ---- */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">
                            Creative <span className="text-accent italic">Studio</span>
                        </h1>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                            {objectCount} object{objectCount !== 1 ? "s" : ""} on canvas
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Canvas Size Preset */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPresets(!showPresets)}
                            className="flex items-center gap-2 h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all"
                        >
                            {canvasPreset}
                            <ChevronDown size={12} />
                        </button>
                        {showPresets && (
                            <div className="absolute top-12 right-0 bg-[#111] border border-white/10 rounded-2xl p-2 z-50 min-w-[200px] shadow-2xl">
                                {CANVAS_PRESETS.map((p) => (
                                    <button
                                        key={p.label}
                                        onClick={() => handlePresetChange(p)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                            canvasPreset === p.label
                                                ? "bg-accent/10 text-accent"
                                                : "text-white/50 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {p.label}
                                        <span className="text-white/20 ml-2 normal-case tracking-normal">{p.w}×{p.h}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-white/5" />

                    {/* Quick Actions */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={duplicateSelected}
                        className="h-9 w-9 text-white/30 hover:text-white"
                        title="Duplicate"
                    >
                        <Copy size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteSelected}
                        className="h-9 w-9 text-white/30 hover:text-red-400"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </Button>

                    <div className="h-6 w-px bg-white/5" />

                    <Button
                        onClick={exportCanvas}
                        className="h-10 px-6 bg-accent text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Export PNG
                    </Button>
                </div>
            </div>

            {/* ---- MAIN WORKSPACE ---- */}
            <div className="flex-1 flex gap-4 min-h-0">

                {/* Left Toolbar */}
                <div className="w-16 bg-[#0a0a0a]/60 border border-white/[0.06] rounded-2xl flex flex-col items-center py-4 gap-1 shadow-xl">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id)}
                            title={tool.label}
                            className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group",
                                activeTool === tool.id
                                    ? "bg-accent/15 text-accent shadow-[0_0_12px_rgba(255,170,0,0.1)]"
                                    : "text-white/25 hover:text-white/60 hover:bg-white/5"
                            )}
                        >
                            {tool.icon}
                            {activeTool === tool.id && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
                            )}
                            {/* Tooltip */}
                            <span className="absolute left-14 px-2.5 py-1.5 bg-[#111] border border-white/10 rounded-lg text-[9px] font-bold text-white/70 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {tool.label}
                            </span>
                        </button>
                    ))}

                    <div className="w-8 h-px bg-white/5 my-2" />

                    {/* Layer ordering */}
                    <button
                        onClick={bringForward}
                        title="Bring Forward"
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        onClick={sendBackward}
                        title="Send Backward"
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
                    >
                        <ArrowDown size={16} />
                    </button>
                </div>

                {/* Canvas Area */}
                <div
                    ref={containerRef}
                    className="flex-1 bg-[#080808] rounded-3xl border border-white/[0.04] flex items-center justify-center relative overflow-auto"
                    style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "24px 24px" }}
                >
                    <div className="relative" style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}>
                        <canvas ref={canvasRef} />
                    </div>

                    {/* Bottom bar */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                        <button onClick={() => handleZoom(-10)} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                            <Minus size={14} />
                        </button>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest min-w-[40px] text-center">
                            {zoom}%
                        </span>
                        <button onClick={() => handleZoom(10)} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                            <Plus size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <span className="text-[10px] font-bold text-white/30 tracking-wide">
                            {canvasSize.w} × {canvasSize.h}
                        </span>
                    </div>
                </div>

                {/* ---- PROPERTIES PANEL ---- */}
                <div className="w-72 bg-[#0a0a0a]/60 border border-white/[0.06] rounded-2xl p-5 space-y-5 shadow-xl overflow-y-auto min-h-0">

                    {/* Canvas Background */}
                    <div>
                        <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Canvas</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="w-8 h-8 rounded-lg border border-white/10 shadow-inner transition-transform hover:scale-110"
                                style={{ backgroundColor: canvasBg }}
                            />
                            <Input
                                value={canvasBg}
                                onChange={(e) => handleBgChange(e.target.value)}
                                className="h-8 bg-white/5 border-white/5 rounded-lg text-[10px] font-mono px-3"
                            />
                        </div>
                        {showColorPicker && (
                            <div className="grid grid-cols-5 gap-2 mt-3">
                                {COLOR_SWATCHES.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => { handleBgChange(c); setShowColorPicker(false); }}
                                        className="w-full aspect-square rounded-lg border border-white/10 transition-transform hover:scale-110"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-white/5" />

                    {!selectedObj ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MousePointer2 className="w-8 h-8 text-white/10 mb-3" />
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                Select an object
                            </p>
                            <p className="text-[9px] text-white/10 mt-1">
                                Click on an element to edit its properties
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Object Type Badge */}
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    {selectedObj.type}
                                </span>
                                <div className="flex-1" />
                                <button
                                    onClick={() => updateObjectProperty("visible", !selectedObj.visible)}
                                    className="text-white/30 hover:text-white transition-colors"
                                    title={selectedObj.visible ? "Hide" : "Show"}
                                >
                                    {selectedObj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button
                                    onClick={() => {
                                        const locked = !selectedObj.lockMovementX;
                                        updateObjectProperty("lockMovementX", locked);
                                        updateObjectProperty("lockMovementY", locked);
                                    }}
                                    className="text-white/30 hover:text-white transition-colors"
                                    title={selectedObj.lockMovementX ? "Unlock" : "Lock"}
                                >
                                    {selectedObj.lockMovementX ? <Lock size={14} /> : <Unlock size={14} />}
                                </button>
                            </div>

                            {/* Position & Size */}
                            <div>
                                <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Transform</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "X", key: "left", value: selectedObj.left },
                                        { label: "Y", key: "top", value: selectedObj.top },
                                        { label: "W", key: "width", value: selectedObj.width, readonly: true },
                                        { label: "H", key: "height", value: selectedObj.height, readonly: true },
                                    ].map((f) => (
                                        <div key={f.label} className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-white/30 w-4">{f.label}</span>
                                            <input
                                                type="number"
                                                value={f.value}
                                                readOnly={f.readonly}
                                                onChange={(e) => updateObjectProperty(f.key, parseInt(e.target.value) || 0)}
                                                className="flex-1 h-7 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-white px-2 focus:outline-none focus:border-accent/30 transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <RotateCcw size={10} className="text-white/30" />
                                        <input
                                            type="number"
                                            value={selectedObj.angle}
                                            onChange={(e) => updateObjectProperty("angle", parseInt(e.target.value) || 0)}
                                            className="flex-1 h-7 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-white px-2 focus:outline-none focus:border-accent/30 transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-white/30">α</span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            value={selectedObj.opacity}
                                            onChange={(e) => updateObjectProperty("opacity", parseFloat(e.target.value) || 1)}
                                            className="flex-1 h-7 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-white px-2 focus:outline-none focus:border-accent/30 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fill Color */}
                            <div>
                                <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Fill</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="w-8 h-8 rounded-lg border border-white/10 shadow-inner"
                                        style={{ backgroundColor: selectedObj.fill }}
                                    />
                                    <input
                                        type="text"
                                        value={selectedObj.fill}
                                        onChange={(e) => updateObjectProperty("fill", e.target.value)}
                                        className="flex-1 h-7 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-white px-2 focus:outline-none focus:border-accent/30 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-5 gap-1.5 mt-3">
                                    {COLOR_SWATCHES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => updateObjectProperty("fill", c)}
                                            className={cn(
                                                "w-full aspect-square rounded-md border transition-transform hover:scale-110",
                                                selectedObj.fill === c ? "border-accent shadow-[0_0_8px_rgba(255,170,0,0.3)]" : "border-white/10"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Text Properties */}
                            {(selectedObj.type === "i-text" || selectedObj.type === "textbox" || selectedObj.type === "text") && (
                                <div>
                                    <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Typography</h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <select
                                            value={selectedObj.fontFamily || "Inter, sans-serif"}
                                            onChange={(e) => updateObjectProperty("fontFamily", e.target.value)}
                                            className="flex-1 h-7 bg-white/5 border border-white/5 rounded-lg text-[10px] text-white px-2 focus:outline-none focus:border-accent/30 appearance-none cursor-pointer"
                                        >
                                            <option value="Inter, sans-serif">Inter</option>
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="monospace">Monospace</option>
                                            <option value="Courier New, monospace">Courier</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={selectedObj.fontSize || 24}
                                            min={8}
                                            max={200}
                                            onChange={(e) => updateObjectProperty("fontSize", parseInt(e.target.value) || 24)}
                                            className="w-14 h-7 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-white px-2 text-center focus:outline-none focus:border-accent/30"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {[
                                            { icon: <Bold size={13} />, key: "fontWeight", active: selectedObj.fontWeight === "bold", on: "bold", off: "normal" },
                                            { icon: <Italic size={13} />, key: "fontStyle", active: selectedObj.fontStyle === "italic", on: "italic", off: "normal" },
                                            { icon: <Underline size={13} />, key: "underline", active: selectedObj.underline, on: true, off: false },
                                        ].map((btn, i) => (
                                            <button
                                                key={i}
                                                onClick={() => updateObjectProperty(btn.key, btn.active ? btn.off : btn.on)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                    btn.active ? "bg-accent/15 text-accent" : "text-white/30 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {btn.icon}
                                            </button>
                                        ))}
                                        <div className="w-px h-5 bg-white/5 mx-1" />
                                        {[
                                            { icon: <AlignLeft size={13} />, value: "left" },
                                            { icon: <AlignCenter size={13} />, value: "center" },
                                            { icon: <AlignRight size={13} />, value: "right" },
                                        ].map((btn) => (
                                            <button
                                                key={btn.value}
                                                onClick={() => updateObjectProperty("textAlign", btn.value)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                    selectedObj.textAlign === btn.value ? "bg-accent/15 text-accent" : "text-white/30 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {btn.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                                <button onClick={duplicateSelected} className="flex-1 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                                    <Copy size={12} /> Duplicate
                                </button>
                                <button onClick={deleteSelected} className="flex-1 h-8 rounded-lg bg-red-500/5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>

                            {/* Flip */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const canvas = fabricRef.current;
                                        const obj = canvas?.getActiveObject();
                                        if (obj) { obj.set("flipX", !obj.flipX); canvas.renderAll(); }
                                    }}
                                    className="flex-1 h-8 rounded-lg bg-white/5 text-white/30 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                    <FlipHorizontal size={12} /> Flip H
                                </button>
                                <button
                                    onClick={() => {
                                        const canvas = fabricRef.current;
                                        const obj = canvas?.getActiveObject();
                                        if (obj) { obj.set("flipY", !obj.flipY); canvas.renderAll(); }
                                    }}
                                    className="flex-1 h-8 rounded-lg bg-white/5 text-white/30 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                    <FlipVertical size={12} /> Flip V
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
    Edit3,
    MousePointer2,
    Eraser,
    Download,
    Trash2,
    Minus,
    Plus,
} from "lucide-react";

type Tool = "pen" | "eraser";

export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tool, setTool] = useState<Tool>("pen");
    const [lineWidth, setLineWidth] = useState(3);
    const [color, setColor] = useState("#f59e0b"); // Default amber
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                const newWidth = Math.floor(width);
                const newHeight = Math.floor(height);

                // Only resize if the integer dimensions changed
                if (canvas.width === newWidth && canvas.height === newHeight) continue;

                // Save existing content before resize (as resize clears the canvas)
                const tempCanvas = document.createElement("canvas");
                const tempCtx = tempCanvas.getContext("2d");

                if (canvas.width > 0 && canvas.height > 0) {
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    if (tempCtx) {
                        tempCtx.drawImage(canvas, 0, 0);
                    }
                }

                // Apply new size
                canvas.width = newWidth;
                canvas.height = newHeight;

                // Restore context state (cleared by resize)
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = color;
                ctx.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;
                if (tool === "eraser") {
                    ctx.globalCompositeOperation = "destination-out";
                }

                // Restore previous content
                if (tempCanvas.width > 0 && tempCanvas.height > 0) {
                    ctx.drawImage(tempCanvas, 0, 0);
                }
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [color, lineWidth, tool]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        const { x, y } = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Configure context based on tool
        if (tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = lineWidth * 5; // Erase area is larger
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) ctx.closePath();
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        let clientX = 0;
        let clientY = 0;

        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "loomgrad-whiteboard.png";
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden shadow-inner">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border-b border-zinc-100 bg-zinc-50/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setTool("pen")}
                        className={`p-1.5 rounded-lg transition-all ${tool === "pen" ? "bg-amber-500 text-white shadow-sm" : "text-zinc-400 hover:bg-zinc-50"}`}
                        title="Pen Tool"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTool("eraser")}
                        className={`p-1.5 rounded-lg transition-all ${tool === "eraser" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:bg-zinc-50"}`}
                        title="Eraser Tool"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-zinc-300 cursor-not-allowed">
                        <MousePointer2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-2 py-1 shadow-sm">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
                            className="p-1 text-zinc-400 hover:text-zinc-900"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-bold text-zinc-600 w-4 text-center">{lineWidth}</span>
                        <button
                            onClick={() => setLineWidth(Math.min(20, lineWidth + 1))}
                            className="p-1 text-zinc-400 hover:text-zinc-900"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl p-1.5 shadow-sm">
                    {["#f59e0b", "#3b82f6", "#ef4444", "#10b981", "#000000"].map((c) => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool("pen"); }}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${color === c && tool === "pen" ? "border-zinc-900 scale-125" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={clearCanvas}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Clear Board"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={downloadImage}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl shadow-lg shadow-zinc-900/10 transition-all pointer-events-auto"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Export PNG</span>
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="flex-1 relative cursor-crosshair bg-white touch-none group"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />

                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full"
                />

                {!isDrawing && (
                    <div className="absolute bottom-6 right-6 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
                        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full shadow-sm">
                            <MousePointer2 className="w-3 h-3" />
                            Canvas Active
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

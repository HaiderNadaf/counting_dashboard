// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Crosshair, Trash2, Check, X, RotateCcw, Camera } from "lucide-react";

// type Point = { x: number; y: number };

// interface ROIButtonProps {
//   videoUrl?: string; // pass the youtube embed URL from parent
// }

// export default function ROIButton({ videoUrl }: ROIButtonProps) {
//   const API = process.env.NEXT_PUBLIC_API_URL;

//   const [open, setOpen] = useState(false);
//   const [points, setPoints] = useState<Point[]>([]);
//   const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "err">("idle");
//   const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
//   const [capturing, setCapturing] = useState(false);

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const imgRef = useRef<HTMLImageElement | null>(null);

//   useEffect(() => {
//     if (!open) return;
//     setPoints([]);
//     setSaveStatus("idle");
//     captureFrame();
//   }, [open]);

//   function extractYouTubeId(url: string): string | null {
//     const embedMatch = url.match(/embed\/([^?&]+)/);
//     if (embedMatch) return embedMatch[1];
//     try {
//       return new URL(url).searchParams.get("v");
//     } catch {
//       return null;
//     }
//   }

//   async function captureFrame() {
//     setCapturing(true);
//     setCapturedFrame(null);
//     imgRef.current = null;

//     const loadImage = (src: string, cors = false) =>
//       new Promise<HTMLImageElement>((resolve, reject) => {
//         const img = new Image();
//         if (cors) img.crossOrigin = "anonymous";
//         img.onload = () => resolve(img);
//         img.onerror = reject;
//         img.src = src;
//       });

//     // 1. Try backend snapshot first (your Python script saves rtsp-sample.jpg)
//     try {
//       const res = await fetch(`${API}/roi/frame?t=${Date.now()}`, {
//         cache: "no-store",
//       });
//       if (res.ok) {
//         const blob = await res.blob();
//         const url = URL.createObjectURL(blob);
//         const img = await loadImage(url);
//         imgRef.current = img;
//         setCapturedFrame(url);
//         setCapturing(false);
//         return;
//       }
//     } catch {}

//     // 2. Fallback: use YouTube thumbnail from the current video
//     if (videoUrl) {
//       const videoId = extractYouTubeId(videoUrl);
//       if (videoId) {
//         for (const quality of ["maxresdefault", "hqdefault", "mqdefault"]) {
//           try {
//             const thumbUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
//             const img = await loadImage(thumbUrl, true);
//             imgRef.current = img;
//             setCapturedFrame(thumbUrl);
//             setCapturing(false);
//             return;
//           } catch {}
//         }
//       }
//     }

//     // 3. No image available — blank canvas
//     setCapturing(false);
//   }

//   // Redraw canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     if (imgRef.current) {
//       ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
//       ctx.fillStyle = "rgba(0,0,0,0.3)";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//     } else {
//       ctx.fillStyle = "#0a0f1e";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.strokeStyle = "rgba(99,102,241,0.1)";
//       ctx.lineWidth = 1;
//       for (let x = 0; x < canvas.width; x += 40) {
//         ctx.beginPath();
//         ctx.moveTo(x, 0);
//         ctx.lineTo(x, canvas.height);
//         ctx.stroke();
//       }
//       for (let y = 0; y < canvas.height; y += 40) {
//         ctx.beginPath();
//         ctx.moveTo(0, y);
//         ctx.lineTo(canvas.width, y);
//         ctx.stroke();
//       }
//     }

//     const allPts = hoverPoint ? [...points, hoverPoint] : points;

//     if (allPts.length >= 2) {
//       ctx.beginPath();
//       ctx.moveTo(allPts[0].x, allPts[0].y);
//       allPts.forEach((p) => ctx.lineTo(p.x, p.y));
//       ctx.closePath();
//       ctx.fillStyle = "rgba(16,185,129,0.15)";
//       ctx.fill();

//       ctx.beginPath();
//       ctx.moveTo(allPts[0].x, allPts[0].y);
//       allPts.forEach((p) => ctx.lineTo(p.x, p.y));
//       ctx.closePath();
//       ctx.strokeStyle = "#10b981";
//       ctx.lineWidth = 2.5;
//       ctx.setLineDash(hoverPoint ? [8, 4] : []);
//       ctx.stroke();
//       ctx.setLineDash([]);
//     } else if (allPts.length === 1 && hoverPoint) {
//       ctx.beginPath();
//       ctx.moveTo(allPts[0].x, allPts[0].y);
//       ctx.lineTo(hoverPoint.x, hoverPoint.y);
//       ctx.strokeStyle = "rgba(16,185,129,0.5)";
//       ctx.lineWidth = 1.5;
//       ctx.setLineDash([6, 4]);
//       ctx.stroke();
//       ctx.setLineDash([]);
//     }

//     points.forEach((p, i) => drawPoint(ctx, p, i));
//   }, [points, hoverPoint, capturedFrame]);

//   function drawPoint(ctx: CanvasRenderingContext2D, p: Point, i: number) {
//     const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
//     g.addColorStop(0, "rgba(16,185,129,0.5)");
//     g.addColorStop(1, "rgba(16,185,129,0)");
//     ctx.beginPath();
//     ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
//     ctx.fillStyle = g;
//     ctx.fill();

//     ctx.beginPath();
//     ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
//     ctx.fillStyle = "#10b981";
//     ctx.fill();
//     ctx.strokeStyle = "#fff";
//     ctx.lineWidth = 2;
//     ctx.stroke();

//     ctx.fillStyle = "#fff";
//     ctx.font = "bold 11px monospace";
//     ctx.fillText(`P${i + 1}`, p.x + 10, p.y - 6);
//   }

//   function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
//     const canvas = canvasRef.current!;
//     const rect = canvas.getBoundingClientRect();
//     return {
//       x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
//       y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height)),
//     };
//   }

//   async function handleSave() {
//     if (points.length < 3) return;
//     setSaving(true);
//     try {
//       const res = await fetch(`${API}/roi/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ points }),
//       });
//       setSaveStatus(res.ok ? "ok" : "err");
//       if (res.ok) setTimeout(() => setOpen(false), 1200);
//     } catch {
//       setSaveStatus("err");
//     }
//     setSaving(false);
//   }

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="flex items-center gap-2 px-3 py-2 bg-violet-600/80 hover:bg-violet-600 rounded-lg transition text-sm font-medium"
//         title="Configure Region of Interest"
//       >
//         <Crosshair size={15} />
//         ROI
//       </button>

//       {open && (
//         <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
//           <div
//             className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full flex flex-col"
//             style={{ maxWidth: 960, maxHeight: "92vh" }}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
//               <div className="flex items-center gap-3">
//                 <Crosshair className="text-violet-400" size={20} />
//                 <div>
//                   <h2 className="text-base font-semibold">
//                     Draw Region of Interest
//                   </h2>
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     Click to place points · Right-click to remove last · Min 3
//                     points
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setOpen(false)}
//                 className="p-2 hover:bg-gray-800 rounded-lg transition"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Canvas Area */}
//             <div className="flex-1 p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
//               {capturing ? (
//                 <div
//                   className="flex-1 flex items-center justify-center text-gray-500"
//                   style={{ minHeight: 400 }}
//                 >
//                   <div className="text-center">
//                     <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//                     <p className="text-sm">Capturing video frame…</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div
//                   className="relative rounded-xl overflow-hidden border border-gray-700"
//                   style={{ minHeight: 400 }}
//                 >
//                   <canvas
//                     ref={canvasRef}
//                     width={1280}
//                     height={720}
//                     onClick={({ nativeEvent: _, ...e }) => {
//                       const coords = getCanvasCoords(
//                         e as React.MouseEvent<HTMLCanvasElement>,
//                       );
//                       setPoints((prev) => [...prev, coords]);
//                     }}
//                     onMouseMove={(e) => {
//                       if (points.length === 0) return;
//                       setHoverPoint(getCanvasCoords(e));
//                     }}
//                     onMouseLeave={() => setHoverPoint(null)}
//                     onContextMenu={(e) => {
//                       e.preventDefault();
//                       setPoints((p) => p.slice(0, -1));
//                     }}
//                     className="w-full h-full cursor-crosshair block"
//                   />
//                   <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
//                     {points.length} pt{points.length !== 1 ? "s" : ""}
//                     {points.length >= 3 && " · ready ✓"}
//                   </div>
//                   {!capturedFrame && (
//                     <div className="absolute top-3 right-3 bg-amber-900/60 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-300">
//                       No frame — drawing on blank canvas
//                     </div>
//                   )}
//                   {capturedFrame && (
//                     <div className="absolute top-3 right-3 bg-black/60 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-300">
//                       📷 Frame captured
//                     </div>
//                   )}
//                 </div>
//               )}

//               {points.length > 0 && (
//                 <div className="flex gap-2 flex-wrap">
//                   {points.map((p, i) => (
//                     <span
//                       key={i}
//                       className="text-xs font-mono bg-gray-800 border border-gray-700 rounded px-2 py-1 text-emerald-300"
//                     >
//                       P{i + 1} ({p.x}, {p.y})
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-3">
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPoints((p) => p.slice(0, -1))}
//                   disabled={points.length === 0}
//                   className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition disabled:opacity-40"
//                 >
//                   <RotateCcw size={14} /> Undo
//                 </button>
//                 <button
//                   onClick={() => setPoints([])}
//                   disabled={points.length === 0}
//                   className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition disabled:opacity-40"
//                 >
//                   <Trash2 size={14} /> Clear
//                 </button>
//                 <button
//                   onClick={() => {
//                     setPoints([]);
//                     captureFrame();
//                   }}
//                   className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
//                   title="Re-capture latest frame from video"
//                 >
//                   <Camera size={14} /> Recapture
//                 </button>
//               </div>

//               <div className="flex items-center gap-3">
//                 {saveStatus === "ok" && (
//                   <span className="text-emerald-400 text-sm flex items-center gap-1">
//                     <Check size={14} /> Saved!
//                   </span>
//                 )}
//                 {saveStatus === "err" && (
//                   <span className="text-red-400 text-sm">Save failed</span>
//                 )}
//                 <button
//                   onClick={() => setOpen(false)}
//                   className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={points.length < 3 || saving}
//                   className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   {saving ? (
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <Check size={15} />
//                   )}
//                   Save ROI
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Trash2, Check, X, RotateCcw, Camera } from "lucide-react";

type Point = { x: number; y: number };

interface ROIButtonProps {
  onSaved?: (points: Point[]) => void;
}

export default function ROIButton({ onSaved }: ROIButtonProps) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "err">("idle");
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setPoints([]);
    setSaveStatus("idle");
    captureFrame();
  }, [open]);

  async function captureFrame() {
    setCapturing(true);
    setCapturedFrame(null);
    imgRef.current = null;

    const loadImage = (src: string, cors = false) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (cors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    // 1. Try backend snapshot first
    try {
      const res = await fetch(`${API}/roi/frame?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const img = await loadImage(url);
        imgRef.current = img;
        setCapturedFrame(url);
        setCapturing(false);
        return;
      }
    } catch {}

    // 2. Blank canvas fallback
    setCapturing(false);
  }

  // Redraw canvas whenever points/hover/frame changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0a0f1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(99,102,241,0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    const allPts = hoverPoint ? [...points, hoverPoint] : points;

    if (allPts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(allPts[0].x, allPts[0].y);
      allPts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = "rgba(16,185,129,0.15)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(allPts[0].x, allPts[0].y);
      allPts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.5;
      ctx.setLineDash(hoverPoint ? [8, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (allPts.length === 1 && hoverPoint) {
      ctx.beginPath();
      ctx.moveTo(allPts[0].x, allPts[0].y);
      ctx.lineTo(hoverPoint.x, hoverPoint.y);
      ctx.strokeStyle = "rgba(16,185,129,0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    points.forEach((p, i) => drawPoint(ctx, p, i));
  }, [points, hoverPoint, capturedFrame]);

  function drawPoint(ctx: CanvasRenderingContext2D, p: Point, i: number) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
    g.addColorStop(0, "rgba(16,185,129,0.5)");
    g.addColorStop(1, "rgba(16,185,129,0)");
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`P${i + 1}`, p.x + 10, p.y - 6);
  }

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height)),
    };
  }

  async function handleSave() {
    if (points.length < 3) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/roi/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });
      if (res.ok) {
        setSaveStatus("ok");
        onSaved?.(points); // ← notify parent with saved points
        setTimeout(() => setOpen(false), 1200);
      } else {
        setSaveStatus("err");
      }
    } catch {
      setSaveStatus("err");
    }
    setSaving(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-violet-600/80 hover:bg-violet-600 rounded-lg transition text-sm font-medium"
        title="Configure Region of Interest"
      >
        <Crosshair size={15} />
        ROI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full flex flex-col"
            style={{ maxWidth: 960, maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <Crosshair className="text-violet-400" size={20} />
                <div>
                  <h2 className="text-base font-semibold">
                    Draw Region of Interest
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click to place points · Right-click to remove last · Min 3
                    points
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
              {capturing ? (
                <div
                  className="flex-1 flex items-center justify-center text-gray-500"
                  style={{ minHeight: 400 }}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Capturing video frame…</p>
                  </div>
                </div>
              ) : (
                <div
                  className="relative rounded-xl overflow-hidden border border-gray-700"
                  style={{ minHeight: 400 }}
                >
                  <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    onClick={(e) =>
                      setPoints((prev) => [...prev, getCanvasCoords(e)])
                    }
                    onMouseMove={(e) => {
                      if (points.length === 0) return;
                      setHoverPoint(getCanvasCoords(e));
                    }}
                    onMouseLeave={() => setHoverPoint(null)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setPoints((p) => p.slice(0, -1));
                    }}
                    className="w-full h-full cursor-crosshair block"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                    {points.length} pt{points.length !== 1 ? "s" : ""}
                    {points.length >= 3 && " · ready ✓"}
                  </div>
                  {!capturedFrame && (
                    <div className="absolute top-3 right-3 bg-amber-900/60 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-300">
                      No frame — drawing on blank canvas
                    </div>
                  )}
                  {capturedFrame && (
                    <div className="absolute top-3 right-3 bg-black/60 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                      📷 Frame captured
                    </div>
                  )}
                </div>
              )}

              {points.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {points.map((p, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono bg-gray-800 border border-gray-700 rounded px-2 py-1 text-emerald-300"
                    >
                      P{i + 1} ({p.x}, {p.y})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPoints((p) => p.slice(0, -1))}
                  disabled={points.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition disabled:opacity-40"
                >
                  <RotateCcw size={14} /> Undo
                </button>
                <button
                  onClick={() => setPoints([])}
                  disabled={points.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition disabled:opacity-40"
                >
                  <Trash2 size={14} /> Clear
                </button>
                <button
                  onClick={() => {
                    setPoints([]);
                    captureFrame();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                >
                  <Camera size={14} /> Recapture
                </button>
              </div>

              <div className="flex items-center gap-3">
                {saveStatus === "ok" && (
                  <span className="text-emerald-400 text-sm flex items-center gap-1">
                    <Check size={14} /> Saved!
                  </span>
                )}
                {saveStatus === "err" && (
                  <span className="text-red-400 text-sm">Save failed</span>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={points.length < 3 || saving}
                  className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  Save ROI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

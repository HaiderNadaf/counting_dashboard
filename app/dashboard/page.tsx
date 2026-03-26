// "use client";

// import { useEffect, useState } from "react";

// type Msg = {
//   id: string;
//   body: any; // 👈 change here
//   receipt?: string;
// } | null;

// type Row = {
//   _id: string;
//   truck_number: string;
//   count: number;
//   updated: number;
// };

// export default function HomePage() {
//   const API = process.env.NEXT_PUBLIC_API_URL;

//   const [message, setMessage] = useState<Msg>(null);
//   const [approveValue, setApproveValue] = useState("");
//   const [rows, setRows] = useState<Row[]>([]);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [editValue, setEditValue] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");
//   const [purging, setPurging] = useState(false);
//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [completeTruck, setCompleteTruck] = useState("");
//   const [completeDate, setCompleteDate] = useState("");

//   useEffect(() => {
//     fetchCachedMessage();
//     fetchStream(); // only once
//     fetchApprovals();
//   }, []);

//   async function fetchCachedMessage() {
//     const res = await fetch(`${API}/message`, { cache: "no-store" });
//     setMessage(await res.json());
//   }

//   async function fetchNext() {
//     const res = await fetch(`${API}/fetch`, { method: "POST" });
//     setMessage(await res.json());
//   }

//   function openCompleteModal() {
//     if (!message?.body) return;

//     setCompleteTruck(message.body.truck_number || "");
//     setCompleteDate(new Date().toISOString().split("T")[0]); // default today
//     setShowCompleteModal(true);
//   }

//   async function confirmComplete() {
//     try {
//       await fetch(`${API}/totals/complete`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           truck_number: completeTruck,
//           date: completeDate,
//         }),
//       });

//       setShowCompleteModal(false);
//       alert("SQS Count Completed ✅");
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   async function fetchApprovals() {
//     try {
//       const res = await fetch(`${API}/approvals`);
//       const data = await res.json();

//       setRows(
//         data.map((item: any) => ({
//           _id: item._id,
//           truck_number: item.truck_number,
//           count: item.original_count,
//           updated: item.approved_count,
//         })),
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   /** ⭐ APPROVE (IMPORTANT FIX — stores DB id) */
//   async function approve() {
//     if (!message) return;

//     const res = await fetch(`${API}/approve`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ approvedValue: approveValue, message }),
//     });

//     const data = await res.json();

//     // setRows((p) => [
//     //   ...p,
//     //   {
//     //     _id: data.record._id,
//     //     truck_number: data.record.truck_number,
//     //     count: data.record.original_count,
//     //     updated: data.record.approved_count,
//     //   },
//     // ]);

//     // if (data.record) {
//     //   setRows((p) => [
//     //     ...p,
//     //     {
//     //       _id: data.record._id,
//     //       truck_number: data.record.truck_number,
//     //       count: data.record.original_count,
//     //       updated: data.record.approved_count,
//     //     },
//     //   ]);
//     // }
//     if (data.record) {
//       fetchApprovals(); // always sync with DB
//     }

//     setApproveValue("");

//     const next = await fetch(`${API}/fetch`, { method: "POST" });
//     setMessage(await next.json());
//   }

//   async function purgeQueue() {
//     if (purging) return;
//     if (!confirm("Clear queue?")) return;

//     setPurging(true);

//     await fetch(`${API}/deleteAll`, { method: "POST" });

//     setRows([]);
//     setMessage(null);

//     setPurging(false);
//   }

//   /** ⭐ UPDATE (EDIT SAVE) */
//   async function saveEdit(index: number) {
//     const row = rows[index];

//     await fetch(`${API}/approval/${row._id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ approved_count: Number(editValue) }),
//     });

//     setRows((r) =>
//       r.map((x, i) => (i === index ? { ...x, updated: Number(editValue) } : x)),
//     );

//     setEditingIndex(null);
//     setEditValue("");
//   }

//   async function fetchStream() {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch("https://country-delight.markhet.app/youtube", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         console.log("Not authenticated");
//         return;
//       }

//       const data = await res.json();

//       if (!data.youtube_url) return;

//       const id = new URL(data.youtube_url).searchParams.get("v");
//       if (!id) return;

//       setVideoUrl(`https://www.youtube.com/embed/${id}`);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   const total = rows.reduce((s, r) => s + r.updated, 0);

//   return (
//     <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
//       {/* STREAM */}
//       {videoUrl ? (
//         <iframe className="w-full h-full" src={videoUrl} />
//       ) : (
//         <div className="flex items-center justify-center text-white/50">
//           No stream
//         </div>
//       )}

//       {/* RIGHT */}
//       <div className="p-6 bg-gray-900 text-white space-y-6">
//         <button
//           onClick={fetchNext}
//           className="w-full py-2 bg-indigo-600 rounded"
//         >
//           Fetch Next
//         </button>

//         <button onClick={purgeQueue} className="w-full py-2 bg-red-600 rounded">
//           {purging ? "Clearing..." : "Clear Queue"}
//         </button>

//         {/* CURRENT */}
//         <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Current Truck</div>

//           {message?.body ? (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr>
//                   <th className="text-left p-2">Truck</th>
//                   <th className="text-left p-2">Count</th>
//                   <th className="text-left p-2">Approve</th>
//                   <th />
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="p-2">{message.body.truck_number}</td>
//                   <td className="p-2">{message.body.count}</td>
//                   {/* <td className="p-2">
//                     <input
//                       value={approveValue}
//                       onChange={(e) => setApproveValue(e.target.value)}
//                       className="bg-black/40 p-2 rounded w-24"
//                     />
//                   </td> */}
//                   <td className="p-2">
//                     <input
//                       value={approveValue}
//                       onChange={(e) => setApproveValue(e.target.value)}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           approve(); // 🔥 triggers same function as button
//                         }
//                       }}
//                       className="bg-black/40 p-2 rounded w-24"
//                     />
//                   </td>
//                   <td className="flex gap-2">
//                     <button
//                       onClick={approve}
//                       className="bg-blue-600 px-3 py-2 rounded"
//                     >
//                       Approve
//                     </button>

//                     <button
//                       onClick={openCompleteModal}
//                       className="bg-green-600 px-3 py-2 rounded"
//                     >
//                       Complete
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           ) : (
//             <div>No message</div>
//           )}
//         </div>

//         {/* HISTORY */}
//         <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Approved Trucks</div>

//           <div className="h-64 overflow-auto border border-white/10 rounded">
//             <table className="w-full text-sm">
//               <thead className="sticky top-0 bg-gray-800">
//                 <tr>
//                   <th className="text-left p-2">Truck</th>
//                   <th className="text-left p-2">Count</th>
//                   <th className="text-left p-2">Updated</th>
//                   <th className="text-left p-2">Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {rows.map((r, i) => (
//                   <tr key={r._id} className="border-b border-white/10">
//                     <td className="p-2">{r.truck_number}</td>
//                     <td className="p-2">{r.count}</td>

//                     <td className="p-2">
//                       {editingIndex === i ? (
//                         <input
//                           value={editValue}
//                           onChange={(e) => setEditValue(e.target.value)}
//                           className="bg-black/40 p-1 w-20 rounded"
//                         />
//                       ) : (
//                         r.updated
//                       )}
//                     </td>

//                     <td className="p-2">
//                       {editingIndex === i ? (
//                         <button
//                           onClick={() => saveEdit(i)}
//                           className="bg-green-600 px-2 py-1 rounded"
//                         >
//                           Save
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             setEditingIndex(i);
//                             setEditValue(String(r.updated));
//                           }}
//                           className="bg-yellow-600 px-2 py-1 rounded"
//                         >
//                           Edit
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-3 font-bold">Total Updated Count: {total}</div>
//         </div>
//       </div>

//       {showCompleteModal && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//           <div className="bg-white text-black p-6 rounded-xl w-96 shadow-2xl space-y-5">
//             <div className="text-xl font-bold text-gray-800">
//               Complete SQS Count
//             </div>

//             {/* Truck */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Truck Number
//               </label>
//               <input
//                 value={completeTruck}
//                 onChange={(e) => setCompleteTruck(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             {/* Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={completeDate}
//                 onChange={(e) => setCompleteDate(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end gap-3 pt-2">
//               <button
//                 onClick={() => setShowCompleteModal(false)}
//                 className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={confirmComplete}
//                 className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import {
//   Truck,
//   CheckCircle2,
//   Trash2,
//   Edit2,
//   Save,
//   X,
//   Loader2,
// } from "lucide-react";

// type Msg = {
//   id: string;
//   body: any;
//   receipt?: string;
// } | null;

// type Row = {
//   _id: string;
//   truck_number: string;
//   count: number;
//   updated: number;
//   createdAt: string;
// };

// export default function HomePage() {
//   const API = process.env.NEXT_PUBLIC_API_URL;

//   const [message, setMessage] = useState<Msg>(null);
//   const [approveValue, setApproveValue] = useState("");
//   const [rows, setRows] = useState<Row[]>([]);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [editValue, setEditValue] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");

//   // Loading states
//   const [loadingInitial, setLoadingInitial] = useState(true);
//   const [loadingNext, setLoadingNext] = useState(false);
//   const [loadingApprove, setLoadingApprove] = useState(false);
//   const [loadingPurge, setLoadingPurge] = useState(false);
//   const [loadingComplete, setLoadingComplete] = useState(false);
//   const [loadingEdit, setLoadingEdit] = useState<number | null>(null); // per row

//   const [purging, setPurging] = useState(false);
//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [completeTruck, setCompleteTruck] = useState("");
//   const [completeDate, setCompleteDate] = useState("");

//   useEffect(() => {
//     const init = async () => {
//       setLoadingInitial(true);
//       await Promise.all([
//         fetchCachedMessage(),
//         fetchApprovals(),
//         fetchStream(),
//       ]);
//       setLoadingInitial(false);
//     };
//     init();
//   }, []);

//   async function fetchCachedMessage() {
//     try {
//       const res = await fetch(`${API}/message`, { cache: "no-store" });
//       if (res.ok) setMessage(await res.json());
//     } catch {}
//   }

//   async function fetchNext() {
//     setLoadingNext(true);
//     try {
//       const res = await fetch(`${API}/fetch`, { method: "POST" });
//       if (res.ok) setMessage(await res.json());
//     } catch {}
//     setLoadingNext(false);
//   }

//   async function approve() {
//     if (!message || loadingApprove) return;

//     setLoadingApprove(true);
//     try {
//       const res = await fetch(`${API}/approve`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ approvedValue: approveValue, message }),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.record) {
//           await fetchApprovals();
//         }
//         setApproveValue("");

//         // auto fetch next
//         const next = await fetch(`${API}/fetch`, { method: "POST" });
//         if (next.ok) setMessage(await next.json());
//       }
//     } catch {}
//     setLoadingApprove(false);
//   }

//   async function fetchApprovals() {
//     try {
//       const res = await fetch(`${API}/approvals`);
//       if (!res.ok) return;

//       const data = await res.json();
//       setRows(
//         data.map((item: any) => ({
//           _id: item._id || "",
//           truck_number: item.truck_number || "—",
//           count: item.original_count ?? 0,
//           updated: item.approved_count ?? 0,
//           createdAt: item.createdAt || item.updatedAt || item.date || "",
//         })),
//       );
//     } catch {}
//   }

//   async function saveEdit(index: number) {
//     const row = rows[index];
//     const newValue = Number(editValue);
//     if (isNaN(newValue)) return;

//     setLoadingEdit(index);
//     try {
//       const res = await fetch(`${API}/approval/${row._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ approved_count: newValue }),
//       });
//       if (res.ok) {
//         setRows((r) =>
//           r.map((x, i) => (i === index ? { ...x, updated: newValue } : x)),
//         );
//         setEditingIndex(null);
//         setEditValue("");
//       }
//     } catch {}
//     setLoadingEdit(null);
//   }

//   async function purgeQueue() {
//     if (loadingPurge) return;
//     if (!confirm("Really clear the entire queue?")) return;

//     setLoadingPurge(true);
//     try {
//       await fetch(`${API}/deleteAll`, { method: "POST" });
//       setRows([]);
//       setMessage(null);
//     } catch {}
//     setLoadingPurge(false);
//   }

//   function openCompleteModal() {
//     if (!message?.body) return;
//     setCompleteTruck(message.body.truck_number || "");
//     setCompleteDate(new Date().toISOString().split("T")[0]);
//     setShowCompleteModal(true);
//   }

//   async function confirmComplete() {
//     setLoadingComplete(true);
//     try {
//       const res = await fetch(`${API}/totals/complete`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           truck_number: completeTruck,
//           date: completeDate,
//         }),
//       });
//       if (res.ok) {
//         setShowCompleteModal(false);
//         alert("Truck marked as completed ✓");
//         await fetchApprovals();
//       } else {
//         alert("Failed to mark as complete");
//       }
//     } catch {
//       alert("Something went wrong");
//     }
//     setLoadingComplete(false);
//   }

//   async function fetchStream() {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const res = await fetch("https://country-delight.markhet.app/youtube", {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });
//       if (!res.ok) return;

//       const data = await res.json();
//       if (!data.youtube_url) return;

//       const id = new URL(data.youtube_url).searchParams.get("v");
//       if (id)
//         setVideoUrl(`https://www.youtube.com/embed/${id}?autoplay=1&mute=1`);
//     } catch {}
//   }

//   const total = rows.reduce((sum, r) => sum + r.updated, 0);

//   const formatDate = (value?: string) => {
//     if (!value || value.trim() === "") return "—";
//     const date = new Date(value);
//     if (isNaN(date.getTime()))
//       return value.substring(0, 16).replace("T", " ") || "Invalid";
//     return date
//       .toLocaleString("en-IN", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })
//       .replace(",", "");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 flex flex-col lg:flex-row">
//       {/* Left – Video / Stream */}
//       <div className="lg:w-3/5 h-[50vh] lg:h-screen relative">
//         {videoUrl ? (
//           <iframe
//             src={videoUrl}
//             allow="autoplay; fullscreen; picture-in-picture"
//             allowFullScreen
//             className="absolute inset-0 w-full h-full"
//           />
//         ) : (
//           <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black/40">
//             <div className="text-center">
//               <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
//               <p className="text-lg">No live stream available</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Right – Controls & Data */}
//       <div className="lg:w-2/5 flex flex-col h-[50vh] lg:h-screen overflow-hidden bg-gray-900/80 backdrop-blur-sm border-l border-gray-800">
//         <div className="p-5 border-b border-gray-800 flex items-center justify-between">
//           <h1 className="text-xl font-semibold flex items-center gap-2.5">
//             <Truck className="w-6 h-6 text-emerald-400" />
//             Truck Count Approval
//           </h1>
//           <div className="flex gap-2">
//             <button
//               onClick={fetchNext}
//               disabled={loadingNext || loadingInitial}
//               className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
//             >
//               {loadingNext && <Loader2 className="h-4 w-4 animate-spin" />}
//               Fetch Next
//             </button>

//             <button
//               onClick={purgeQueue}
//               disabled={loadingPurge || loadingInitial}
//               className="px-4 py-2 bg-red-600/70 hover:bg-red-600 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
//             >
//               {loadingPurge ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Trash2 size={16} />
//               )}
//               {loadingPurge ? "Clearing..." : "Purge"}
//             </button>
//           </div>
//         </div>

//         <div className="flex-1 p-5 space-y-6 overflow-y-auto">
//           {/* Current Truck Card */}
//           <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
//             <h2 className="text-lg font-medium mb-4 flex items-center justify-between">
//               <span className="text-emerald-400">Current</span>
//               {loadingInitial && (
//                 <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
//               )}
//             </h2>

//             {loadingInitial ? (
//               <div className="py-10 flex items-center justify-center gap-3 text-gray-500">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 Loading current truck...
//               </div>
//             ) : message?.body ? (
//               <div className="flex gap-6 items-center text-sm">
//                 <div>
//                   <div className="text-gray-400 text-xs mb-0.5">Truck</div>
//                   <div className="font-mono">{message.body.truck_number}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-400 text-xs mb-0.5">Count</div>
//                   <div className="font-semibold">{message.body.count}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-400 text-xs mb-0.5">Approve</div>
//                   <input
//                     value={approveValue}
//                     onChange={(e) => setApproveValue(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" && !loadingApprove) {
//                         e.preventDefault();
//                         approve();
//                       }
//                     }}
//                     disabled={loadingApprove}
//                     placeholder="Enter count"
//                     className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 w-[90px] focus:outline-none focus:border-indigo-500/60 transition disabled:opacity-60"
//                   />
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={approve}
//                     disabled={loadingApprove || !approveValue.trim()}
//                     className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
//                   >
//                     {loadingApprove ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <CheckCircle2 size={16} />
//                     )}
//                     Approve
//                   </button>
//                   <button
//                     onClick={openCompleteModal}
//                     disabled={loadingApprove}
//                     className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 px-4 py-2.5 rounded-lg transition font-medium disabled:opacity-60"
//                   >
//                     Complete
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-gray-500 py-8 text-center">
//                 No message loaded
//               </div>
//             )}
//           </div>

//           {/* History Table */}
//           <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
//             <div className="p-4 border-b border-gray-700 flex justify-between items-center">
//               <h2 className="font-medium flex items-center gap-2">
//                 Approved Trucks
//                 {/* Optional: show loading when refreshing approvals */}
//                 {/* {loadingApprovals && <Loader2 className="h-4 w-4 animate-spin" />} */}
//               </h2>
//               <div className="text-sm text-emerald-400 font-medium">
//                 Total: <span className="text-lg">{total}</span>
//               </div>
//             </div>

//             <div className="max-h-[calc(100vh-380px)] overflow-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-900/70 sticky top-0">
//                   <tr>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Truck
//                     </th>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Original
//                     </th>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Approved
//                     </th>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Date
//                     </th>
//                     <th className="w-24 p-4"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="p-8 text-center text-gray-500">
//                         No approved trucks yet
//                       </td>
//                     </tr>
//                   ) : (
//                     rows.map((row, i) => (
//                       <tr
//                         key={row._id}
//                         className="border-t border-gray-800 hover:bg-gray-800/40 transition"
//                       >
//                         <td className="p-4 font-mono">{row.truck_number}</td>
//                         <td className="p-4">{row.count}</td>
//                         <td className="p-4">
//                           {editingIndex === i ? (
//                             <input
//                               autoFocus
//                               value={editValue}
//                               onChange={(e) => setEditValue(e.target.value)}
//                               onKeyDown={(e) =>
//                                 e.key === "Enter" && !loadingEdit && saveEdit(i)
//                               }
//                               disabled={loadingEdit !== null}
//                               className="bg-gray-950 border border-gray-600 rounded px-2.5 py-1 w-20 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
//                             />
//                           ) : (
//                             <span className="font-medium">{row.updated}</span>
//                           )}
//                         </td>
//                         <td className="p-4 text-gray-300">
//                           {formatDate(row.createdAt)}
//                         </td>
//                         <td className="p-4">
//                           {editingIndex === i ? (
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => saveEdit(i)}
//                                 disabled={loadingEdit !== null}
//                                 className="p-1.5 bg-emerald-600/70 hover:bg-emerald-600 rounded transition disabled:opacity-50"
//                               >
//                                 {loadingEdit === i ? (
//                                   <Loader2 className="h-4 w-4 animate-spin" />
//                                 ) : (
//                                   <Save size={16} />
//                                 )}
//                               </button>
//                               <button
//                                 onClick={() => setEditingIndex(null)}
//                                 disabled={loadingEdit !== null}
//                                 className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
//                               >
//                                 <X size={16} />
//                               </button>
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => {
//                                 setEditingIndex(i);
//                                 setEditValue(String(row.updated));
//                               }}
//                               disabled={loadingEdit !== null}
//                               className="p-1.5 bg-amber-600/60 hover:bg-amber-600 rounded transition disabled:opacity-50"
//                             >
//                               <Edit2 size={16} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Complete Modal */}
//       {showCompleteModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
//               <CheckCircle2 className="text-emerald-400" />
//               Mark Truck as Completed
//             </h2>
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1.5">
//                   Truck Number
//                 </label>
//                 <input
//                   value={completeTruck}
//                   onChange={(e) => setCompleteTruck(e.target.value)}
//                   disabled={loadingComplete}
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1.5">
//                   Completion Date
//                 </label>
//                 <input
//                   type="date"
//                   value={completeDate}
//                   onChange={(e) => setCompleteDate(e.target.value)}
//                   disabled={loadingComplete}
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60"
//                 />
//               </div>
//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   onClick={() => setShowCompleteModal(false)}
//                   disabled={loadingComplete}
//                   className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmComplete}
//                   disabled={loadingComplete}
//                   className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {loadingComplete && (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   )}
//                   Confirm Complete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import {
//   Truck,
//   CheckCircle2,
//   Trash2,
//   Edit2,
//   Save,
//   X,
//   Loader2,
//   AlertCircle,
//   RefreshCw,
// } from "lucide-react";
// import ROIButton from "../components/ROIButton";

// type Msg = {
//   id: string;
//   body: any;
//   receipt?: string;
// } | null;

// type Row = {
//   _id: string;
//   truck_number: string;
//   count: number;
//   updated: number;
//   createdAt: string;
// };

// export default function HomePage() {
//   const API = process.env.NEXT_PUBLIC_API_URL;

//   const [message, setMessage] = useState<Msg>(null);
//   const [approveValue, setApproveValue] = useState("");
//   const [rows, setRows] = useState<Row[]>([]);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [editValue, setEditValue] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");

//   // Loading states
//   const [loadingInitial, setLoadingInitial] = useState(true);
//   const [loadingNext, setLoadingNext] = useState(false);
//   const [loadingApprove, setLoadingApprove] = useState(false);
//   const [loadingPurge, setLoadingPurge] = useState(false);
//   const [loadingComplete, setLoadingComplete] = useState(false);
//   const [loadingEdit, setLoadingEdit] = useState<number | null>(null);

//   // Error and info states
//   const [errorMessage, setErrorMessage] = useState("");
//   const [infoMessage, setInfoMessage] = useState("");

//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [completeTruck, setCompleteTruck] = useState("");
//   const [completeDate, setCompleteDate] = useState("");

//   useEffect(() => {
//     const init = async () => {
//       setLoadingInitial(true);
//       await Promise.all([
//         fetchCachedMessage(),
//         fetchApprovals(),
//         fetchStream(),
//       ]);
//       setLoadingInitial(false);
//     };
//     init();
//   }, []);

//   // Auto-clear messages after 5 seconds
//   useEffect(() => {
//     if (errorMessage || infoMessage) {
//       const timer = setTimeout(() => {
//         setErrorMessage("");
//         setInfoMessage("");
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [errorMessage, infoMessage]);

//   async function fetchCachedMessage() {
//     try {
//       const res = await fetch(`${API}/message`, { cache: "no-store" });
//       if (res.ok) {
//         const data = await res.json();
//         setMessage(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch cached message:", err);
//     }
//   }

//   async function fetchNext() {
//     setLoadingNext(true);
//     setErrorMessage("");
//     setInfoMessage("");

//     try {
//       const res = await fetch(`${API}/fetch`, { method: "POST" });

//       if (res.ok) {
//         const data = await res.json();

//         if (data?.empty) {
//           setMessage(null);
//           setApproveValue("");
//           setInfoMessage("Queue is empty - no messages available");
//           setLoadingNext(false);
//           return;
//         }

//         if (data?.expired) {
//           setErrorMessage("Previous message expired. Fetched new message.");
//         }

//         setMessage(data);
//         setApproveValue("");

//         if (data?.skippedDuplicates > 0) {
//           setInfoMessage(
//             `Skipped ${data.skippedDuplicates} duplicate message(s)`,
//           );
//         }
//       } else if (res.status === 410) {
//         setErrorMessage("Message expired. Fetching new message...");
//         setTimeout(() => fetchNext(), 1000);
//       } else {
//         setErrorMessage("Failed to fetch next message");
//       }
//     } catch (err) {
//       setErrorMessage("Network error - failed to fetch message");
//       console.error("Fetch next error:", err);
//     }

//     setLoadingNext(false);
//   }

//   async function approve() {
//     if (!message || loadingApprove) return;

//     const approveCount = Number(approveValue);
//     if (isNaN(approveCount)) {
//       setErrorMessage("Please enter a valid number");
//       return;
//     }

//     setLoadingApprove(true);
//     setErrorMessage("");
//     setInfoMessage("");

//     try {
//       const res = await fetch(`${API}/approve`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           approvedValue: approveCount,
//           message,
//         }),
//       });

//       if (res.status === 410) {
//         setErrorMessage("Message expired. Please fetch a new message.");
//         setMessage(null);
//         setApproveValue("");
//         setLoadingApprove(false);
//         return;
//       }

//       if (res.ok) {
//         const data = await res.json();

//         if (data.record) {
//           await fetchApprovals();
//           const sign = approveCount >= 0 ? "+" : "";
//           setInfoMessage(
//             `✓ Approved: ${message.body.truck_number} - ${sign}${approveCount} items`,
//           );
//         }

//         if (data.next) {
//           setMessage(data.next);
//           setApproveValue("");
//         } else {
//           setMessage(null);
//           setApproveValue("");
//           setInfoMessage("✓ Approved. Queue is now empty.");
//         }
//       } else {
//         const error = await res.json();
//         setErrorMessage(error.error || "Failed to approve");
//       }
//     } catch (err) {
//       setErrorMessage("Network error - failed to approve");
//       console.error("Approve error:", err);
//     }

//     setLoadingApprove(false);
//   }

//   async function fetchApprovals() {
//     try {
//       const res = await fetch(`${API}/approvals`);
//       if (!res.ok) return;

//       const data = await res.json();
//       setRows(
//         data.map((item: any) => ({
//           _id: item._id || "",
//           truck_number: item.truck_number || "—",
//           count: item.original_count ?? 0,
//           updated: item.approved_count ?? 0,
//           createdAt: item.createdAt || item.updatedAt || item.date || "",
//         })),
//       );
//     } catch (err) {
//       console.error("Failed to fetch approvals:", err);
//     }
//   }

//   async function saveEdit(index: number) {
//     const row = rows[index];
//     const newValue = Number(editValue);

//     if (isNaN(newValue)) {
//       setErrorMessage("Please enter a valid number");
//       return;
//     }

//     setLoadingEdit(index);
//     setErrorMessage("");

//     try {
//       const res = await fetch(`${API}/approval/${row._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ approved_count: newValue }),
//       });

//       if (res.ok) {
//         setRows((r) =>
//           r.map((x, i) => (i === index ? { ...x, updated: newValue } : x)),
//         );
//         setEditingIndex(null);
//         setEditValue("");
//         setInfoMessage("✓ Count updated successfully");
//       } else {
//         setErrorMessage("Failed to update count");
//       }
//     } catch (err) {
//       setErrorMessage("Network error - failed to update");
//       console.error("Edit error:", err);
//     }

//     setLoadingEdit(null);
//   }

//   async function purgeQueue() {
//     if (loadingPurge) return;
//     if (!confirm("⚠️ Really clear the entire queue? This cannot be undone."))
//       return;

//     setLoadingPurge(true);
//     setErrorMessage("");

//     try {
//       const res = await fetch(`${API}/deleteAll`, { method: "POST" });

//       if (res.ok) {
//         setMessage(null);
//         setApproveValue("");
//         setInfoMessage("✓ Queue purged successfully");
//       } else {
//         setErrorMessage("Failed to purge queue");
//       }
//     } catch (err) {
//       setErrorMessage("Network error - failed to purge");
//       console.error("Purge error:", err);
//     }

//     setLoadingPurge(false);
//   }

//   function openCompleteModal() {
//     if (!message?.body) {
//       setErrorMessage("No message loaded to complete");
//       return;
//     }
//     setCompleteTruck(message.body.truck_number || "");
//     setCompleteDate(new Date().toISOString().split("T")[0]);
//     setShowCompleteModal(true);
//   }

//   async function confirmComplete() {
//     if (!completeTruck.trim()) {
//       setErrorMessage("Please enter a truck number");
//       return;
//     }

//     if (!completeDate) {
//       setErrorMessage("Please select a date");
//       return;
//     }

//     setLoadingComplete(true);
//     setErrorMessage("");

//     try {
//       const res = await fetch(`${API}/totals/complete`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           truck_number: completeTruck,
//           date: completeDate,
//         }),
//       });

//       if (res.ok) {
//         setShowCompleteModal(false);
//         setInfoMessage(`✓ ${completeTruck} marked as completed`);
//         await fetchApprovals();
//       } else {
//         const error = await res.json();
//         setErrorMessage(error.error || "Failed to mark as complete");
//       }
//     } catch (err) {
//       setErrorMessage("Network error - failed to complete");
//       console.error("Complete error:", err);
//     }

//     setLoadingComplete(false);
//   }

//   async function fetchStream() {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const res = await fetch("https://country-delight.markhet.app/youtube", {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });
//       if (!res.ok) return;

//       const data = await res.json();
//       if (!data.youtube_url) return;

//       const id = new URL(data.youtube_url).searchParams.get("v");
//       if (id)
//         setVideoUrl(`https://www.youtube.com/embed/${id}?autoplay=1&mute=1`);
//     } catch (err) {
//       console.error("Failed to fetch stream:", err);
//     }
//   }

//   const total = rows.reduce((sum, r) => sum + r.updated, 0);

//   const formatDate = (value?: string) => {
//     if (!value || value.trim() === "") return "—";
//     const date = new Date(value);
//     if (isNaN(date.getTime()))
//       return value.substring(0, 16).replace("T", " ") || "Invalid";
//     return date
//       .toLocaleString("en-IN", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })
//       .replace(",", "");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 flex flex-col lg:flex-row">
//       {/* Left – Video / Stream */}
//       <div className="lg:w-3/5 h-[50vh] lg:h-screen relative">
//         {videoUrl ? (
//           <iframe
//             src={videoUrl}
//             allow="autoplay; fullscreen; picture-in-picture"
//             allowFullScreen
//             className="absolute inset-0 w-full h-full"
//           />
//         ) : (
//           <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black/40">
//             <div className="text-center">
//               <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
//               <p className="text-lg">No live stream available</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Right – Controls & Data */}
//       <div className="lg:w-2/5 flex flex-col h-[50vh] lg:h-screen overflow-hidden bg-gray-900/80 backdrop-blur-sm border-l border-gray-800">
//         {/* Header */}
//         <div className="p-5 border-b border-gray-800 flex items-center justify-between">
//           <h1 className="text-xl font-semibold flex items-center gap-2.5">
//             <Truck className="w-6 h-6 text-emerald-400" />
//             Truck Count Approval
//           </h1>

//           <div>
//             <ROIButton videoUrl={videoUrl} />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={fetchNext}
//               disabled={loadingNext || loadingInitial}
//               className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
//               title="Fetch next message (auto-skips duplicates)"
//             >
//               {loadingNext ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <RefreshCw size={16} />
//               )}
//               Fetch Next
//             </button>

//             <button
//               onClick={purgeQueue}
//               disabled={loadingPurge || loadingInitial}
//               className="px-4 py-2 bg-red-600/70 hover:bg-red-600 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
//               title="Clear entire queue"
//             >
//               {loadingPurge ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Trash2 size={16} />
//               )}
//               {loadingPurge ? "Clearing..." : "Purge"}
//             </button>
//           </div>
//         </div>

//         {/* Error/Info Messages */}
//         {(errorMessage || infoMessage) && (
//           <div className="mx-5 mt-4">
//             {errorMessage && (
//               <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-sm">
//                 <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
//                 <span className="text-red-200">{errorMessage}</span>
//               </div>
//             )}
//             {infoMessage && (
//               <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 flex items-start gap-2 text-sm">
//                 <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
//                 <span className="text-emerald-200">{infoMessage}</span>
//               </div>
//             )}
//           </div>
//         )}

//         <div className="flex-1 p-5 space-y-6 overflow-y-auto">
//           {/* Current Truck Card */}
//           <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
//             <h2 className="text-lg font-medium mb-4 flex items-center justify-between">
//               <span className="text-emerald-400">Current Truck</span>
//               {loadingInitial && (
//                 <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
//               )}
//             </h2>

//             {loadingInitial ? (
//               <div className="py-10 flex items-center justify-center gap-3 text-gray-500">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//                 Loading current truck...
//               </div>
//             ) : message?.body ? (
//               <div className="space-y-4">
//                 <div className="flex gap-6 items-center text-sm">
//                   <div>
//                     <div className="text-gray-400 text-xs mb-0.5">Truck</div>
//                     <div className="font-mono text-lg">
//                       {message.body.truck_number}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-400 text-xs mb-0.5">Count</div>
//                     <div className="font-semibold text-lg">
//                       {message.body.count}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex gap-3 items-end">
//                   <div className="flex-1">
//                     <label className="text-gray-400 text-xs mb-1.5 block">
//                       Approve Count
//                       <span className="ml-2 text-gray-500 text-[10px]">
//                         (use - for returns)
//                       </span>
//                     </label>
//                     <input
//                       type="number"
//                       step="1"
//                       value={approveValue}
//                       onChange={(e) => setApproveValue(e.target.value)}
//                       onKeyDown={(e) => {
//                         if (
//                           e.key === "Enter" &&
//                           !loadingApprove &&
//                           approveValue.trim()
//                         ) {
//                           e.preventDefault();
//                           approve();
//                         }
//                       }}
//                       disabled={loadingApprove}
//                       placeholder="Enter count (e.g., 100 or -5)"
//                       className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:border-indigo-500/60 transition disabled:opacity-60 font-medium"
//                     />
//                   </div>

//                   <button
//                     onClick={approve}
//                     disabled={loadingApprove || !approveValue.trim()}
//                     className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
//                   >
//                     {loadingApprove ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <CheckCircle2 size={16} />
//                     )}
//                     Approve
//                   </button>

//                   <button
//                     onClick={openCompleteModal}
//                     disabled={loadingApprove}
//                     className="bg-emerald-600/80 hover:bg-emerald-600 px-6 py-2.5 rounded-lg transition font-medium disabled:opacity-60"
//                   >
//                     Complete
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-gray-500 py-8 text-center">
//                 <div className="text-base mb-2">No message loaded</div>
//                 <div className="text-sm">
//                   Click "Fetch Next" to load a message
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* History Table */}
//           <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
//             <div className="p-4 border-b border-gray-700 flex justify-between items-center">
//               <h2 className="font-medium flex items-center gap-2">
//                 Approved Trucks
//                 <span className="text-gray-500 text-sm font-normal">
//                   ({rows.length})
//                 </span>
//               </h2>
//               <div className="text-sm font-medium">
//                 Total:{" "}
//                 <span
//                   className={`text-lg ${
//                     total >= 0 ? "text-emerald-400" : "text-red-400"
//                   }`}
//                 >
//                   {total >= 0 ? "+" : ""}
//                   {total}
//                 </span>
//               </div>
//             </div>

//             <div className="max-h-[calc(100vh-380px)] overflow-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-900/70 sticky top-0">
//                   <tr>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Truck
//                     </th>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Original
//                     </th>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Approved
//                     </th>
//                     <th className="text-left p-4 font-normal text-gray-400">
//                       Date
//                     </th>
//                     <th className="w-24 p-4"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="p-8 text-center text-gray-500">
//                         No approved trucks yet
//                       </td>
//                     </tr>
//                   ) : (
//                     rows.map((row, i) => (
//                       <tr
//                         key={row._id}
//                         className="border-t border-gray-800 hover:bg-gray-800/40 transition"
//                       >
//                         <td className="p-4 font-mono">{row.truck_number}</td>
//                         <td className="p-4">{row.count}</td>
//                         <td className="p-4">
//                           {editingIndex === i ? (
//                             <input
//                               type="number"
//                               step="1"
//                               autoFocus
//                               value={editValue}
//                               onChange={(e) => setEditValue(e.target.value)}
//                               onKeyDown={(e) => {
//                                 if (e.key === "Enter" && !loadingEdit) {
//                                   saveEdit(i);
//                                 } else if (e.key === "Escape") {
//                                   setEditingIndex(null);
//                                   setEditValue("");
//                                 }
//                               }}
//                               disabled={loadingEdit !== null}
//                               className="bg-gray-950 border border-gray-600 rounded px-2.5 py-1 w-20 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
//                             />
//                           ) : (
//                             <span
//                               className={`font-medium ${
//                                 row.updated < 0 ? "text-red-400" : ""
//                               }`}
//                             >
//                               {row.updated >= 0 ? "+" : ""}
//                               {row.updated}
//                             </span>
//                           )}
//                         </td>
//                         <td className="p-4 text-gray-300">
//                           {formatDate(row.createdAt)}
//                         </td>
//                         <td className="p-4">
//                           {editingIndex === i ? (
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => saveEdit(i)}
//                                 disabled={loadingEdit !== null}
//                                 className="p-1.5 bg-emerald-600/70 hover:bg-emerald-600 rounded transition disabled:opacity-50"
//                                 title="Save changes"
//                               >
//                                 {loadingEdit === i ? (
//                                   <Loader2 className="h-4 w-4 animate-spin" />
//                                 ) : (
//                                   <Save size={16} />
//                                 )}
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   setEditingIndex(null);
//                                   setEditValue("");
//                                 }}
//                                 disabled={loadingEdit !== null}
//                                 className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
//                                 title="Cancel"
//                               >
//                                 <X size={16} />
//                               </button>
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => {
//                                 setEditingIndex(i);
//                                 setEditValue(String(row.updated));
//                               }}
//                               disabled={loadingEdit !== null}
//                               className="p-1.5 bg-amber-600/60 hover:bg-amber-600 rounded transition disabled:opacity-50"
//                               title="Edit count"
//                             >
//                               <Edit2 size={16} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Complete Modal */}
//       {showCompleteModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
//               <CheckCircle2 className="text-emerald-400" />
//               Mark Truck as Completed
//             </h2>
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1.5">
//                   Truck Number
//                 </label>
//                 <input
//                   value={completeTruck}
//                   onChange={(e) => setCompleteTruck(e.target.value)}
//                   disabled={loadingComplete}
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60 font-mono"
//                   placeholder="Enter truck number"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1.5">
//                   Completion Date
//                 </label>
//                 <input
//                   type="date"
//                   value={completeDate}
//                   onChange={(e) => setCompleteDate(e.target.value)}
//                   disabled={loadingComplete}
//                   className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60"
//                 />
//               </div>
//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   onClick={() => setShowCompleteModal(false)}
//                   disabled={loadingComplete}
//                   className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmComplete}
//                   disabled={
//                     loadingComplete || !completeTruck.trim() || !completeDate
//                   }
//                   className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {loadingComplete && (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   )}
//                   Confirm Complete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Truck,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Keyboard,
} from "lucide-react";

type PlaybackConfig = {
  forwardKey: string;
  backwardKey: string;
  forwardSeconds: number;
  backwardSeconds: number;
};

type Msg = {
  id: string;
  body: any;
  receipt?: string;
} | null;

type Row = {
  _id: string;
  truck_number: string;
  count: number;
  updated: number;
  createdAt: string;
};

export default function HomePage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const [message, setMessage] = useState<Msg>(null);
  const [approveValue, setApproveValue] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [videoId, setVideoId] = useState("");
  const [playbackConfig, setPlaybackConfig] = useState<PlaybackConfig>({
    forwardKey: "ArrowRight",
    backwardKey: "ArrowLeft",
    forwardSeconds: 10,
    backwardSeconds: 10,
  });
  const [playbackDraft, setPlaybackDraft] = useState<PlaybackConfig>({
    forwardKey: "ArrowRight",
    backwardKey: "ArrowLeft",
    forwardSeconds: 10,
    backwardSeconds: 10,
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingPurge, setLoadingPurge] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState<number | null>(null);
  const [loadingPlaybackConfig, setLoadingPlaybackConfig] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPlaybackModal, setShowPlaybackModal] = useState(false);
  const [completeTruck, setCompleteTruck] = useState("");
  const [completeDate, setCompleteDate] = useState("");

  useEffect(() => {
    const init = async () => {
      setLoadingInitial(true);
      await Promise.all([
        fetchCachedMessage(),
        fetchApprovals(),
        fetchStream(),
        fetchPlaybackConfig(),
      ]);
      setLoadingInitial(false);
    };
    init();
  }, []);

  function handleVideoSeekKey(key: string) {
    if (
      showPlaybackModal ||
      showCompleteModal ||
      !playerRef.current?.getCurrentTime ||
      !playerRef.current?.seekTo
    ) {
      return false;
    }

    const currentTime = Number(playerRef.current.getCurrentTime?.() ?? 0);
    const duration = Number(playerRef.current.getDuration?.() ?? 0);

    if (key === playbackConfig.forwardKey) {
      const nextTime = duration
        ? Math.min(currentTime + playbackConfig.forwardSeconds, duration)
        : currentTime + playbackConfig.forwardSeconds;
      playerRef.current.seekTo(nextTime, true);
      setInfoMessage(
        `Forwarded ${playbackConfig.forwardSeconds}s with ${playbackConfig.forwardKey}`,
      );
      return true;
    }

    if (key === playbackConfig.backwardKey) {
      const nextTime = Math.max(
        currentTime - playbackConfig.backwardSeconds,
        0,
      );
      playerRef.current.seekTo(nextTime, true);
      setInfoMessage(
        `Rewind ${playbackConfig.backwardSeconds}s with ${playbackConfig.backwardKey}`,
      );
      return true;
    }

    return false;
  }

  useEffect(() => {
    const win = window as typeof window & {
      YT?: {
        Player: new (
          element: HTMLElement,
          options: Record<string, unknown>,
        ) => any;
      };
      onYouTubeIframeAPIReady?: () => void;
    };

    if (!videoId || !playerContainerRef.current) return;

    const createPlayer = () => {
      if (!playerContainerRef.current || !win.YT?.Player) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }
      playerRef.current = new win.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          playsinline: 1,
        },
      });
    };

    if (win.YT?.Player) {
      createPlayer();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    const previousReady = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      createPlayer();
    };

    return () => {
      win.onYouTubeIframeAPIReady = previousReady;
    };
  }, [videoId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        !!target?.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select";

      if (isTypingTarget) return;

      if (handleVideoSeekKey(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playbackConfig, showCompleteModal, showPlaybackModal]);

  useEffect(() => {
    if (errorMessage || infoMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setInfoMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, infoMessage]);

  async function fetchCachedMessage() {
    try {
      const res = await fetch(`${API}/message`, { cache: "no-store" });
      if (res.ok) setMessage(await res.json());
    } catch {}
  }

  async function fetchPlaybackConfig() {
    try {
      const res = await fetch(`${API}/playback/config`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const config = {
        forwardKey: data.forwardKey || "ArrowRight",
        backwardKey: data.backwardKey || "ArrowLeft",
        forwardSeconds: Number(data.forwardSeconds) || 10,
        backwardSeconds: Number(data.backwardSeconds) || 10,
      };
      setPlaybackConfig(config);
      setPlaybackDraft(config);
    } catch {}
  }

  async function fetchNext() {
    setLoadingNext(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const res = await fetch(`${API}/fetch`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data?.empty) {
          setMessage(null);
          setApproveValue("");
          setInfoMessage("Queue is empty - no messages available");
          setLoadingNext(false);
          return;
        }
        if (data?.expired)
          setErrorMessage("Previous message expired. Fetched new message.");
        setMessage(data);
        setApproveValue("");
        if (data?.skippedDuplicates > 0)
          setInfoMessage(
            `Skipped ${data.skippedDuplicates} duplicate message(s)`,
          );
      } else if (res.status === 410) {
        setErrorMessage("Message expired. Fetching new message...");
        setTimeout(() => fetchNext(), 1000);
      } else {
        setErrorMessage("Failed to fetch next message");
      }
    } catch {
      setErrorMessage("Network error - failed to fetch message");
    }
    setLoadingNext(false);
  }

  async function approve() {
    if (!message || loadingApprove) return;
    const normalizedApproveValue =
      approveValue.trim() === "" ? "0" : approveValue;
    const approveCount = Number(normalizedApproveValue);
    if (isNaN(approveCount)) {
      setErrorMessage("Please enter a valid number");
      return;
    }
    if (approveValue.trim() === "") {
      setApproveValue("0");
    }

    setLoadingApprove(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const res = await fetch(`${API}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedValue: approveCount, message }),
      });
      if (res.status === 410) {
        setErrorMessage("Message expired. Please fetch a new message.");
        setMessage(null);
        setApproveValue("");
        setLoadingApprove(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          await fetchApprovals();
          const sign = approveCount >= 0 ? "+" : "";
          setInfoMessage(
            `✓ Approved: ${message.body.truck_number} - ${sign}${approveCount} items`,
          );
        }
        if (data.next) {
          setMessage(data.next);
          setApproveValue("");
        } else {
          setMessage(null);
          setApproveValue("");
          setInfoMessage("✓ Approved. Queue is now empty.");
        }
      } else {
        const error = await res.json();
        setErrorMessage(error.error || "Failed to approve");
      }
    } catch {
      setErrorMessage("Network error - failed to approve");
    }
    setLoadingApprove(false);
  }

  async function fetchApprovals() {
    try {
      const res = await fetch(`${API}/approvals`);
      if (!res.ok) return;
      const data = await res.json();
      setRows(
        data.map((item: any) => ({
          _id: item._id || "",
          truck_number: item.truck_number || "—",
          count: item.original_count ?? 0,
          updated: item.approved_count ?? 0,
          createdAt: item.createdAt || item.updatedAt || item.date || "",
        })),
      );
    } catch {}
  }

  async function saveEdit(index: number) {
    const row = rows[index];
    const newValue = Number(editValue);
    if (isNaN(newValue)) {
      setErrorMessage("Please enter a valid number");
      return;
    }
    setLoadingEdit(index);
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/approval/${row._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_count: newValue }),
      });
      if (res.ok) {
        setRows((r) =>
          r.map((x, i) => (i === index ? { ...x, updated: newValue } : x)),
        );
        setEditingIndex(null);
        setEditValue("");
        setInfoMessage("✓ Count updated successfully");
      } else {
        setErrorMessage("Failed to update count");
      }
    } catch {
      setErrorMessage("Network error - failed to update");
    }
    setLoadingEdit(null);
  }

  async function purgeQueue() {
    if (loadingPurge) return;
    if (!confirm("⚠️ Really clear the entire queue? This cannot be undone."))
      return;
    setLoadingPurge(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/deleteAll`, { method: "POST" });
      if (res.ok) {
        setMessage(null);
        setApproveValue("");
        setInfoMessage("✓ Queue purged successfully");
      } else setErrorMessage("Failed to purge queue");
    } catch {
      setErrorMessage("Network error - failed to purge");
    }
    setLoadingPurge(false);
  }

  function openCompleteModal(row?: Row) {
    if (row) {
      setCompleteTruck(row?.truck_number || "");
      setCompleteDate(new Date().toISOString().split("T")[0]);
      setShowCompleteModal(true);
      return;
    }

    setCompleteTruck("");
    setCompleteDate(new Date().toISOString().split("T")[0]);
    setShowCompleteModal(true);
  }

  async function confirmComplete() {
    if (!(completeTruck || "").trim()) {
      setErrorMessage("Please enter a truck number");
      return;
    }
    if (!completeDate) {
      setErrorMessage("Please select a date");
      return;
    }
    setLoadingComplete(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/totals/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          truck_number: completeTruck,
          date: completeDate,
        }),
      });
      if (res.ok) {
        setShowCompleteModal(false);
        setInfoMessage(`✓ ${completeTruck} marked as completed`);
        await fetchApprovals();
      } else {
        const error = await res.json();
        setErrorMessage(error.error || "Failed to mark as complete");
      }
    } catch {
      setErrorMessage("Network error - failed to complete");
    }
    setLoadingComplete(false);
  }

  async function fetchStream() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("https://country-delight.markhet.app/youtube", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.youtube_url) return;
      const id = new URL(data.youtube_url).searchParams.get("v");
      if (id) setVideoId(id);
    } catch {}
  }

  async function savePlaybackConfig() {
    const nextConfig = {
      forwardKey: playbackDraft.forwardKey.trim() || "ArrowRight",
      backwardKey: playbackDraft.backwardKey.trim() || "ArrowLeft",
      forwardSeconds: Math.max(1, Number(playbackDraft.forwardSeconds) || 10),
      backwardSeconds: Math.max(1, Number(playbackDraft.backwardSeconds) || 10),
    };

    setLoadingPlaybackConfig(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API}/playback/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextConfig),
      });
      if (!res.ok) {
        setErrorMessage("Failed to save keyboard configuration");
        return;
      }
      setPlaybackConfig(nextConfig);
      setPlaybackDraft(nextConfig);
      setShowPlaybackModal(false);
      setInfoMessage("Keyboard controls updated");
    } catch {
      setErrorMessage("Network error - failed to save keyboard configuration");
    }
    setLoadingPlaybackConfig(false);
  }

  const total = rows.reduce((sum, r) => sum + r.updated, 0);

  const formatDate = (value?: string) => {
    if (!value || value.trim() === "") return "—";
    const date = new Date(value);
    if (isNaN(date.getTime()))
      return value.substring(0, 16).replace("T", " ") || "Invalid";
    return date
      .toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 flex flex-col lg:flex-row">
      {/* ── Left – Video + ROI Overlay ── */}
      <div className="lg:w-3/5 h-[50vh] lg:h-screen relative">
        {videoId ? (
          <>
            <div
              ref={playerContainerRef}
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute ml-90 top-3 left-3 bg-black/70 backdrop-blur-sm border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-200 flex items-center gap-2">
              <Keyboard className="h-3.5 w-3.5 text-indigo-300" />
              {playbackConfig.backwardKey}: -{playbackConfig.backwardSeconds}s ·{" "}
              {playbackConfig.forwardKey}: +{playbackConfig.forwardSeconds}s
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black/40">
            <div className="text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No live stream available</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right – Controls & Data ── */}
      <div className="lg:w-2/5 flex flex-col h-[50vh] lg:h-screen overflow-hidden bg-gray-900/80 backdrop-blur-sm border-l border-gray-800">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold flex items-center gap-2.5 shrink-0">
            <Truck className="w-6 h-6 text-emerald-400" />
            Truck Count Approval
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => setShowPlaybackModal(true)}
              className="px-4 py-2 bg-slate-700/80 hover:bg-slate-700 rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              <Keyboard size={16} />
              Keys
            </button>
            <button
              onClick={fetchNext}
              disabled={loadingNext || loadingInitial}
              className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loadingNext ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Fetch Next
            </button>
            <button
              onClick={() => openCompleteModal()}
              disabled={loadingApprove}
              className="bg-emerald-600/80 hover:bg-emerald-600 px-6 py-2.5 rounded-lg transition font-medium disabled:opacity-60"
            >
              Complete
            </button>
            <button
              onClick={purgeQueue}
              disabled={loadingPurge || loadingInitial}
              className="px-4 py-2 bg-red-600/70 hover:bg-red-600 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              {loadingPurge ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {loadingPurge ? "Clearing..." : "Purge"}
            </button>
          </div>
        </div>

        {/* Error / Info banners */}
        {(errorMessage || infoMessage) && (
          <div className="mx-5 mt-4 space-y-2">
            {errorMessage && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-red-200">{errorMessage}</span>
              </div>
            )}
            {infoMessage && (
              <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-emerald-200">{infoMessage}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {/* Current Truck */}
          <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
            <h2 className="text-lg font-medium mb-4 flex items-center justify-between">
              <span className="text-emerald-400">Current Truck</span>
              {loadingInitial && (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              )}
            </h2>

            {loadingInitial ? (
              <div className="py-10 flex items-center justify-center gap-3 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading current truck...
              </div>
            ) : message?.body ? (
              <div className="space-y-4">
                <div className="flex gap-6 items-center text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Truck</div>
                    <div className="font-mono text-lg">
                      {message.body.truck_number}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Count</div>
                    <div className="font-semibold text-lg">
                      {message.body.count}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-gray-400 text-xs mb-1.5 block">
                      Approve Count
                      <span className="ml-2 text-gray-500 text-[10px]">
                        (use - for returns)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={approveValue}
                      onChange={(e) => setApproveValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (handleVideoSeekKey(e.key)) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }

                        if (
                          e.key === "Enter" &&
                          !loadingApprove &&
                          approveValue.trim()
                        ) {
                          e.preventDefault();
                          approve();
                        }
                      }}
                      disabled={loadingApprove}
                      placeholder="Enter count (e.g., 100 or -5)"
                      className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:border-indigo-500/60 transition disabled:opacity-60 font-medium"
                    />
                  </div>
                  <button
                    onClick={approve}
                    disabled={loadingApprove}
                    className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingApprove ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 py-8 text-center">
                <div className="text-base mb-2">No message loaded</div>
                <div className="text-sm">
                  Click "Fetch Next" to load a message
                </div>
              </div>
            )}
          </div>

          {/* History Table */}
          <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-medium flex items-center gap-2">
                Approved Trucks
                <span className="text-gray-500 text-sm font-normal">
                  ({rows.length})
                </span>
              </h2>
              <div className="text-sm font-medium">
                Total:{" "}
                <span
                  className={`text-lg ${total >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {total >= 0 ? "+" : ""}
                  {total}
                </span>
              </div>
            </div>

            <div className="max-h-[calc(100vh-380px)] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900/70 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-normal text-gray-400">
                      Truck
                    </th>
                    <th className="text-left p-4 font-normal text-gray-400">
                      Original
                    </th>
                    <th className="text-left p-4 font-normal text-gray-400">
                      Approved
                    </th>
                    <th className="text-left p-4 font-normal text-gray-400">
                      Date
                    </th>
                    <th className="w-24 p-4" />
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No approved trucks yet
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr
                        key={row._id}
                        className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                      >
                        <td className="p-4 font-mono">{row.truck_number}</td>
                        <td className="p-4">{row.count}</td>
                        <td className="p-4">
                          {editingIndex === i ? (
                            <input
                              type="number"
                              step="1"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !loadingEdit)
                                  saveEdit(i);
                                else if (e.key === "Escape") {
                                  setEditingIndex(null);
                                  setEditValue("");
                                }
                              }}
                              disabled={loadingEdit !== null}
                              className="bg-gray-950 border border-gray-600 rounded px-2.5 py-1 w-20 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                            />
                          ) : (
                            <span
                              className={`font-medium ${row.updated < 0 ? "text-red-400" : ""}`}
                            >
                              {row.updated >= 0 ? "+" : ""}
                              {row.updated}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-300">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="p-4">
                          {editingIndex === i ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(i)}
                                disabled={loadingEdit !== null}
                                className="p-1.5 bg-emerald-600/70 hover:bg-emerald-600 rounded transition disabled:opacity-50"
                              >
                                {loadingEdit === i ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIndex(null);
                                  setEditValue("");
                                }}
                                disabled={loadingEdit !== null}
                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingIndex(i);
                                setEditValue(String(row.updated));
                              }}
                              disabled={loadingEdit !== null}
                              className="p-1.5 bg-amber-600/60 hover:bg-amber-600 rounded transition disabled:opacity-50"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" />
              Mark Truck as Completed
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Truck Number
                </label>
                <input
                  value={completeTruck}
                  onChange={(e) => setCompleteTruck(e.target.value)}
                  disabled={loadingComplete}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60 font-mono"
                  placeholder="Enter truck number"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={completeDate}
                  onChange={(e) => setCompleteDate(e.target.value)}
                  disabled={loadingComplete}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/60 disabled:opacity-60"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  disabled={loadingComplete}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmComplete}
                  disabled={
                    loadingComplete ||
                    !(completeTruck || "").trim() ||
                    !completeDate
                  }
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingComplete && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Confirm Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPlaybackModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Keyboard className="text-indigo-400" />
              Keyboard Controls
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Forward Key
                </label>
                <input
                  value={playbackDraft.forwardKey}
                  onChange={(e) =>
                    setPlaybackDraft((current) => ({
                      ...current,
                      forwardKey: e.target.value,
                    }))
                  }
                  disabled={loadingPlaybackConfig}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500/60 disabled:opacity-60 font-mono"
                  placeholder="ArrowRight"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Forward Seconds
                </label>
                <input
                  type="number"
                  min="1"
                  value={playbackDraft.forwardSeconds}
                  onChange={(e) =>
                    setPlaybackDraft((current) => ({
                      ...current,
                      forwardSeconds: Number(e.target.value),
                    }))
                  }
                  disabled={loadingPlaybackConfig}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500/60 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Backward Key
                </label>
                <input
                  value={playbackDraft.backwardKey}
                  onChange={(e) =>
                    setPlaybackDraft((current) => ({
                      ...current,
                      backwardKey: e.target.value,
                    }))
                  }
                  disabled={loadingPlaybackConfig}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500/60 disabled:opacity-60 font-mono"
                  placeholder="ArrowLeft"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Backward Seconds
                </label>
                <input
                  type="number"
                  min="1"
                  value={playbackDraft.backwardSeconds}
                  onChange={(e) =>
                    setPlaybackDraft((current) => ({
                      ...current,
                      backwardSeconds: Number(e.target.value),
                    }))
                  }
                  disabled={loadingPlaybackConfig}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500/60 disabled:opacity-60"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  setPlaybackDraft(playbackConfig);
                  setShowPlaybackModal(false);
                }}
                disabled={loadingPlaybackConfig}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={savePlaybackConfig}
                disabled={loadingPlaybackConfig}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {loadingPlaybackConfig && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

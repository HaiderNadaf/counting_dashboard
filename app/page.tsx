// "use client";

// import { useEffect, useState } from "react";

// type Msg = { id: string; body: string; receipt?: string } | null;

// type Approval = {
//   messageId: string;
//   body: string;
//   approver: string;
//   approvedAt: string;
// };

// export default function HomePage() {
//   const API = "http://localhost:5000";

//   const [message, setMessage] = useState<Msg>(null);
//   const [approver, setApprover] = useState("");
//   const [loadingFetch, setLoadingFetch] = useState(false);
//   const [approving, setApproving] = useState(false);
//   const [approvals, setApprovals] = useState<Approval[]>([]);

//   useEffect(() => {
//     fetchCachedMessage();
//     fetchApprovals();
//   }, []);

//   async function fetchCachedMessage() {
//     try {
//       const res = await fetch(`${API}/message`, { cache: "no-store" });
//       const data = await res.json();
//       setMessage(data);
//     } catch {}
//   }

//   async function fetchNext() {
//     if (loadingFetch) return;

//     setLoadingFetch(true);
//     try {
//       const res = await fetch(`${API}/fetch`, { method: "POST" });
//       const data = await res.json();
//       setMessage(data || null);
//     } catch {
//     } finally {
//       setLoadingFetch(false);
//     }
//   }

//   async function fetchApprovals() {
//     try {
//       const res = await fetch(`${API}/approvals`);
//       const data = await res.json();
//       setApprovals(data);
//     } catch {}
//   }

//   async function approve() {
//     if (!message || approving) return;

//     setApproving(true);

//     try {
//       const res = await fetch(`${API}/approve`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           approver,
//           message, // ⭐ IMPORTANT
//         }),
//       });

//       const data = await res.json();

//       setMessage(null);

//       if (data.next) setMessage(data.next);

//       setApprover("");
//       fetchApprovals();
//     } catch (e) {
//       console.log(e);
//     } finally {
//       setApproving(false);
//     }
//   }

//   return (
//     <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
//       <div className="relative w-full h-full">
//         <iframe
//           className="w-full h-full"
//           src="https://country-delight.markhet.app/youtube"
//           title="Stream"
//         />
//       </div>

//       <div className="flex items-start justify-center p-6 bg-gray-900">
//         <div className="w-full max-w-md bg-white/10 border rounded-2xl p-6 text-center">
//           <button
//             onClick={fetchNext}
//             disabled={loadingFetch || approving}
//             className="mb-3 w-full py-2 rounded bg-indigo-600 text-white"
//           >
//             {loadingFetch ? "Loading..." : "Fetch Next Message"}
//           </button>

//           {!message && <p className="text-gray-400">No message</p>}

//           {message && (
//             <div className="bg-black/40 p-4 rounded mb-3 text-left">
//               <div className="text-white text-sm">{message.id}</div>
//               <pre className="text-white text-sm">{message.body}</pre>
//             </div>
//           )}

//           <input
//             value={approver}
//             onChange={(e) => setApprover(e.target.value)}
//             placeholder="Approver"
//             className="w-full p-3 rounded mb-3 bg-white/5 text-white"
//           />

//           <button
//             onClick={approve}
//             disabled={!message || approving}
//             className="w-full py-3 rounded bg-blue-600 text-white"
//           >
//             {approving ? "Approving..." : "Approve & Fetch Next"}
//           </button>

//           <hr className="my-4 border-gray-700" />

//           <div className="text-left max-h-40 overflow-auto">
//             {approvals.map((a, i) => (
//               <div key={i} className="mb-2 p-2 bg-black/30 rounded">
//                 <div className="text-xs text-gray-400">{a.messageId}</div>
//                 <div className="text-white text-sm">{a.body}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";

// type Msg = { id: string; body: string; receipt?: string } | null;

// type Approval = {
//   messageId: string;
//   body: string;
//   approver: string;
//   approvedAt: string;
// };

// export default function HomePage() {
//   const API = "https://counting-dashboard-backend.onrender.com";

//   const [message, setMessage] = useState<Msg>(null);
//   const [approver, setApprover] = useState("");
//   const [loadingFetch, setLoadingFetch] = useState(false);
//   const [approving, setApproving] = useState(false);
//   const [approvals, setApprovals] = useState<Approval[]>([]);

//   // ⭐ STREAM STATE (only added)
//   const [videoUrl, setVideoUrl] = useState("");

//   useEffect(() => {
//     fetchCachedMessage();
//     fetchApprovals();
//   }, []);

//   // ⭐ STREAM POLLING (only added)
//   useEffect(() => {
//     fetchStream();

//     const interval = setInterval(fetchStream, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   async function fetchCachedMessage() {
//     try {
//       const res = await fetch(`${API}/message`, { cache: "no-store" });
//       const data = await res.json();
//       setMessage(data);
//     } catch {}
//   }

//   async function fetchNext() {
//     if (loadingFetch) return;

//     setLoadingFetch(true);
//     try {
//       const res = await fetch(`${API}/fetch`, { method: "POST" });
//       const data = await res.json();
//       setMessage(data || null);
//     } catch {
//     } finally {
//       setLoadingFetch(false);
//     }
//   }

//   async function fetchApprovals() {
//     try {
//       const res = await fetch(`${API}/approvals`);
//       const data = await res.json();
//       setApprovals(data);
//     } catch {}
//   }

//   async function approve() {
//     if (!message || approving) return;

//     setApproving(true);

//     try {
//       const res = await fetch(`${API}/approve`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           approver,
//           message,
//         }),
//       });

//       const data = await res.json();

//       setMessage(null);

//       if (data.next) setMessage(data.next);

//       setApprover("");
//       fetchApprovals();
//     } catch (e) {
//       console.log(e);
//     } finally {
//       setApproving(false);
//     }
//   }

//   // ⭐ STREAM FETCH (only added)
//   async function fetchStream() {
//     try {
//       const res = await fetch("https://country-delight.markhet.app/youtube", {
//         cache: "no-store",
//       });

//       const data = await res.json();
//       if (!data.youtube_url) return;

//       const id = new URL(data.youtube_url).searchParams.get("v");
//       if (!id) return;

//       const embed = `https://www.youtube.com/embed/${id}`;

//       setVideoUrl((prev) => (prev === embed ? prev : embed));
//     } catch (e) {
//       console.log("stream error", e);
//     }
//   }

//   return (
//     <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
//       {/* LEFT STREAM */}
//       <div className="relative w-full h-full">
//         <iframe
//           className="w-full h-full"
//           src={videoUrl}
//           title="Stream"
//           allow="autoplay; encrypted-media"
//           allowFullScreen
//         />
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="flex items-start justify-center p-6 bg-gray-900">
//         <div className="w-full h-[full] max-w-md bg-white/10 border rounded-2xl p-6 text-center">
//           <button
//             onClick={fetchNext}
//             disabled={loadingFetch || approving}
//             className="mb-3 w-full py-2 rounded bg-indigo-600 text-white"
//           >
//             {loadingFetch ? "Loading..." : "Fetch Next Message"}
//           </button>

//           {!message && <p className="text-gray-400">No message</p>}

//           {message && (
//             <div className="bg-black/40 p-4 rounded mb-3 text-left">
//               <div className="text-white text-sm">{message.id}</div>
//               <pre className="text-white text-sm">{message.body}</pre>
//             </div>
//           )}

//           <input
//             value={approver}
//             onChange={(e) => setApprover(e.target.value)}
//             placeholder="Approver"
//             className="w-full p-3 rounded mb-3 bg-white/5 text-white"
//           />

//           <button
//             onClick={approve}
//             disabled={!message || approving}
//             className="w-full py-3 rounded bg-blue-600 text-white"
//           >
//             {approving ? "Approving..." : "Approve & Fetch Next"}
//           </button>

//           <hr className="my-4 border-gray-700" />

//           <div className="text-left max-h-40 overflow-auto">
//             {approvals.map((a, i) => (
//               <div key={i} className="mb-2 p-2 bg-black/30 rounded">
//                 <div className="text-xs text-gray-400">{a.messageId}</div>
//                 <div className="text-white text-sm">{a.body}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

type Msg = { id: string; body: string; receipt?: string } | null;

type Row = {
  truck_number: string;
  count: number;
  updated: number;
};

export default function HomePage() {
  const API = "https://counting-dashboard-backend.onrender.com";

  const [message, setMessage] = useState<Msg>(null);
  const [approveValue, setApproveValue] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [approving, setApproving] = useState(false);
  const [purging, setPurging] = useState(false);

  // stream
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetchCachedMessage();
    fetchStream();
    const interval = setInterval(fetchStream, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCachedMessage() {
    const res = await fetch(`${API}/message`, { cache: "no-store" });
    const data = await res.json();
    setMessage(data);
  }

  async function fetchNext() {
    if (loadingFetch) return;
    setLoadingFetch(true);

    const res = await fetch(`${API}/fetch`, { method: "POST" });
    const data = await res.json();
    setMessage(data || null);

    setLoadingFetch(false);
  }

  async function approve() {
    if (!message || approving) return;

    setApproving(true);

    const parsed = JSON.parse(message.body);

    // ⭐ push into history table
    setRows((prev) => [
      ...prev,
      {
        truck_number: parsed.truck_number,
        count: Number(parsed.count),
        updated: Number(approveValue),
      },
    ]);

    await fetch(`${API}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approver: approveValue,
        message,
      }),
    });

    setApproveValue("");

    const next = await fetch(`${API}/fetch`, { method: "POST" });
    const nextData = await next.json();
    setMessage(nextData || null);

    setApproving(false);
  }

  async function fetchStream() {
    try {
      const res = await fetch("https://country-delight.markhet.app/youtube", {
        cache: "no-store",
      });

      const data = await res.json();
      if (!data.youtube_url) return;

      const id = new URL(data.youtube_url).searchParams.get("v");
      if (!id) return;

      setVideoUrl(`https://www.youtube.com/embed/${id}`);
    } catch {}
  }

  async function purgeQueue() {
    if (purging) return;

    const ok = confirm("Delete ALL SQS messages?");
    if (!ok) return;

    setPurging(true);

    try {
      const res = await fetch(`${API}/deleteAll`, {
        method: "POST",
      });

      const data = await res.json();

      console.log("purged:", data);

      // clear UI
      setRows([]);
      setMessage(null);
    } catch (e) {
      console.log(e);
    } finally {
      setPurging(false);
    }
  }

  const total = rows.reduce((s, r) => s + r.updated, 0);

  const parsed = message ? JSON.parse(message.body) : null;

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
      {/* LEFT STREAM */}
      <iframe className="w-full h-full" src={videoUrl} />

      {/* RIGHT */}
      <div className="p-6 bg-gray-900 text-white space-y-6">
        <button
          onClick={fetchNext}
          className="w-full py-2 bg-indigo-600 rounded"
        >
          Fetch Next
        </button>

        <button onClick={purgeQueue} className="w-full py-2 bg-red-600 rounded">
          {purging ? "Clearing..." : "Clear Queue"}
        </button>

        {/* ⭐ TABLE 1 — CURRENT */}
        <div className="bg-white/10 p-4 rounded">
          <div className="font-bold mb-2">Current Truck</div>

          {parsed ? (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Truck</th>
                  <th className="text-left p-2">Count</th>
                  <th className="text-left p-2">Approve</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">{parsed.truck_number}</td>
                  <td className="p-2">{parsed.count}</td>
                  <td className="p-2">
                    <input
                      value={approveValue}
                      onChange={(e) => setApproveValue(e.target.value)}
                      className="bg-black/40 p-2 rounded w-24"
                    />
                  </td>
                  <td>
                    <button
                      onClick={approve}
                      className="bg-blue-600 px-3 py-2 rounded"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div>No message</div>
          )}
        </div>

        {/* ⭐ TABLE 2 — HISTORY */}
        {/* <div className="bg-white/10 p-4 rounded">
          <div className="font-bold mb-2">Approved Trucks</div>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Truck</th>
                <th className="text-left p-2">Count</th>
                <th className="text-left p-2">Updated</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-2">{r.truck_number}</td>
                  <td className="p-2">{r.count}</td>
                  <td className="p-2">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 font-bold">Total Updated Count: {total}</div>
        </div> */}
        <div className="bg-white/10 p-4 rounded">
          <div className="font-bold mb-2">Approved Trucks</div>

          {/* ⭐ fixed height scroll area */}
          <div className="h-64 overflow-auto border border-white/10 rounded">
            <table className="w-full text-sm">
              {/* sticky header */}
              <thead className="sticky top-0 bg-gray-800">
                <tr>
                  <th className="text-left p-2 whitespace-nowrap">Truck</th>
                  <th className="text-left p-2 whitespace-nowrap">Count</th>
                  <th className="text-left p-2 whitespace-nowrap">Updated</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="p-2 whitespace-nowrap">{r.truck_number}</td>
                    <td className="p-2 whitespace-nowrap">{r.count}</td>
                    <td className="p-2 whitespace-nowrap">{r.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* total always visible */}
          <div className="mt-3 font-bold">Total Updated Count: {total}</div>
        </div>
      </div>
    </div>
  );
}

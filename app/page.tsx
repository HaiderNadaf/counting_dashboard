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

"use client";

import { useEffect, useState } from "react";

type Msg = { id: string; body: string; receipt?: string } | null;

type Approval = {
  messageId: string;
  body: string;
  approver: string;
  approvedAt: string;
};

export default function HomePage() {
  const API = "https://counting-dashboard-backend.onrender.com";

  const [message, setMessage] = useState<Msg>(null);
  const [approver, setApprover] = useState("");
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvals, setApprovals] = useState<Approval[]>([]);

  // ⭐ STREAM STATE (only added)
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetchCachedMessage();
    fetchApprovals();
  }, []);

  // ⭐ STREAM POLLING (only added)
  useEffect(() => {
    fetchStream();

    const interval = setInterval(fetchStream, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCachedMessage() {
    try {
      const res = await fetch(`${API}/message`, { cache: "no-store" });
      const data = await res.json();
      setMessage(data);
    } catch {}
  }

  async function fetchNext() {
    if (loadingFetch) return;

    setLoadingFetch(true);
    try {
      const res = await fetch(`${API}/fetch`, { method: "POST" });
      const data = await res.json();
      setMessage(data || null);
    } catch {
    } finally {
      setLoadingFetch(false);
    }
  }

  async function fetchApprovals() {
    try {
      const res = await fetch(`${API}/approvals`);
      const data = await res.json();
      setApprovals(data);
    } catch {}
  }

  async function approve() {
    if (!message || approving) return;

    setApproving(true);

    try {
      const res = await fetch(`${API}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approver,
          message,
        }),
      });

      const data = await res.json();

      setMessage(null);

      if (data.next) setMessage(data.next);

      setApprover("");
      fetchApprovals();
    } catch (e) {
      console.log(e);
    } finally {
      setApproving(false);
    }
  }

  // ⭐ STREAM FETCH (only added)
  async function fetchStream() {
    try {
      const res = await fetch("https://country-delight.markhet.app/youtube", {
        cache: "no-store",
      });

      const data = await res.json();
      if (!data.youtube_url) return;

      const id = new URL(data.youtube_url).searchParams.get("v");
      if (!id) return;

      const embed = `https://www.youtube.com/embed/${id}`;

      setVideoUrl((prev) => (prev === embed ? prev : embed));
    } catch (e) {
      console.log("stream error", e);
    }
  }

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
      {/* LEFT STREAM */}
      <div className="relative w-full h-full">
        <iframe
          className="w-full h-full"
          src={videoUrl}
          title="Stream"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-start justify-center p-6 bg-gray-900">
        <div className="w-full h-[full] max-w-md bg-white/10 border rounded-2xl p-6 text-center">
          <button
            onClick={fetchNext}
            disabled={loadingFetch || approving}
            className="mb-3 w-full py-2 rounded bg-indigo-600 text-white"
          >
            {loadingFetch ? "Loading..." : "Fetch Next Message"}
          </button>

          {!message && <p className="text-gray-400">No message</p>}

          {message && (
            <div className="bg-black/40 p-4 rounded mb-3 text-left">
              <div className="text-white text-sm">{message.id}</div>
              <pre className="text-white text-sm">{message.body}</pre>
            </div>
          )}

          <input
            value={approver}
            onChange={(e) => setApprover(e.target.value)}
            placeholder="Approver"
            className="w-full p-3 rounded mb-3 bg-white/5 text-white"
          />

          <button
            onClick={approve}
            disabled={!message || approving}
            className="w-full py-3 rounded bg-blue-600 text-white"
          >
            {approving ? "Approving..." : "Approve & Fetch Next"}
          </button>

          <hr className="my-4 border-gray-700" />

          <div className="text-left max-h-40 overflow-auto">
            {approvals.map((a, i) => (
              <div key={i} className="mb-2 p-2 bg-black/30 rounded">
                <div className="text-xs text-gray-400">{a.messageId}</div>
                <div className="text-white text-sm">{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

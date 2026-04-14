import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/user/requests/recieved"); // ✅ FIXED
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Request fetch error:", err);
      toast.error("Could not load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/review/${id}`, { status });
      setRequests((current) => current.filter((req) => req._id !== id));
      toast.success(`Request ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not update request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="page-section pt-8 text-center text-slate-500 dark:text-slate-400">
        Loading requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="page-section pt-8 text-center text-slate-500 dark:text-slate-400">
        No requests yet
      </div>
    );
  }

  return (
    <div className="page-section mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h2 className="page-title mb-2">Connection Requests</h2>
      <p className="page-subtitle mb-6">
        Review incoming requests and decide who to connect with.
      </p>

      {requests.map((req) => (
        <div
          key={req._id}
          className="page-card mb-4 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {req.fromUserId.firstName} {req.fromUserId.lastName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {req.fromUserId.about || "No bio added yet."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleReview(req._id, "accepted")}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Accept
            </button>

            <button
              onClick={() => handleReview(req._id, "rejected")}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

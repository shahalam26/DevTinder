import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useSocket } from "../utils/SocketContext";

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const TickIcon = ({ status }) => {
     if (status === "seen") {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 shrink-0 mr-1 mt-0.5 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 6 11 13 8 10"></polyline>
            <path d="M22 6L14 14l-1 1"></path>
          </svg>
        );
     }
     if (status === "delivered") {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-slate-400 shrink-0 mr-1 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 6 11 13 8 10"></polyline>
            <path d="M22 6L14 14l-1 1"></path>
          </svg>
        );
     }
     return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-slate-500 shrink-0 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
     );
};

const ChatsList = ({ contained = false, user: currentUser }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { socket } = useSocket();

  const fetchConnections = useCallback(async () => {
    try {
      const res = await api.get("/chat/summary");
      setConnections(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for new messages incoming OR broadcasted by us to the room (to update our own 'sent' message locally)
    const onMessageUpdate = () => {
       fetchConnections();
    };

    socket.on("incomingMessageAlert", onMessageUpdate);
    socket.on("receiveMessage", onMessageUpdate); // Update if we sent it or received it while sitting on the chats list? Wait, if we are on chats list we aren't in the room so we don't get receiveMessage. But we might connect to another device sending.

    return () => {
       socket.off("incomingMessageAlert", onMessageUpdate);
       socket.off("receiveMessage", onMessageUpdate);
    }
  }, [socket, fetchConnections]);

  const displayChats = connections.filter(Boolean);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-section px-4 py-8 sm:px-6 md:pb-8 pb-24 max-w-3xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Inbox
        </h1>
      </div>

      {/* CHAT LIST */}
      <div className="flex flex-col gap-3">
        {displayChats.map((msgSummary) => {
          const partner = msgSummary.partner;
          if (!partner) return null;
          
          const unreadCount = msgSummary.unreadCount || 0;

          return (
            <div
              key={partner._id}
              onClick={() => navigate(`/chats/${partner._id}`)}
              className={`flex items-center gap-4 cursor-pointer p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-300/60 dark:hover:border-pink-500/30 group relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${contained ? 'border-none shadow-none rounded-none border-b hover:bg-slate-50 dark:hover:bg-slate-800' : ''}`}
            >
              {/* Avatar */}
              <div 
                onClick={(e) => { e.stopPropagation(); navigate(`/user/${partner._id}`); }}
                className="relative h-14 w-14 flex-shrink-0 cursor-pointer rounded-full bg-gradient-to-br from-pink-100 to-violet-100 dark:from-slate-800 dark:to-slate-900 border-2 border-transparent hover:border-pink-500 hover:scale-105 transition-all z-10"
              >
                {partner.photourl ? (
                  <img
                    src={partner.photourl}
                    alt={`${partner.firstName}`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full text-2xl font-bold bg-gradient-to-br from-pink-500 to-violet-600 text-white">
                    {partner.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                {partner.isOnline && (
                   <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {partner.firstName} {partner.lastName}
                    </h3>
                    <span className={`text-xs ml-2 shrink-0 ${unreadCount > 0 ? "text-pink-500 font-bold" : "text-slate-400"}`}>
                      {formatTime(msgSummary.createdAt)}
                    </span>
                </div>
                <div className="flex justify-between items-start pr-2">
                    <p className={`text-sm truncate flex items-start ${unreadCount > 0 ? "text-slate-800 dark:text-slate-200 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
                      {currentUser && msgSummary.senderId === currentUser._id && (
                          <TickIcon status={msgSummary.status} />
                      )}
                      <span className="truncate">{msgSummary.text}</span>
                    </p>
                    {unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-sm ml-2 shrink-0 animate-in zoom-in">
                          {unreadCount}
                        </span>
                    )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* EMPTY STATE */}
      {!loading && displayChats.length === 0 && (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No active conversations</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Match with developers to start chatting. Your history will magically appear here!
          </p>
        </div>
      )}

    </div>
  );
};

export default ChatsList;

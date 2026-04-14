import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../utils/SocketContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import CallOverlay from "../components/CallOverlay";

const formatLastSeen = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === now.toDateString()) {
    return 'Today at ' + time;
  }
  if (diffDays <= 1) {
    return 'Yesterday at ' + time;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + time;
};

const Chat = ({ user }) => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const [targetPresence, setTargetPresence] = useState({ isOnline: false, lastSeen: null });
  const [targetUser, setTargetUser] = useState(null);
  const [activeCallTarget, setActiveCallTarget] = useState(null);
  
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [socketConnected, setSocketConnected] = useState(true);

  const { socket, decrementalUnreadCount } = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setFetching(true);
      setErrorMsg("");
      try {
        const res = await api.get(`/chat/${targetUserId}`);
        const loadedMessages = res.data.data || [];
        setMessages(loadedMessages);
        if (res.data.partner) {
            setTargetUser(res.data.partner);
            setTargetPresence(prev => ({
                isOnline: res.data.partner.isOnline,
                lastSeen: res.data.partner.lastSeen
            }));
        }
        
        const localUnread = loadedMessages.filter(m => m.receiverId === user._id && m.status !== "seen").length;
        if (localUnread > 0 && decrementalUnreadCount) {
             decrementalUnreadCount(localUnread);
        }

      } catch (err) {
        console.error("Fetch errors:", err);
        setErrorMsg(err?.response?.data?.message || "Failed to load chat.");
        toast.error("Failed to fetch messages.");
        if (err?.response?.status === 400) {
            navigate("/chats");
        }
      } finally {
        setFetching(false);
      }
    };
    fetchMessages();

    if (!socket) return;
    
    // Join room & trigger Seen state
    socket.emit("joinChat", {
      userId: user._id,
      targetUserId,
    });

    // Query their presence
    socket.emit("checkPresence", targetUserId);

    const onUserPresenceUpdate = ({ userId, isOnline, lastSeen }) => {
      if (userId === targetUserId) {
        setTargetPresence({ isOnline, lastSeen });
      }
    };

    const onReceiveMessage = (newMessage) => {
      // Check if it belongs to this room
      if (newMessage.senderId === targetUserId || newMessage.receiverId === targetUserId) {
          setMessages((prev) => [...prev, newMessage]);
          
          if (newMessage.senderId === targetUserId) {
             socket.emit("markMessagesSeen", { senderId: targetUserId, receiverId: user._id });
          }
      }
    };

    const onMessagesSeen = ({ byUserId }) => {
        if (byUserId === targetUserId) {
            setMessages(prev => prev.map(m => m.senderId === user._id ? { ...m, status: "seen" } : m));
        }
    };

    const onMessageStatusUpdate = ({ messageId, status }) => {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
    };

    const onBulkMessageStatusUpdate = ({ receiverId, status }) => {
        if (targetUserId === receiverId) {
            setMessages(prev => prev.map(m => (m.receiverId === receiverId && m.status === 'sent') ? { ...m, status } : m));
        }
    };

    const onDisconnect = () => setSocketConnected(false);
    const onConnect = () => setSocketConnected(true);

    if (socket.connected) setSocketConnected(true);
    else setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("userPresenceUpdate", onUserPresenceUpdate);
    socket.on("receiveMessage", onReceiveMessage);
    socket.on("messagesSeen", onMessagesSeen);
    socket.on("messageStatusUpdate", onMessageStatusUpdate);
    socket.on("bulkMessageStatusUpdate", onBulkMessageStatusUpdate);

    // We don't disconnect socket because it is global
    return () => {
       socket.off("connect", onConnect);
       socket.off("disconnect", onDisconnect);
       socket.off("userPresenceUpdate", onUserPresenceUpdate);
       socket.off("receiveMessage", onReceiveMessage);
       socket.off("messagesSeen", onMessagesSeen);
       socket.off("messageStatusUpdate", onMessageStatusUpdate);
       socket.off("bulkMessageStatusUpdate", onBulkMessageStatusUpdate);
    };
  }, [targetUserId, user._id, socket, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: targetUserId,
      text: input,
    });

    setInput("");
  };

  const startVideoCall = () => {
    setActiveCallTarget(targetUserId);
  };

  const handleDeleteMessage = async (msgId) => {
      if (confirm("Delete this message?")) {
         try {
             await api.delete(`/chat/message/${msgId}`);
             setMessages(prev => prev.filter(m => m._id !== msgId));
             toast.success("Message deleted.");
         } catch(err) {
             console.error(err);
             toast.error(err?.response?.data?.message || "Failed to delete message.");
         }
      }
  };

  const handleDeleteChat = async () => {
      if (confirm("Clear entire chat history? This cannot be undone.")) {
         try {
             await api.delete(`/chat/room/${targetUserId}`);
             setMessages([]);
             navigate('/chats');
             toast.success("Chat cleared.");
         } catch(err) { 
             console.error(err);
             toast.error(err?.response?.data?.message || "Failed to clear chat.");
         }
      }
  };

  const TickIcon = ({ status }) => {
     if (status === "seen") {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 inline ml-1 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 6 11 13 8 10"></polyline>
            <path d="M22 6L14 14l-1 1"></path>
          </svg>
        );
     }
     if (status === "delivered") {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-slate-400 inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 6 11 13 8 10"></polyline>
            <path d="M22 6L14 14l-1 1"></path>
          </svg>
        );
     }
     return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-slate-500 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
     );
  };

  return (
    <>
      <CallOverlay 
         socket={socket} 
         currentUser={user} 
         activeCallTarget={activeCallTarget} 
         onCallEnded={() => setActiveCallTarget(null)}
      />

      <div className="flex flex-col flex-1 h-full w-full relative">
        
        {/* Unified Chat Window Card */}
        <div className="flex flex-col flex-1 overflow-hidden bg-white/50 dark:bg-slate-900/50">
          
          {/* Header Ribbon */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 sm:p-4 border-b border-slate-200/50 dark:border-slate-800/80 z-10 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/chats')} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-pink-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div 
              onClick={() => navigate(`/user/${targetUserId}`)}
              className="relative h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 cursor-pointer hover:ring-2 ring-pink-500 transition-all"
            >
                {targetUser?.photourl ? (
                  <img src={targetUser.photourl} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-white">
                    {targetUser?.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {targetPresence.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"></span>}
            </div>
            <div className="flex flex-col cursor-pointer hover:opacity-80" onClick={() => navigate(`/user/${targetUserId}`)}>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                 {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : "Loading..."}
              </h2>
              {targetPresence.isOnline ? (
                <span className="text-xs text-emerald-500 font-medium">Online</span>
              ) : (
                <span className="text-xs text-slate-400">
                  {targetPresence.lastSeen ? `Last seen ${formatLastSeen(targetPresence.lastSeen)}` : "Offline"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={startVideoCall} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={startVideoCall} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </button>
            <button onClick={handleDeleteChat} className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-950/20 relative">
          
          {/* Socket Disconnected Banner */}
          {!socketConnected && (
             <div className="sticky top-0 z-20 w-full flex justify-center mt-2 mb-4 animate-in fade-in slide-in-from-top-2">
                 <div className="bg-orange-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-md shadow-orange-500/20 flex items-center gap-2 backdrop-blur-md">
                     <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                     Connecting...
                 </div>
             </div>
          )}

          {fetching ? (
             <div className="m-auto flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500/30 border-t-pink-500"></div>
             </div>
          ) : errorMsg ? (
             <div className="m-auto flex flex-col items-center opacity-50 text-center">
                 <div className="text-4xl mb-2">⚠️</div>
                 <div className="text-sm font-medium">{errorMsg}</div>
             </div>
          ) : messages.length === 0 ? (
             <div className="m-auto flex flex-col items-center opacity-50">
                 <div className="text-4xl mb-2">👋</div>
                 <div className="text-center text-sm font-medium">No messages here yet.<br/>Break the ice!</div>
             </div>
          ) : null}

          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user._id;
            return (
              <div key={idx} className={`flex max-w-[85%] sm:max-w-[75%] ${isMe ? "ml-auto" : "mr-auto"} group relative animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200 relative ${
                  isMe ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-sm shadow-pink-500/20" 
                       : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700"
                }`}>
                  <span className="break-words">{msg.text}</span>
                  {isMe && <TickIcon status={msg.status} />}
                  
                  {/* Delete hovering icon */}
                  <button onClick={() => handleDeleteMessage(msg._id)} className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-500 transition-opacity ${isMe ? "-left-10" : "-right-10"}`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                       </svg>
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-6" /> 
        </div>

        {/* Sticky Input area */}
        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-3 sm:px-6 sm:py-4 border-t border-slate-200/60 dark:border-slate-800/60 z-20">
          <form onSubmit={handleSend} className="flex gap-3 items-center">
            <div className="flex-1 relative">
                <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-12 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 px-6 focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/30 dark:placeholder-slate-400 text-slate-800 dark:text-slate-100 rounded-full transition-all shadow-inner"
                autoFocus
                />
            </div>
            <button type="submit" disabled={!input.trim()} className="w-12 h-12 flex-shrink-0 rounded-full !px-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all bg-gradient-to-br from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white shadow-lg shadow-pink-500/25 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>

        </div>

      </div>
    </>
  );
};

export default Chat;

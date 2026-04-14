import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import api from './api';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ user, children }) => {
    const socketRef = useRef(null);
    const [socketInstance, setSocketInstance] = useState(null);
    const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
    const location = useLocation();
    
    // Track location in a ref to bypass stale closure without recreating the socket
    const locationRef = useRef(location.pathname);
    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);

    useEffect(() => {
        if (!user) return; // Only connect if authenticated

        // Hydrate initial unread count
        api.get('/chat/summary').then(res => {
             const summaries = res.data.data || [];
             const initialUnread = summaries.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
             setGlobalUnreadCount(initialUnread);
        }).catch(err => console.error(err));

        const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
            withCredentials: true
        });
        
        socketRef.current = newSocket;
        setSocketInstance(newSocket);

        newSocket.emit("userConnected", user._id);

        // A global alert handler mapping unread state
        newSocket.on("incomingMessageAlert", (message) => {
           // If user is actively chatting with the sender, ignore the toast and global badge
           if (locationRef.current.includes(`/chat/${message.senderId}`)) {
               return;
           }
           
           // Increment global badge, provided user is not actively on that chat page (which resets it)
           setGlobalUnreadCount(prev => prev + 1);
           
           // Acknowledge delivery
           newSocket.emit("messageDelivered", { messageId: message._id, senderId: message.senderId });
           
           // Toast Push Notification
           toast.success(`New message from ${message.sender?.firstName || 'someone'}: ${message.text?.substring(0,20)}...`, {
               duration: 3000,
               position: 'top-center',
               icon: '💬',
               style: {
                   borderRadius: '999px',
                   background: '#1e293b',
                   color: '#fff',
               },
           });
        });

        return () => {
             if (socketRef.current) socketRef.current.disconnect();
        };

    }, [user]);

    const decrementalUnreadCount = (count) => {
        setGlobalUnreadCount(prev => Math.max(0, prev - count));
    };
    
    const setExactUnreadCount = (count) => {
        setGlobalUnreadCount(count);
    };

    return (
        <SocketContext.Provider value={{ 
            socket: socketInstance, 
            globalUnreadCount, 
            decrementalUnreadCount, 
            setExactUnreadCount 
        }}>
            {children}
        </SocketContext.Provider>
    );
};

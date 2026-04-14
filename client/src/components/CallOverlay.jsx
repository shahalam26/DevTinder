import { useEffect, useRef, useState } from "react";

const CallOverlay = ({ socket, currentUser, activeCallTarget, onCallEnded }) => {
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const localStream = useRef();

  useEffect(() => {
    // We are the ones initializing a call
    if (activeCallTarget) {
      startCamera().then((stream) => {
        const peer = createPeer(activeCallTarget, stream);
        connectionRef.current = peer;
      });
    }

    // Bind socket listeners
    if (socket) {
      socket.on("incomingCall", async ({ from, name, signal }) => {
        setReceivingCall(true);
        setCaller(from);
        setCallerName(name);
        // Wait to auto-play ringing sound here if needed
        // Store the initial offer
        window.tempOffer = signal;
      });

      socket.on("callAccepted", (signal) => {
        setCallAccepted(true);
        if (connectionRef.current) {
           connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        }
      });

      socket.on("iceCandidate", (candidate) => {
        if (connectionRef.current) {
          connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>console.log(e));
        }
      });

      socket.on("callEnded", () => {
        endCallClean();
      });
      
      socket.on("callRejected", () => {
        endCallClean();
      });
    }

    return () => {
       if (socket) {
         socket.off("incomingCall");
         socket.off("callAccepted");
         socket.off("iceCandidate");
         socket.off("callEnded");
         socket.off("callRejected");
       }
       endCallClean(false);
    };
  }, [socket, activeCallTarget]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Failed to get local stream", err);
      return null;
    }
  };

  const createPeer = (userToCall, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ],
    });

    if (stream) {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: userToCall, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    peer.onnegotiationneeded = async () => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("callUser", { 
           userToCall, 
           signalData: peer.localDescription, 
           from: currentUser._id, 
           name: currentUser.firstName 
        });
      } catch (err) { console.error(err); }
    };

    return peer;
  };

  const answerCall = async () => {
    const stream = await startCamera();
    setCallAccepted(true);

    const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ],
    });

    if (stream) {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: caller, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    if (window.tempOffer) {
       await peer.setRemoteDescription(new RTCSessionDescription(window.tempOffer));
       const answer = await peer.createAnswer();
       await peer.setLocalDescription(answer);
       socket.emit("answerCall", { signal: peer.localDescription, to: caller });
    }

    connectionRef.current = peer;
  };

  const rejectCall = () => {
    socket.emit("rejectCall", { to: caller });
    endCallClean();
  };

  const leaveCall = () => {
    if (activeCallTarget) {
      socket.emit("endCall", { to: activeCallTarget });
    } else if (caller) {
      socket.emit("endCall", { to: caller });
    }
    endCallClean();
  };

  const endCallClean = (informParent = true) => {
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    setCaller("");
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    if (informParent && onCallEnded) onCallEnded();
  };

  // If no active call and not receiving, hide completely
  if (!activeCallTarget && !receivingCall && !callAccepted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      
      {/* Incoming Call Dialog */}
      {receivingCall && !callAccepted && !callEnded && (
        <div className="animate-in fade-in zoom-in absolute z-50 flex flex-col items-center p-8 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl">
           <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-violet-500 rounded-full animate-pulse mb-6 flex items-center justify-center text-white text-3xl font-bold">
               {callerName?.charAt(0) || "U"}
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
           <p className="text-slate-400 mb-8">Incoming Video Call...</p>
           <div className="flex gap-6">
              <button onClick={rejectCall} className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white hover:bg-rose-600 transition shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l-8 8m0-8l8 8" /></svg>
              </button>
              <button onClick={answerCall} className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </button>
           </div>
        </div>
      )}

      {/* Active Call UI */}
      {(callAccepted || activeCallTarget) && (
        <div className="relative w-full h-full flex flex-col md:flex-row p-4 gap-4">
           
           {/* Remote Video (Main) */}
           <div className="flex-1 bg-black rounded-3xl overflow-hidden relative border border-slate-800">
               <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
               {!callAccepted && activeCallTarget && (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <p className="text-white animate-pulse text-lg">Ringing...</p>
                   </div>
               )}
           </div>

           {/* Local Video (PiP) */}
           <div className="absolute bottom-8 right-8 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 z-10">
               <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform -scale-x-100" />
           </div>

           {/* Controls Dock */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur px-8 py-4 rounded-full border border-slate-700">
               <button onClick={leaveCall} className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white hover:scale-105 transition shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
               </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default CallOverlay;

import { Outlet, useParams } from "react-router-dom";
import ChatsList from "./ChatsList";

const ChatLayout = ({ user }) => {
  const { targetUserId } = useParams();

  // If we have a targetUserId, we are viewed in a specific chat
  const isInChat = !!targetUserId;

  return (
    <div className="fixed inset-0 top-[64px] md:pb-0 pb-[70px] flex w-full overflow-hidden bg-slate-50 dark:bg-[#0f172a] z-20">
      {/* Sidebar - Contacts List */}
      <div 
        className={`w-full md:w-[350px] lg:w-[400px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 transition-all duration-300 ${
          isInChat ? "hidden md:block" : "block"
        }`}
      >
        <ChatsList contained={true} user={user} />
      </div>

      {/* Main Area - Chat Window */}
      <div 
        className={`flex-1 flex flex-col bg-[#efeae2] dark:bg-[#1e293b] relative transition-all duration-300 ${
          isInChat ? "block" : "hidden md:flex"
        }`}
      >
        {/* If not in chat and on desktop, show empty state */}
        {!isInChat && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
             <div className="w-24 h-24 mb-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
             </div>
             <h2 className="text-2xl font-light text-slate-800 dark:text-slate-200 mb-2">DevTinder Web</h2>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm">Select a contact from the left menu to start messaging.</p>
          </div>
        )}

        {/* If in chat, render the Chat component via Outlet */}
        {isInChat && <Outlet context={{ isLayout: true }} />}
      </div>
    </div>
  );
};

export default ChatLayout;

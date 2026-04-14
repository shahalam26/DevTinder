import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get("/user/connections");
        setMatches(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const displayMatches = matches.filter(Boolean);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-section px-4 py-8 sm:px-6 md:pb-8 pb-24"> {/* Extra PB for mobile nav */}
      
      {/* HEADER */}
      <div className="mb-10 text-center">
        <h1 className="page-title bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 inline-block">
          Your Matches
        </h1>
        <p className="page-subtitle mt-2">
          It's a match! Start building something legendary.
        </p>
      </div>

      {/* MATCH CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {displayMatches.map((user) => (
          <div
            key={user._id}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col"
          >
            {/* Image Header */}
            <div className="relative h-48 w-full bg-gradient-to-br from-pink-100 to-violet-100 dark:from-slate-800 dark:to-slate-900">
              {user.photourl ? (
                <img
                  src={user.photourl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-pink-500/30">
                  {user.firstName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              {/* Gradient Overlay for Text Visibility if needed later */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-100"></div>
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col p-5">
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                  {user.firstName} {user.lastName}
                </h3>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </div>
              
              {user.about ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-10 mb-4">
                  {user.about}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400 min-h-10 mb-4">
                  No about info provided.
                </p>
              )}

              {/* Skills Tags */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {user.skills?.length > 0 ? (
                  user.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium tracking-tight text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800/50">
                    Tech stack unlisted
                  </span>
                )}
                {user.skills?.length > 3 && (
                  <span className="rounded-md bg-pink-50 px-2 py-1 text-xs font-bold text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                    +{user.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Push button to bottom */}
              <div className="mt-auto pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/chats/${user._id}`)}
                  className="w-full rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/30 transition-all hover:scale-[1.03] active:scale-95"
                >
                  Say 👋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {displayMatches.length === 0 && (
        <div className="mt-32 flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-6xl opacity-50">👀</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No matches yet</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm">
            Keep swiping! Your dream developer match is out there.
          </p>
        </div>
      )}
    </div>
  );
};

export default Matches;

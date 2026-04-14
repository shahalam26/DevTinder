import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/user/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user profile");
        navigate("/feed");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="page-section flex justify-center px-4 py-8">
        <div className="page-card w-full max-w-2xl p-6 sm:p-8 animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 mt-10"></div>
          <div className="w-1/2 h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4 mt-2"></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile?.firstName?.charAt(0)?.toUpperCase() || "U";
  const displayImage = profile.photourl;

  return (
    <div className="page-section flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-[0_28px_100px_rgba(2,6,23,0.6)]">
        <div className="relative h-[300px] sm:h-[400px]">
          {displayImage ? (
            <img
              src={displayImage}
              alt={profile.firstName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 via-fuchsia-500 to-blue-500 text-8xl font-bold text-white">
              {initials}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                {profile.firstName} {profile.lastName}{profile.age ? `, ${profile.age}` : ""}
              </h2>
              {profile.gender && (
                <p className="mt-1 text-sm text-slate-200 capitalize">{profile.gender}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-2xl bg-slate-50/90 p-5 text-base text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            {profile.about || "This user hasn't added a bio yet."}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-700 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-300 shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  No skills listed.
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
             <button
               onClick={() => navigate(`/chats/${userId}`)}
               className="primary-button group relative w-full sm:w-auto px-8"
             >
               Message {profile.firstName}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

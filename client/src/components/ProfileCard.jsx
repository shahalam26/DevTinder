const ProfileCard = ({
  name,
  age,
  bio,
  skills = [],
  image,
  onReject,
  onConnect,
}) => {
  const initials = name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-[0_28px_100px_rgba(2,6,23,0.6)]">
      <div className="relative h-[420px]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 via-fuchsia-500 to-blue-500 text-6xl font-bold text-white">
            {initials || "DT"}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {name}{age ? `, ${age}` : ""}
            </h2>
            <p className="mt-1 text-sm text-slate-200">Available for meaningful collaborations</p>
          </div>
          <div className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            Developer
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-2xl bg-slate-50/90 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          {bio || "No bio added yet. This developer has not filled out their intro."}
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-200"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Skills coming soon
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:scale-[1.02] active:scale-95 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          >
            Pass
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onConnect(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-pink-500/40"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

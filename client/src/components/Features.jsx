export default function Features() {
  const features = [
    { title: "Skill-Based Matching", desc: "Pair with devs who complement your stack." },
    { title: "Code-First Chat", desc: "Share snippets and discuss architecture." },
    { title: "Verified Profiles", desc: "GitHub verified developers only." },
    { title: "Instant Matching", desc: "Connect and collaborate instantly." },
  ];

  return (
    <section className="bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_60%)] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Built for{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Developers
          </span>
        </h2>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="page-card p-6 text-left sm:p-8"
            >
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h4>
              <p className="mt-4 text-slate-500 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

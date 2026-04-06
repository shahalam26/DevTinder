export default function Features() {
  const features = [
    { title: "Skill-Based Matching", desc: "Pair with devs who complement your stack." },
    { title: "Code-First Chat", desc: "Share snippets and discuss architecture." },
    { title: "Verified Profiles", desc: "GitHub verified developers only." },
    { title: "Instant Matching", desc: "Connect and collaborate instantly." },
  ];

  return (
    <section className="py-24 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_60%)]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold">
          Built for{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Developers
          </span>
        </h2>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <h4 className="text-xl font-semibold">{feature.title}</h4>
              <p className="text-gray-400 mt-4">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
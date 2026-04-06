export default function Testimonials() {
  const testimonials = [
    { name: "Sarah Chen", role: "Full-Stack Developer", text: "Found my co-founder in 2 weeks!" },
    { name: "Alex Rivera", role: "Backend Engineer", text: "Best place to find real devs." },
    { name: "Emma Wilson", role: "UI Engineer", text: "More meaningful than conferences." },
  ];

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold">
          Loved by{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Developers
          </span>
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-8 rounded-2xl bg-white/5 border border-white/10"
            >
              <p className="text-gray-300 italic">"{t.text}"</p>
              <h4 className="mt-6 font-semibold">{t.name}</h4>
              <p className="text-gray-400 text-sm">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
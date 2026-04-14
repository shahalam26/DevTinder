export default function Testimonials() {
  const testimonials = [
    { name: "Sarah Chen", role: "Full-Stack Developer", text: "Found my co-founder in 2 weeks!" },
    { name: "Alex Rivera", role: "Backend Engineer", text: "Best place to find real devs." },
    { name: "Emma Wilson", role: "UI Engineer", text: "More meaningful than conferences." },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Loved by{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Developers
          </span>
        </h2>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="page-card p-6 text-left sm:p-8"
            >
              <p className="italic text-slate-600 dark:text-slate-300">"{t.text}"</p>
              <h4 className="mt-6 font-semibold text-slate-900 dark:text-white">{t.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 sm:p-16">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready To Find Your Match?
          </h2>

          <p className="mt-4 text-slate-500 dark:text-slate-400">
            Join thousands of developers already connecting.
          </p>

          <button className="mt-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 text-white transition hover:scale-105 sm:px-10 sm:py-4">
            Create Free Account →
          </button>
        </div>
      </div>
    </section>
  );
}

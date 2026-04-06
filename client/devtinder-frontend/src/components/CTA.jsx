export default function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="p-16 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 text-center">
          <h2 className="text-4xl font-bold">
            Ready To Find Your Match?
          </h2>

          <p className="text-gray-400 mt-4">
            Join thousands of developers already connecting.
          </p>

          <button className="mt-8 px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition">
            Create Free Account →
          </button>
        </div>
      </div>
    </section>
  );
}
export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">

      {/* Gradient Glow Layer */}
      <div
        className="
        absolute inset-0
        bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.15),transparent_60%)]
        dark:bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]
        transition-opacity duration-500
      "
      />

      <div className="relative max-w-5xl mx-auto text-center px-6">

        {/* Tech Tags */}
        <div className="flex justify-center gap-4 mb-6">
          <span className="px-4 py-1 text-sm rounded-full bg-gray-100 border border-gray-200 dark:bg-white/5 dark:border-white/10">
            React
          </span>
          <span className="px-4 py-1 text-sm rounded-full bg-gray-100 border border-gray-200 dark:bg-white/5 dark:border-white/10">
            TypeScript
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-black dark:text-white">
          Swipe.{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Match.
          </span>
          <br />
          Ship Together.
        </h1>

        <p className="mt-6 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          DevTinder connects you with developers who share your passion,
          complement your skills, and are ready to build something amazing.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-full text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 transition-all duration-300">
            Start Swiping →
          </button>

          <button className="px-8 py-4 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10 transition-all duration-300">
            Continue with GitHub
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat number="50K+" label="Developers" />
          <Stat number="120K+" label="Connections" />
          <Stat number="8K+" label="Projects Built" />
          <Stat number="95%" label="Match Rate" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }) {
  return (
    <div className="text-center">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        {number}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}
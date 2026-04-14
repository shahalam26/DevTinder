export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-36">

      {/* Gradient Glow Layer */}
      <div
        className="
        absolute inset-0
        bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.15),transparent_60%)]
        dark:bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]
        transition-opacity duration-500
      "
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">

        {/* Tech Tags */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <span className="rounded-full border border-gray-200 bg-gray-100 px-4 py-1 text-sm dark:border-white/10 dark:bg-white/5">
            React
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-100 px-4 py-1 text-sm dark:border-white/10 dark:bg-white/5">
            TypeScript
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold leading-tight text-black dark:text-white sm:text-5xl md:text-7xl">
          Swipe.{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Match.
          </span>
          <br />
          Ship Together.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
          DevTinder connects you with developers who share your passion,
          complement your skills, and are ready to build something amazing.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-base font-medium text-white transition-all duration-300 hover:scale-105 sm:px-8 sm:py-4 sm:text-lg">
            Start Swiping →
          </button>

          <button className="rounded-full border border-gray-300 bg-gray-100 px-6 py-3 transition-all duration-300 hover:bg-gray-200 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10 sm:px-8 sm:py-4">
            Continue with GitHub
          </button>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-6 sm:mt-16 md:grid-cols-4 md:gap-8">
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

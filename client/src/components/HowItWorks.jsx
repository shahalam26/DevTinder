export default function HowItWorks() {
  const steps = [
    { number: "01", title: "Create Your Profile", desc: "Add skills & interests." },
    { number: "02", title: "Swipe & Match", desc: "Swipe right to connect." },
    { number: "03", title: "Chat & Build", desc: "Collaborate instantly." },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl">
          How It{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Works
          </span>
        </h2>

        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Three simple steps to your next collaboration.
        </p>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="page-card p-6 sm:p-8"
            >
              <h3 className="text-5xl font-bold text-purple-500">{step.number}</h3>
              <h4 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h4>
              <p className="mt-4 text-slate-500 dark:text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

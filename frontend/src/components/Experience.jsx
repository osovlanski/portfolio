export default function Experience({ experience }) {
  if (!experience || experience.length === 0) return null;

  return (
    <section id="experience" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">
          Professional Experience
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-12">
            {experience.map((exp) => (
              <div key={exp.id} className="relative pl-8 md:pl-20">
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-8 top-1 w-px h-px">
                  <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white" />
                </div>

                <div className="bg-surface rounded-xl p-6 border border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h3 className="text-xl font-semibold text-text">
                      {exp.role}
                    </h3>
                    <span className="text-sm text-text-secondary font-medium">
                      {exp.start_date} &mdash; {exp.end_date}
                    </span>
                  </div>
                  <p className="text-primary font-medium mb-1">
                    {exp.company}{" "}
                    <span className="text-text-secondary font-normal">
                      | {exp.location}
                    </span>
                  </p>
                  {exp.description && (
                    <p className="text-sm text-text-secondary italic mb-3">
                      {exp.description}
                    </p>
                  )}
                  <ul className="space-y-2 mt-3">
                    {exp.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm text-text-secondary"
                      >
                        <span className="text-primary mt-1 shrink-0">
                          &#8226;
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

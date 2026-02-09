export default function Education({ education }) {
  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">
          Education
        </h2>

        <div className="space-y-6">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="bg-surface rounded-xl p-6 border border-slate-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h3 className="text-xl font-semibold text-text">
                  {edu.institution}
                </h3>
                <span className="text-sm text-text-secondary font-medium">
                  {edu.start_date} &mdash; {edu.end_date}
                </span>
              </div>
              <p className="text-primary font-medium">
                {edu.degree}{" "}
                <span className="text-text-secondary font-normal">
                  | {edu.location}
                </span>
              </p>
              {edu.highlights.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {edu.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm text-text-secondary"
                    >
                      <span className="text-primary mt-0.5 shrink-0">
                        &#8226;
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Skills({ skills }) {
  if (!skills) return null;

  return (
    <section id="skills" className="py-20 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">
          Technical Skills
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {skills.technical.map((category) => (
            <div
              key={category.category}
              className="bg-white rounded-xl p-6 border border-slate-100"
            >
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
                {category.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-teal-50 text-primary-dark text-sm rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {skills.soft.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-slate-100 text-text-secondary text-sm rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

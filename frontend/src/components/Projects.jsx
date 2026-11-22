export default function Projects({ projects }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className="py-20 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">
          Projects
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <article
              key={project.id}
              className="bg-white rounded-xl p-6 border border-slate-100 flex flex-col"
            >
              <h3 className="text-xl font-semibold text-text">{project.name}</h3>
              {project.status && (
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-1">
                  {project.status}
                </p>
              )}
              <p className="text-sm text-text-secondary mt-3 grow">
                {project.summary}
              </p>
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
                >
                  View repository on GitHub
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

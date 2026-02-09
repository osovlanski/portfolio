import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Contact from "./components/Contact";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/all")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch portfolio data");
        return response.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero profile={data.profile} />
      <section id="about" className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-text mb-8 text-center">
            About Me
          </h2>
          <div className="bg-white rounded-xl p-8 border border-slate-100">
            <p className="text-text-secondary leading-relaxed">
              {data.profile.summary}
            </p>
            {data.profile.languages && data.profile.languages.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Languages
                </h3>
                <div className="flex gap-4">
                  {data.profile.languages.map((lang) => (
                    <span
                      key={lang.name}
                      className="px-3 py-1 bg-teal-50 text-primary-dark text-sm rounded-full font-medium"
                    >
                      {lang.name} &mdash; {lang.level}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Experience experience={data.experience} />
      <Skills skills={data.skills} />
      <Education education={data.education} />
      <Contact profile={data.profile} />
    </div>
  );
}

function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return (
    <AdminDashboard token={token} onLogout={() => setToken(null)} />
  );
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");

  if (isAdmin) {
    return <AdminPage />;
  }

  return <Portfolio />;
}

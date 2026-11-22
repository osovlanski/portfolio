import { useState, useEffect } from "react";
import ProfileForm from "./admin/ProfileForm";
import ExperienceForm from "./admin/ExperienceForm";
import EducationForm from "./admin/EducationForm";
import SkillsForm from "./admin/SkillsForm";

const tabs = ["Profile", "Experience", "Education", "Skills"];

export default function AdminDashboard({ token, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  const [reloadKey, setReloadKey] = useState(0);

  function fetchData() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/all")
      .then((response) => response.json())
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    onLogout();
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-text">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-text-secondary hover:text-primary"
            >
              View Portfolio
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-slate-100 text-text-secondary rounded-lg text-sm hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <nav className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-xl p-6 border border-slate-100">
          {activeTab === "Profile" && (
            <ProfileForm
              profile={data.profile}
              token={token}
              onSave={fetchData}
            />
          )}
          {activeTab === "Experience" && (
            <ExperienceForm
              experiences={data.experience}
              token={token}
              onSave={fetchData}
            />
          )}
          {activeTab === "Education" && (
            <EducationForm
              education={data.education}
              token={token}
              onSave={fetchData}
            />
          )}
          {activeTab === "Skills" && (
            <SkillsForm
              skills={data.skills}
              languages={data.profile.languages}
              token={token}
              onSave={fetchData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

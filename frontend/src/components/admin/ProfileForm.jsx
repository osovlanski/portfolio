import { useState } from "react";

export default function ProfileForm({ profile, token, onSave }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    title: profile.title || "",
    email: profile.email || "",
    phone: profile.phone || "",
    location: profile.location || "",
    linkedin: profile.linkedin || "",
    github: profile.github || "",
    summary: profile.summary || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to save");
      setMessage("Profile saved!");
      onSave();
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "linkedin", label: "LinkedIn URL", type: "url" },
    { name: "github", label: "GitHub URL", type: "url" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-text">Profile</h3>
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {field.label}
          </label>
          <input
            type={field.type}
            name={field.name}
            value={form[field.name]}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Summary
        </label>
        <textarea
          name="summary"
          value={form.summary}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {message && (
          <span
            className={
              message.startsWith("Error") ? "text-red-600" : "text-green-600"
            }
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}

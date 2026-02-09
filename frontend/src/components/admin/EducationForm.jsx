import { useState } from "react";

const emptyEducation = {
  institution: "",
  degree: "",
  location: "",
  start_date: "",
  end_date: "",
  sort_order: 0,
  highlights: [],
};

function EducationEditor({ education, token, onSave, onDelete }) {
  const [form, setForm] = useState({ ...education });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const isNew = !education.id;
      const url = isNew
        ? "/api/admin/education"
        : `/api/admin/education/${education.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to save");
      setMessage("Saved!");
      onSave();
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Institution
          </label>
          <input
            name="institution"
            value={form.institution}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Degree
          </label>
          <input
            name="degree"
            value={form.degree}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Location
          </label>
          <input
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Sort Order
          </label>
          <input
            type="number"
            name="sort_order"
            value={form.sort_order}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Start Date
          </label>
          <input
            name="start_date"
            value={form.start_date || ""}
            onChange={handleChange}
            placeholder="e.g. Oct 2016"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            End Date
          </label>
          <input
            name="end_date"
            value={form.end_date || ""}
            onChange={handleChange}
            placeholder="e.g. Jul 2020"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-sm"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {education.id && (
          <button
            type="button"
            onClick={() => onDelete(education.id)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
          >
            Delete
          </button>
        )}
        {message && (
          <span
            className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

export default function EducationForm({ education, token, onSave }) {
  const [adding, setAdding] = useState(false);

  async function handleDelete(educationId) {
    const response = await fetch(`/api/admin/education/${educationId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) onSave();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-text">Education</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
        >
          {adding ? "Cancel" : "Add New"}
        </button>
      </div>
      {adding && (
        <EducationEditor
          education={emptyEducation}
          token={token}
          onSave={() => {
            setAdding(false);
            onSave();
          }}
          onDelete={() => {}}
        />
      )}
      {education.map((edu) => (
        <EducationEditor
          key={edu.id}
          education={edu}
          token={token}
          onSave={onSave}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

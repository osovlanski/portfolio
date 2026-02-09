import { useState } from "react";

const emptyExperience = {
  role: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  sort_order: 0,
  highlights: [],
};

function ExperienceEditor({ experience, token, onSave, onDelete }) {
  const [form, setForm] = useState({ ...experience });
  const [highlights, setHighlights] = useState([...experience.highlights]);
  const [newHighlight, setNewHighlight] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const isNew = !experience.id;
      const url = isNew
        ? "/api/admin/experience"
        : `/api/admin/experience/${experience.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to save experience");

      const data = await response.json();
      const experienceId = experience.id || data.id;

      // Save highlights
      const highlightResponse = await fetch(
        `/api/admin/experience/${experienceId}/highlights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ highlights }),
        }
      );
      if (!highlightResponse.ok) throw new Error("Failed to save highlights");

      setMessage("Saved!");
      onSave();
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  function addHighlight() {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  }

  function removeHighlight(index) {
    setHighlights(highlights.filter((_, idx) => idx !== index));
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Role
          </label>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Company
          </label>
          <input
            name="company"
            value={form.company}
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
            value={form.start_date}
            onChange={handleChange}
            placeholder="e.g. Jan 2022"
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
            placeholder="e.g. Present"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Description
        </label>
        <input
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Highlights
        </label>
        <ul className="space-y-1 mb-2">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <span className="flex-1">{highlight}</span>
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            value={newHighlight}
            onChange={(event) => setNewHighlight(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && (event.preventDefault(), addHighlight())
            }
            placeholder="Add highlight..."
            className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="px-3 py-1 bg-slate-100 text-text-secondary rounded-lg text-sm hover:bg-slate-200"
          >
            Add
          </button>
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
        {experience.id && (
          <button
            type="button"
            onClick={() => onDelete(experience.id)}
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

export default function ExperienceForm({ experiences, token, onSave }) {
  const [adding, setAdding] = useState(false);

  async function handleDelete(experienceId) {
    const response = await fetch(`/api/admin/experience/${experienceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) onSave();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-text">Experience</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
        >
          {adding ? "Cancel" : "Add New"}
        </button>
      </div>
      {adding && (
        <ExperienceEditor
          experience={emptyExperience}
          token={token}
          onSave={() => {
            setAdding(false);
            onSave();
          }}
          onDelete={() => {}}
        />
      )}
      {experiences.map((exp) => (
        <ExperienceEditor
          key={exp.id}
          experience={exp}
          token={token}
          onSave={onSave}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

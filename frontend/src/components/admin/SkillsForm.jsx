import { useState } from "react";

function SkillCategoryEditor({ categories, token, onSave }) {
  const [cats, setCats] = useState(
    categories.map((cat) => ({ category: cat.category, items: [...cat.items] }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newItemInputs, setNewItemInputs] = useState({});

  function addCategory() {
    setCats([...cats, { category: "", items: [] }]);
  }

  function removeCategory(index) {
    setCats(cats.filter((_, idx) => idx !== index));
  }

  function updateCategoryName(index, name) {
    const updated = [...cats];
    updated[index] = { ...updated[index], category: name };
    setCats(updated);
  }

  function addItem(catIndex) {
    const text = (newItemInputs[catIndex] || "").trim();
    if (!text) return;
    const updated = [...cats];
    updated[catIndex] = {
      ...updated[catIndex],
      items: [...updated[catIndex].items, text],
    };
    setCats(updated);
    setNewItemInputs({ ...newItemInputs, [catIndex]: "" });
  }

  function removeItem(catIndex, itemIndex) {
    const updated = [...cats];
    updated[catIndex] = {
      ...updated[catIndex],
      items: updated[catIndex].items.filter((_, idx) => idx !== itemIndex),
    };
    setCats(updated);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categories: cats }),
      });
      if (!response.ok) throw new Error("Failed to save");
      setMessage("Skills saved!");
      onSave();
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-text">Technical Skills</h4>
        <button
          onClick={addCategory}
          className="px-3 py-1 bg-slate-100 text-text-secondary rounded-lg text-sm hover:bg-slate-200"
        >
          Add Category
        </button>
      </div>
      {cats.map((cat, catIndex) => (
        <div key={catIndex} className="border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={cat.category}
              onChange={(event) => updateCategoryName(catIndex, event.target.value)}
              placeholder="Category name"
              className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => removeCategory(catIndex)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cat.items.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-primary-dark text-sm rounded-full"
              >
                {item}
                <button
                  onClick={() => removeItem(catIndex, itemIndex)}
                  className="text-red-400 hover:text-red-600 ml-1"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newItemInputs[catIndex] || ""}
              onChange={(event) =>
                setNewItemInputs({ ...newItemInputs, [catIndex]: event.target.value })
              }
              onKeyDown={(event) =>
                event.key === "Enter" && (event.preventDefault(), addItem(catIndex))
              }
              placeholder="Add skill..."
              className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => addItem(catIndex)}
              className="px-3 py-1 bg-slate-100 text-text-secondary rounded-lg text-sm hover:bg-slate-200"
            >
              Add
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-sm"
        >
          {saving ? "Saving..." : "Save Skills"}
        </button>
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

function ListEditor({ title, items, apiPath, token, onSave, isLanguage }) {
  const [list, setList] = useState(
    isLanguage
      ? items.map((lang) => ({ name: lang.name, level: lang.level }))
      : [...items]
  );
  const [newItem, setNewItem] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addItem() {
    if (isLanguage) {
      if (newItem.trim() && newLevel.trim()) {
        setList([...list, { name: newItem.trim(), level: newLevel.trim() }]);
        setNewItem("");
        setNewLevel("");
      }
    } else {
      if (newItem.trim()) {
        setList([...list, newItem.trim()]);
        setNewItem("");
      }
    }
  }

  function removeItem(index) {
    setList(list.filter((_, idx) => idx !== index));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(apiPath, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: list }),
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
    <div className="space-y-3">
      <h4 className="text-lg font-medium text-text">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {list.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-text-secondary text-sm rounded-full"
          >
            {isLanguage ? `${item.name} (${item.level})` : item}
            <button
              onClick={() => removeItem(index)}
              className="text-red-400 hover:text-red-600 ml-1"
            >
              x
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          onKeyDown={(event) =>
            event.key === "Enter" && !isLanguage && (event.preventDefault(), addItem())
          }
          placeholder={isLanguage ? "Language name..." : "Add item..."}
          className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {isLanguage && (
          <input
            value={newLevel}
            onChange={(event) => setNewLevel(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && (event.preventDefault(), addItem())
            }
            placeholder="Level (e.g. Native)"
            className="w-40 px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
        <button
          onClick={addItem}
          className="px-3 py-1 bg-slate-100 text-text-secondary rounded-lg text-sm hover:bg-slate-200"
        >
          Add
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-sm"
        >
          {saving ? "Saving..." : "Save"}
        </button>
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

export default function SkillsForm({ skills, languages, token, onSave }) {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-text">Skills & Languages</h3>
      <SkillCategoryEditor
        categories={skills.technical}
        token={token}
        onSave={onSave}
      />
      <hr className="border-slate-200" />
      <ListEditor
        title="Soft Skills"
        items={skills.soft}
        apiPath="/api/admin/soft-skills"
        token={token}
        onSave={onSave}
        isLanguage={false}
      />
      <hr className="border-slate-200" />
      <ListEditor
        title="Languages"
        items={languages}
        apiPath="/api/admin/languages"
        token={token}
        onSave={onSave}
        isLanguage={true}
      />
    </div>
  );
}

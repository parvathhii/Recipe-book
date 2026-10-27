import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Plus, Clock3, Leaf, X, Pencil, Trash2, ChefHat, Utensils, ArrowUpRight, Sprout, Check, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/recipes";
const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const EMPTY = { name: "", category: "Breakfast", ingredients: "", steps: "", cookingTime: "20" };
const formatList = (value) => Array.isArray(value) ? value.join("\n") : (value || "");
const normalize = (r) => ({
  ...r,
  name: r.name ?? r.recipeName ?? "",
  category: r.category ?? "Dinner",
  ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
  steps: Array.isArray(r.steps) ? r.steps : Array.isArray(r.preparationSteps) ? r.preparationSteps : [],
  cookingTime: Number(r.cookingTime ?? r.cookingTimeMinutes ?? 0)
});
const escapeError = (e) => e instanceof Error ? e.message : "Something went wrong.";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All recipes");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function request(url = API, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
    return data;
  }

  async function loadRecipes() {
    setLoading(true);
    setApiError("");
    try {
      const data = await request();
      setRecipes((Array.isArray(data) ? data : data.recipes || []).map(normalize));
    } catch (error) {
      setApiError(`${escapeError(error)} Make sure the backend is running and MongoDB is connected.`);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadRecipes(); }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const visibleRecipes = useMemo(() => recipes.filter((r) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || r.name.toLowerCase().includes(query) || r.ingredients.join(" ").toLowerCase().includes(query);
    return matchesSearch && (category === "All recipes" || r.category === category);
  }), [recipes, search, category]);

  function openAdd() { setForm(EMPTY); setSelected(null); setModal("form"); }
  function openEdit(recipe) {
    setSelected(recipe);
    setForm({ name: recipe.name, category: recipe.category, ingredients: formatList(recipe.ingredients), steps: formatList(recipe.steps), cookingTime: String(recipe.cookingTime) });
    setModal("form");
  }
  function updateField(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); }

  async function submitRecipe(e) {
    e.preventDefault();
    const ingredients = form.ingredients.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    const steps = form.steps.split(/\n/).map((s) => s.trim()).filter(Boolean);
    const cookingTime = Number(form.cookingTime);
    if (!form.name.trim() || !CATEGORIES.includes(form.category) || !ingredients.length || !steps.length || !Number.isFinite(cookingTime) || cookingTime <= 0) {
      setToast("Please complete every field with valid details."); return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), category: form.category, ingredients, steps, cookingTime };
      if (selected) {
        const updated = normalize(await request(`${API}/${selected._id || selected.id}`, { method: "PUT", body: JSON.stringify(payload) }));
        setRecipes((prev) => prev.map((r) => (r._id || r.id) === (updated._id || updated.id) ? updated : r));
        setToast("Recipe updated — lovely!");
      } else {
        const created = normalize(await request(API, { method: "POST", body: JSON.stringify(payload) }));
        setRecipes((prev) => [created, ...prev]);
        setToast("Recipe added to your book!");
      }
      setModal(null);
    } catch (error) { setToast(escapeError(error)); }
    finally { setSaving(false); }
  }

  async function deleteRecipe(recipe) {
    if (!window.confirm(`Delete “${recipe.name}” from your recipe book?`)) return;
    try {
      await request(`${API}/${recipe._id || recipe.id}`, { method: "DELETE" });
      setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== (recipe._id || recipe.id)));
      if (selected && (selected._id || selected.id) === (recipe._id || recipe.id)) { setSelected(null); setModal(null); }
      setToast("Recipe removed.");
    } catch (error) { setToast(escapeError(error)); }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setCategory("All recipes"); setSearch(""); }}>
          <span className="brand-mark"><Sprout size={22}/></span>
          <span><strong>gather <i>&</i> thyme</strong><small>YOUR PERSONAL RECIPE BOOK</small></span>
        </a>
        <div className="topbar-right"><span className="season-note"><Leaf size={15}/> Made for the love of home cooking</span><button className="primary-btn top-add" onClick={openAdd}><Plus size={17}/> Add a recipe</button></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line"/> A LITTLE INSPIRATION FOR YOUR TABLE</span>
            <h1>Good food.<br/><em>Gathered memories.</em></h1>
            <p>A cosy corner for the recipes you love, the flavours you discover, and the meals you'll make again and again.</p>
            <div className="hero-note"><span className="note-icon"><BookOpen size={18}/></span><span><b>Your kitchen, your collection</b><small>Keep every favourite close at hand.</small></span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of fresh herbs and a bowl">
            <div className="art-circle circle-one"/><div className="art-circle circle-two"/>
            <div className="art-label"><Leaf size={14}/> FRESH FROM YOUR KITCHEN</div>
            <div className="plate"><div className="plate-inner"><div className="herb-stem stem-a"/><div className="herb-stem stem-b"/><div className="leaf-shape l1"/><div className="leaf-shape l2"/><div className="leaf-shape l3"/><div className="leaf-shape l4"/><div className="leaf-shape l5"/><div className="leaf-shape l6"/><div className="tomato t1"/><div className="tomato t2"/><div className="tiny-leaf"/></div></div>
            <div className="art-caption">A pinch of love, a handful of herbs.</div>
          </div>
        </section>

        <section className="collection-head">
          <div><span className="eyebrow">THE COLLECTION</span><h2>Your recipe <em>shelf</em></h2><p>{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} saved for the moments that matter.</p></div>
          <div className="collection-stats"><span className="stat-icon"><ChefHat size={21}/></span><span><b>{recipes.length.toString().padStart(2, "0")}</b><small>RECIPES COLLECTED</small></span></div>
        </section>

        <section className="toolbar">
          <div className="search-box"><Search size={18}/><input aria-label="Search recipes" placeholder="Find a favourite..." value={search} onChange={(e) => setSearch(e.target.value)}/>{search && <button className="icon-btn" aria-label="Clear search" onClick={() => setSearch("")}><X size={15}/></button>}</div>
          <div className="filter-tabs" aria-label="Filter recipes by category">
            {["All recipes", ...CATEGORIES].map((item) => <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </section>

        {apiError && <div className="error-banner"><AlertCircle size={18}/><div><b>We couldn't load your recipes yet.</b><p>{apiError}</p><button className="text-action" onClick={loadRecipes}>Try again <ArrowUpRight size={14}/></button></div></div>}
        {loading ? <div className="empty-state"><div className="empty-icon"><Utensils size={26}/></div><h3>Setting the table...</h3><p>Fetching your recipes.</p></div> :
          visibleRecipes.length ? <section className="recipe-grid">
            {visibleRecipes.map((recipe, index) => <article className="recipe-card" key={recipe._id || recipe.id || recipe.name}>
              <div className={`card-illustration illustration-${index % 4}`}>
                <span className="category-pill">{recipe.category}</span><span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="food-art"><div className="food-plate"/><div className="food-center"/><div className="food-leaf fa"/><div className="food-leaf fb"/><div className="food-dot fd1"/><div className="food-dot fd2"/><div className="food-dot fd3"/></div>
                <span className="illustration-caption">{["simple things, made well", "a table to come home to", "seasoned with care", "a little everyday magic"][index % 4]}</span>
              </div>
              <div className="card-content"><div className="card-meta"><span><Clock3 size={14}/>{recipe.cookingTime} min</span><span className="dot-separator"/> <span>{recipe.ingredients.length} ingredients</span></div>
                <h3>{recipe.name}</h3><p className="ingredient-preview">{recipe.ingredients.slice(0, 3).join(" · ")}{recipe.ingredients.length > 3 ? " · ..." : ""}</p>
                <div className="card-footer"><button className="view-link" onClick={() => { setSelected(recipe); setModal("detail"); }}>View recipe <ArrowUpRight size={15}/></button><div className="card-actions"><button title="Edit recipe" aria-label={`Edit ${recipe.name}`} className="icon-btn" onClick={() => openEdit(recipe)}><Pencil size={15}/></button><button title="Delete recipe" aria-label={`Delete ${recipe.name}`} className="icon-btn delete-icon" onClick={() => deleteRecipe(recipe)}><Trash2 size={15}/></button></div></div>
              </div>
            </article>)}
          </section> :
          <div className="empty-state"><div className="empty-icon"><BookOpen size={26}/></div><h3>{search || category !== "All recipes" ? "No recipes found just yet" : "Your shelf is waiting"}</h3><p>{search || category !== "All recipes" ? "Try another search or category." : "Every great collection starts with one delicious recipe."}</p>{!search && category === "All recipes" && <button className="primary-btn" onClick={openAdd}><Plus size={17}/> Add your first recipe</button>}</div>
        }
        <footer className="footer"><span><Sprout size={15}/> Gather slowly. Cook with heart.</span><span>MADE WITH CARE <i>·</i> ONE RECIPE AT A TIME</span></footer>
      </main>

      {modal === "form" && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}><section className="modal form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><div className="modal-heading"><div><span className="eyebrow">{selected ? "MAKE IT YOUR OWN" : "ADD TO YOUR COLLECTION"}</span><h2 id="form-title">{selected ? "Edit your recipe" : "A new favourite"}</h2><p>Write it down, so it's never forgotten.</p></div><button className="icon-btn close-btn" onClick={() => setModal(null)} aria-label="Close"><X/></button></div>
        <form onSubmit={submitRecipe} className="recipe-form">
          <label>Recipe name<input name="name" value={form.name} onChange={updateField} placeholder="e.g. Sunday lemon pasta" maxLength={100} required/></label>
          <div className="form-row"><label>Category<select name="category" value={form.category} onChange={updateField} required>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label><label>Cooking time (minutes)<input name="cookingTime" type="number" min="1" step="1" value={form.cookingTime} onChange={updateField} required/></label></div>
          <label>Ingredients <small>One per line (or separated by commas)</small><textarea name="ingredients" value={form.ingredients} onChange={updateField} placeholder={"2 cups flour\n1 ripe banana\nA pinch of cinnamon"} rows={4} required/></label>
          <label>Preparation steps <small>One step per line</small><textarea name="steps" value={form.steps} onChange={updateField} placeholder={"Preheat the oven.\nMix the ingredients together.\nBake until golden."} rows={4} required/></label>
          <div className="form-actions"><button type="button" className="secondary-btn" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : <><Check size={16}/>{selected ? "Save changes" : "Save recipe"}</>}</button></div>
        </form></section></div>}

      {modal === "detail" && selected && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}><section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="icon-btn close-btn detail-close" onClick={() => setModal(null)} aria-label="Close"><X/></button><div className="detail-hero"><span className="category-pill">{selected.category}</span><div className="detail-food"><ChefHat size={54}/></div></div><div className="detail-body"><span className="eyebrow"><Clock3 size={14}/> {selected.cookingTime} MINUTES · {selected.ingredients.length} INGREDIENTS</span><h2 id="detail-title">{selected.name}</h2><div className="detail-columns"><section><h3>What you'll need</h3><ul className="ingredient-list">{selected.ingredients.map((item, i) => <li key={i}><span className="ingredient-check"><Check size={12}/></span>{item}</li>)}</ul></section><section><h3>Let's make it</h3><ol className="step-list">{selected.steps.map((step, i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section></div><div className="form-actions"><button className="secondary-btn" onClick={() => deleteRecipe(selected)}><Trash2 size={15}/> Delete</button><button className="primary-btn" onClick={() => openEdit(selected)}><Pencil size={15}/> Edit recipe</button></div></div></section></div>}

      {toast && <div className="toast" role="status"><Check size={17}/>{toast}</div>}
    </div>
  );
}

export default App;
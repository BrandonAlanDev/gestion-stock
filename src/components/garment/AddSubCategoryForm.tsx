"use client";

import { useState } from "react";
import { createSubCategory } from "@/actions/garments";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  sizeTypes: any[];
}

export default function AddSubCategoryForm({ categoryId, sizeTypes }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [sizeTypeId, setSizeTypeId] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await createSubCategory({
      name,
      categoryId,
      sizeTypeId: sizeTypeId || null,
    });
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Subcategoría vinculada");
      setName("");
      setSizeTypeId("");
    }
  };

  const fieldStyle: React.CSSProperties = {
    background: "#f0fafa",
    border: "1px solid #b2dede",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "#0d2b2e",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <form
      onSubmit={handleAdd}
      className="space-y-3"
      style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e0f5f5" }}
    >
      <p
        className="text-[9px] font-black uppercase tracking-widest mb-2"
        style={{ color: "#0d5c63" }}
      >
        + Nuevo Subgrupo
      </p>

      <div className="flex flex-col gap-2">
        <input
          style={fieldStyle}
          placeholder="Nombre (ej: Neoprenes)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          onFocus={e => (e.currentTarget.style.borderColor = "#4ab8b8")}
          onBlur={e => (e.currentTarget.style.borderColor = "#b2dede")}
        />

        <div className="flex gap-2">
          <select
            style={{ ...fieldStyle, flex: 1, cursor: "pointer", color: sizeTypeId ? "#0d2b2e" : "#4a7c80" }}
            value={sizeTypeId}
            onChange={(e) => setSizeTypeId(e.target.value)}
            onFocus={e => (e.currentTarget.style.borderColor = "#4ab8b8")}
            onBlur={e => (e.currentTarget.style.borderColor = "#b2dede")}
          >
            <option value="">Talle estándar...</option>
            {sizeTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading || !name}
            className="transition-all"
            style={{
              background: loading || !name ? "#e0f5f5" : "#0d5c63",
              color: loading || !name ? "#4a7c80" : "#ffffff",
              padding: "10px",
              borderRadius: "12px",
              border: "none",
              cursor: loading || !name ? "not-allowed" : "pointer",
              opacity: loading || !name ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={e => {
              if (!loading && name)
                (e.currentTarget as HTMLButtonElement).style.background = "#083d42";
            }}
            onMouseLeave={e => {
              if (!loading && name)
                (e.currentTarget as HTMLButtonElement).style.background = "#0d5c63";
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </form>
  );
}
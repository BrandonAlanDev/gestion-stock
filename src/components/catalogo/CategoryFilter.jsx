import React from 'react';
import { categories } from './data';


const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex gap-4 overflow-x-auto py-8 no-scrollbar pb-6">
      <button 
        onClick={() => setActiveCategory("Todos")}
        className={`px-6 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
          activeCategory === "Todos" 
            ? "bg-black text-white shadow-lg" 
            : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.name)}
          className={`px-6 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
            activeCategory === cat.name 
              ? "bg-black text-white shadow-lg" 
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
export default CategoryFilter;
import React from 'react';
import {
  Apple,
  Dumbbell,
  Gamepad2,
  Glasses,
  Headphones,
  Home,
  Layers,
  Package,
  Shirt,
  Sparkles,
  Smartphone,
  Tag,
  Watch,
} from 'lucide-react';

interface ShopByCategoryProps {
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('apparel')) return <Shirt className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('electr') || lower.includes('phone') || lower.includes('tech')) return <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('home') || lower.includes('living') || lower.includes('kitchen')) return <Home className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('beauty') || lower.includes('skin') || lower.includes('care')) return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('sport') || lower.includes('fitness')) return <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('groc') || lower.includes('food')) return <Apple className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('toy') || lower.includes('game')) return <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes('access') || lower.includes('watch')) return <Watch className="w-5 h-5 sm:w-6 sm:h-6" />;
  return <Package className="w-5 h-5 sm:w-6 sm:h-6" />;
};

const getCategoryColors = (name: string, isSelected: boolean) => {
  if (isSelected) return 'bg-purple-600 text-white shadow-md ring-2 ring-purple-600 ring-offset-2';
  const lower = name.toLowerCase();
  if (lower.includes('fashion')) return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
  if (lower.includes('electr')) return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
  if (lower.includes('home')) return 'bg-teal-100 text-teal-700 hover:bg-teal-200';
  if (lower.includes('beauty')) return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
  if (lower.includes('sport')) return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
  if (lower.includes('groc')) return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
  if (lower.includes('toy')) return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
  if (lower.includes('access')) return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
  return 'bg-stone-100 text-stone-700 hover:bg-stone-200';
};

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  categories = [
    'Fashion',
    'Electronics',
    'Home & Living',
    'Beauty',
    'Sports',
    'Groceries',
    'Toys & Hobbies',
    'Accessories',
  ],
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-8 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-700" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Shop By Category
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
          >
            {selectedCategory !== 'All' ? 'Show All Categories (Reset)' : 'View All →'}
          </button>
        </div>

        {/* Dynamic Categories Grid / Carousel */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((catName) => {
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => onSelectCategory(isSelected ? 'All' : catName)}
                className={`flex flex-col items-center gap-2 p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-purple-50 ring-2 ring-purple-600 shadow-xs'
                    : 'hover:bg-stone-50'
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${getCategoryColors(
                    catName,
                    isSelected
                  )}`}
                >
                  {getCategoryIcon(catName)}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold text-center truncate w-full ${
                    isSelected ? 'text-purple-950 font-black' : 'text-stone-700'
                  }`}
                  title={catName}
                >
                  {catName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

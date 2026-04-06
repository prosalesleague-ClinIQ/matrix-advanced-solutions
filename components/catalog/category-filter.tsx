'use client'

import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = cat === selected
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-purple/20'
                : 'bg-white/5 text-steel-400 hover:text-white hover:bg-white/8 border border-white/10'
            )}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}

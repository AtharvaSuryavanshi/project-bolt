import React, { useState } from 'react';
import { Check, Plus, Tag, X } from 'lucide-react';
import useBlogStore from '../../store/blogStore';

interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategories, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { categories, createCategory } = useBlogStore();

  const handleToggleCategory = (categoryName: string) => {
    const isSelected = selectedCategories.includes(categoryName);
    if (isSelected) {
      onChange(selectedCategories.filter(c => c !== categoryName));
    } else {
      onChange([...selectedCategories, categoryName]);
    }
  };

  const handleRemoveCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategories.filter(c => c !== category));
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') return;
    
    const exists = categories.some(c => 
      c.name.toLowerCase() === newCategory.trim().toLowerCase()
    );
    
    if (exists) {
      // If category already exists, just select it
      if (!selectedCategories.includes(newCategory.trim())) {
        onChange([...selectedCategories, newCategory.trim()]);
      }
    } else {
      // Create new category
      const result = await createCategory(newCategory.trim());
      if (result) {
        onChange([...selectedCategories, result.name]);
      }
    }
    
    setNewCategory('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Categories
      </label>
      
      <div 
        className="min-h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-1">
            {selectedCategories.map(category => (
              <div 
                key={category}
                className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full px-2 py-1 text-xs"
              >
                <Tag className="h-3 w-3 mr-1" />
                {category}
                <button
                  onClick={(e) => handleRemoveCategory(category, e)}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-1.5 text-sm text-gray-500 dark:text-gray-400">
            Select categories...
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category..."
                className="flex-1 p-1.5 text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none focus:ring-0 outline-none"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCategory();
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="py-1">
            {categories.map(category => (
              <div
                key={category.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCategory(category.name);
                }}
                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span>{category.name}</span>
                </div>
                {selectedCategories.includes(category.name) && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
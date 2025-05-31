import React, { useState } from 'react';
import { Check, Plus, Tag, X } from 'lucide-react';
import useBlogStore from '../../store/blogStore';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { tags, createTag } = useBlogStore();

  const handleToggleTag = (tagName: string) => {
    const isSelected = selectedTags.includes(tagName);
    if (isSelected) {
      onChange(selectedTags.filter(t => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTags.filter(t => t !== tag));
  };

  const handleAddTag = async () => {
    if (newTag.trim() === '') return;
    
    const exists = tags.some(t => 
      t.name.toLowerCase() === newTag.trim().toLowerCase()
    );
    
    if (exists) {
      // If tag already exists, just select it
      if (!selectedTags.includes(newTag.trim())) {
        onChange([...selectedTags, newTag.trim()]);
      }
    } else {
      // Create new tag
      const result = await createTag(newTag.trim());
      if (result) {
        onChange([...selectedTags, result.name]);
      }
    }
    
    setNewTag('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tags
      </label>
      
      <div 
        className="min-h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-1">
            {selectedTags.map(tag => (
              <div 
                key={tag}
                className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full px-2 py-1 text-xs"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <button
                  onClick={(e) => handleRemoveTag(tag, e)}
                  className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-1.5 text-sm text-gray-500 dark:text-gray-400">
            Add tags...
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                className="flex-1 p-1.5 text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none focus:ring-0 outline-none"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTag();
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="py-1">
            {tags.map(tag => (
              <div
                key={tag.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTag(tag.name);
                }}
                className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span>{tag.name}</span>
                </div>
                {selectedTags.includes(tag.name) && (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
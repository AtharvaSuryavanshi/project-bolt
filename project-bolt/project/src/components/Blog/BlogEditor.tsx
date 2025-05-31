import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, Heading1, Heading2, Quote, Code, 
  Clock, Save, FileText, Eye, Share2, 
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { debounce } from '../../utils/helpers';
import { BlogDraft } from '../../types/blog';
import useBlogStore from '../../store/blogStore';
import CategorySelector from './CategorySelector';
import TagSelector from './TagSelector';

interface BlogEditorProps {
  postId?: number;
  initialData?: BlogDraft;
  onPublish?: (draft: BlogDraft) => void;
  onPreview?: (draft: BlogDraft) => void;
}

const AUTOSAVE_DELAY = 2000;
const MIN_TITLE_LENGTH = 4;

const BlogEditor: React.FC<BlogEditorProps> = ({ 
  postId, 
  initialData,
  onPublish,
  onPreview
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [categories, setCategories] = useState<string[]>(initialData?.categories || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  
  const { saveDraft } = useBlogStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing blog post...',
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-800 rounded px-1',
        },
      }),
    ],
    content: initialData?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Calculate word count
      const text = editor.getText();
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      // Estimate reading time (avg reading speed: 200 words per minute)
      setReadingTime(Math.max(1, Math.ceil(words / 200)));
      
      setIsDirty(true);
      debouncedSave(html);
    },
  });

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      if (!title || title.length < MIN_TITLE_LENGTH) {
        return;
      }
      
      await handleSave(content);
    }, AUTOSAVE_DELAY),
    [title, categories, tags, excerpt, featuredImage]
  );

  const handleSave = async (content: string) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const draft: BlogDraft = {
        id: postId,
        title,
        content,
        excerpt,
        featuredImage,
        status: 'draft',
        categories,
        tags
      };
      
      const result = await saveDraft(draft);
      
      if (result) {
        setLastSaved(new Date().toISOString());
        setIsDirty(false);
        // If this is a new post, set the postId
        if (!postId && result.id) {
          postId = result.id;
        }
      } else {
        setError('Failed to save draft');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    if (editor) {
      const content = editor.getHTML();
      handleSave(content);
    }
  };

  const handlePublish = () => {
    if (!editor || !onPublish) return;
    
    const content = editor.getHTML();
    const draft: BlogDraft = {
      id: postId,
      title,
      content,
      excerpt,
      featuredImage,
      status: 'published',
      categories,
      tags
    };
    
    onPublish(draft);
  };

  const handlePreview = () => {
    if (!editor || !onPreview) return;
    
    const content = editor.getHTML();
    const draft: BlogDraft = {
      id: postId,
      title,
      content,
      excerpt,
      featuredImage,
      status: 'draft',
      categories,
      tags
    };
    
    onPreview(draft);
  };

  const insertLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = () => {
    if (!editor) return;
    
    const url = window.prompt('Image URL');
    
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: 'User inserted image' }).run();
    }
  };

  // Save before unloading if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all">
      {/* Header with save status */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {postId ? 'Edit Post' : 'New Post'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {readingTime} min read
            </span>
          </div>
          
          <div className="flex items-center ml-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
              {wordCount} words
            </span>
          </div>
          
          {isSaving && (
            <div className="flex items-center text-blue-600 dark:text-blue-400 ml-4">
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              <span className="text-xs">Saving...</span>
            </div>
          )}
          
          {lastSaved && !isSaving && !error && (
            <div className="flex items-center text-green-600 dark:text-green-400 ml-4">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center text-red-600 dark:text-red-400 ml-4">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Title */}
      <div className="p-6 pb-0">
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDirty(true);
          }}
          className="w-full text-3xl font-serif font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      
      {/* Featured Image URL */}
      <div className="px-6 py-3">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Featured Image URL (optional)"
            value={featuredImage}
            onChange={(e) => {
              setFeaturedImage(e.target.value);
              setIsDirty(true);
            }}
            className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        
        {featuredImage && (
          <div className="mt-2 relative group">
            <img 
              src={featuredImage} 
              alt="Featured" 
              className="w-full h-48 object-cover rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>
      
      {/* Categories and Tags */}
      <div className="px-6 py-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySelector
          selectedCategories={categories}
          onChange={(newCategories) => {
            setCategories(newCategories);
            setIsDirty(true);
          }}
        />
        
        <TagSelector
          selectedTags={tags}
          onChange={(newTags) => {
            setTags(newTags);
            setIsDirty(true);
          }}
        />
      </div>
      
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('bold') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('italic') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('underline') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('heading', { level: 1 }) 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('heading', { level: 2 }) 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('bulletList') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('orderedList') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('blockquote') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Quote className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('codeBlock') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Code className="h-4 w-4" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        
        <button
          onClick={insertLink}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor?.isActive('link') 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        
        <button
          onClick={insertImage}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>
      
      {/* Editor Content */}
      <div className="p-6 min-h-[400px]">
        <EditorContent 
          editor={editor} 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-img:rounded-lg prose-a:text-blue-600 min-h-[400px]" 
        />
      </div>
      
      {/* Excerpt */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Excerpt (short summary of your post)
        </label>
        <textarea
          placeholder="Write a brief excerpt for your post..."
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            setIsDirty(true);
          }}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        ></textarea>
      </div>
      
      {/* Footer with Actions */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <div>
          <button
            onClick={handleManualSave}
            disabled={isSaving || !isDirty}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          
          <button
            onClick={handlePublish}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
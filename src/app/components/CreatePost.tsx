import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Image, Send } from 'lucide-react';
import type { User } from '../types';

interface CreatePostProps {
  onCreatePost: (content: string, image?: string) => void;
  currentUser: User;
}

export function CreatePost({ onCreatePost, currentUser }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onCreatePost(content, image || undefined);
    setContent('');
    setImage('');
    setShowImageInput(false);
  };

  return (
    <div className="bg-card border-4 border-border p-6 shadow-[6px_6px_0px_0px_rgba(43,37,32,1)] animate-[slideUp_0.4s_ease-out]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="border-2 border-border focus:border-primary focus:ring-0 resize-none transition-colors"
        />

        {showImageInput && (
          <div className="animate-[slideDown_0.2s_ease-out]">
            <Input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL (https://...)"
              className="border-2 border-border focus:border-primary focus:ring-0"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            variant="outline"
            size="sm"
            className="border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Image size={16} className="mr-2" />
            {showImageInput ? 'Remove Image' : 'Add Image'}
          </Button>

          <Button
            type="submit"
            disabled={!content.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border shadow-[3px_3px_0px_0px_rgba(43,37,32,1)] hover:shadow-[1px_1px_0px_0px_rgba(43,37,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="mr-2" />
            Post
          </Button>
        </div>
      </form>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

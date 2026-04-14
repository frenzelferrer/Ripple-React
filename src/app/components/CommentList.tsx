import { useState } from 'react';
import { Send, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { User, Comment } from '../types';

interface CommentListProps {
  postId: string;
  comments: Comment[];
  users: User[];
  currentUser: User;
  onCreateComment: (postId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function CommentList({
  postId,
  comments,
  users,
  currentUser,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onViewProfile,
}: CommentListProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onCreateComment(postId, newComment);
    setNewComment('');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      onUpdateComment(commentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="p-6">
      {/* Add Comment */}
      <form onSubmit={handleAddComment} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="border-2 border-border focus:border-primary focus:ring-0"
          />
          <Button
            type="submit"
            disabled={!newComment.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(comment => {
            const commentUser = users.find(u => u.id === comment.user_id);
            if (!commentUser) return null;

            const isOwner = comment.user_id === currentUser.id;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className="flex gap-3 group animate-[fadeIn_0.2s_ease-out]">
                <button
                  onClick={() => onViewProfile(commentUser.id)}
                  className="flex-shrink-0"
                >
                  {commentUser.profile_image ? (
                    <img
                      src={commentUser.profile_image}
                      alt={commentUser.full_name}
                      className="w-8 h-8 object-cover border-2 border-border hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted border-2 border-border flex items-center justify-center hover:opacity-80 transition-opacity">
                      <UserIcon size={14} />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="bg-card border-2 border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <button
                        onClick={() => onViewProfile(commentUser.id)}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {commentUser.full_name}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                        {isOwner && !isEditing && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() => handleStartEdit(comment)}
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Edit2 size={12} />
                            </Button>
                            <Button
                              onClick={() => onDeleteComment(comment.id)}
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="border-2 border-border focus:border-primary focus:ring-0 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveEdit(comment.id)}
                            size="sm"
                            className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-2 border-border"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{comment.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

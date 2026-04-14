import { useState } from 'react';
import { Heart, MessageCircle, Trash2, Edit2, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CommentList } from './CommentList';
import type { User, Post, Comment, Like } from '../types';

interface PostCardProps {
  post: Post;
  user: User;
  currentUser: User;
  comments: Comment[];
  likes: Like[];
  users: User[];
  onUpdatePost: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onCreateComment: (postId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLike: (postId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function PostCard({
  post,
  user,
  currentUser,
  comments,
  likes,
  users,
  onUpdatePost,
  onDeletePost,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onToggleLike,
  onViewProfile,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);

  const isLiked = likes.some(l => l.user_id === currentUser.id);
  const isOwner = post.user_id === currentUser.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onUpdatePost(post.id, editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  return (
    <article className="bg-card border-4 border-border shadow-[6px_6px_0px_0px_rgba(43,37,32,1)] overflow-hidden animate-[slideUp_0.3s_ease-out] hover:shadow-[8px_8px_0px_0px_rgba(43,37,32,1)] transition-shadow">
      {/* Post Header */}
      <div className="p-6 border-b-2 border-border bg-accent/30">
        <div className="flex items-start justify-between">
          <button
            onClick={() => onViewProfile(user.id)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.full_name}
                className="w-12 h-12 object-cover border-2 border-border"
              />
            ) : (
              <div className="w-12 h-12 bg-muted border-2 border-border flex items-center justify-center">
                <UserIcon size={20} />
              </div>
            )}
            <div className="text-left">
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">@{user.username} · {formatDate(post.created_at)}</p>
            </div>
          </button>

          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="icon"
                className="h-8 w-8 border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Edit2 size={14} />
              </Button>
              <Button
                onClick={() => onDeletePost(post.id)}
                variant="outline"
                size="icon"
                className="h-8 w-8 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="border-2 border-border focus:border-primary focus:ring-0 resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
                className="border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap mb-4">{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post content"
                className="w-full border-2 border-border mt-4"
              />
            )}
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 pb-4 flex items-center gap-4 border-t-2 border-border pt-4">
        <button
          onClick={() => onToggleLike(post.id)}
          className={`flex items-center gap-2 group transition-colors ${
            isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <Heart
            size={20}
            className={`transition-all ${isLiked ? 'fill-primary' : 'group-hover:scale-110'}`}
          />
          <span className="text-sm font-medium">{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t-2 border-border bg-accent/20 animate-[slideDown_0.2s_ease-out]">
          <CommentList
            postId={post.id}
            comments={comments}
            users={users}
            currentUser={currentUser}
            onCreateComment={onCreateComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            onViewProfile={onViewProfile}
          />
        </div>
      )}

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
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </article>
  );
}

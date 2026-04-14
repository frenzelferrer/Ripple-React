import { useState } from 'react';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';
import { Search, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { User, Post, Comment, Like } from '../types';

interface NewsfeedProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  onCreatePost: (content: string, image?: string) => void;
  onUpdatePost: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onCreateComment: (postId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLike: (postId: string) => void;
  onViewProfile: (userId: string) => void;
  onLogout: () => void;
}

export function Newsfeed({
  currentUser,
  users,
  posts,
  comments,
  likes,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onToggleLike,
  onViewProfile,
  onLogout,
}: NewsfeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const user = users.find(u => u.id === post.user_id);
    return (
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return [];
    return (
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b-4 border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl" style={{ fontWeight: 800, fontVariationSettings: '"opsz" 144' }}>
                Pulse
              </h1>
              <div className="h-8 w-1 bg-border" />
              <button
                onClick={() => onViewProfile(currentUser.id)}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                {currentUser.profile_image ? (
                  <img
                    src={currentUser.profile_image}
                    alt={currentUser.full_name}
                    className="w-8 h-8 object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted border-2 border-border flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                )}
                <span className="text-sm font-medium">{currentUser.full_name}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSearch(!showSearch)}
                variant="outline"
                size="icon"
                className="border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Search size={18} />
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                size="icon"
                className="border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4 animate-[slideDown_0.2s_ease-out]">
              <Input
                type="text"
                placeholder="Search posts or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-border focus:border-primary focus:ring-0"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Create Post */}
        <div className="mb-8">
          <CreatePost onCreatePost={onCreatePost} currentUser={currentUser} />
        </div>

        {/* Search Results - Users */}
        {searchQuery && filteredUsers.length > 0 && (
          <div className="mb-6 bg-card border-4 border-border p-4 shadow-[4px_4px_0px_0px_rgba(43,37,32,1)]">
            <h3 className="mb-3" style={{ fontWeight: 600 }}>Users</h3>
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    onViewProfile(user.id);
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent border-2 border-transparent hover:border-border transition-all"
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
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-card border-4 border-border p-12 text-center shadow-[4px_4px_0px_0px_rgba(43,37,32,1)]">
              <p className="text-muted-foreground">
                {searchQuery ? 'No posts found matching your search' : 'No posts yet. Be the first to share!'}
              </p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                user={users.find(u => u.id === post.user_id)!}
                currentUser={currentUser}
                comments={comments.filter(c => c.post_id === post.id)}
                likes={likes.filter(l => l.post_id === post.id)}
                users={users}
                onUpdatePost={onUpdatePost}
                onDeletePost={onDeletePost}
                onCreateComment={onCreateComment}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
                onToggleLike={onToggleLike}
                onViewProfile={onViewProfile}
              />
            ))
          )}
        </div>
      </main>

      <style>{`
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

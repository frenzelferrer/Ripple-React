import { useState } from 'react';
import { ArrowLeft, Edit2, User as UserIcon, Heart, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { PostCard } from './PostCard';
import type { User, Post, Comment, Like } from '../types';

interface ProfileProps {
  currentUser: User;
  viewingUser: User;
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  users: User[];
  onUpdateProfile: (userData: Partial<User>) => void;
  onDeletePost: (postId: string) => void;
  onUpdatePost: (postId: string, content: string) => void;
  onViewProfile: (userId: string) => void;
  onBackToFeed: () => void;
}

export function Profile({
  currentUser,
  viewingUser,
  posts,
  comments,
  likes,
  users,
  onUpdateProfile,
  onDeletePost,
  onUpdatePost,
  onViewProfile,
  onBackToFeed,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: viewingUser.full_name,
    bio: viewingUser.bio,
    profile_image: viewingUser.profile_image || '',
  });

  const isOwnProfile = currentUser.id === viewingUser.id;
  const userLikes = likes.filter(l => posts.some(p => p.id === l.post_id));

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: viewingUser.full_name,
      bio: viewingUser.bio,
      profile_image: viewingUser.profile_image || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b-4 border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBackToFeed}
              variant="outline"
              size="icon"
              className="border-2 border-border shadow-[2px_2px_0px_0px_rgba(43,37,32,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h2 className="font-medium">{viewingUser.full_name}</h2>
              <p className="text-sm text-muted-foreground">{posts.length} posts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-card border-4 border-border shadow-[8px_8px_0px_0px_rgba(43,37,32,1)] mb-8 overflow-hidden animate-[slideUp_0.4s_ease-out]">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-br from-primary via-accent to-secondary" />

          <div className="p-6">
            {/* Avatar */}
            <div className="-mt-20 mb-4">
              {viewingUser.profile_image ? (
                <img
                  src={viewingUser.profile_image}
                  alt={viewingUser.full_name}
                  className="w-32 h-32 object-cover border-4 border-card"
                />
              ) : (
                <div className="w-32 h-32 bg-muted border-4 border-card flex items-center justify-center">
                  <UserIcon size={48} />
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Full Name</label>
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="border-2 border-border focus:border-primary focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="border-2 border-border focus:border-primary focus:ring-0 resize-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Profile Image URL</label>
                  <Input
                    type="text"
                    value={formData.profile_image}
                    onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                    className="border-2 border-border focus:border-primary focus:ring-0"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-border shadow-[3px_3px_0px_0px_rgba(43,37,32,1)] hover:shadow-[1px_1px_0px_0px_rgba(43,37,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(43,37,32,1)] hover:shadow-[1px_1px_0px_0px_rgba(43,37,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl mb-1" style={{ fontWeight: 800, fontVariationSettings: '"opsz" 144' }}>
                      {viewingUser.full_name}
                    </h1>
                    <p className="text-muted-foreground">@{viewingUser.username}</p>
                  </div>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(43,37,32,1)] hover:shadow-[1px_1px_0px_0px_rgba(43,37,32,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                <p className="mb-4 whitespace-pre-wrap">{viewingUser.bio}</p>

                <p className="text-sm text-muted-foreground mb-6">
                  Joined {formatDate(viewingUser.created_at)}
                </p>

                {/* Stats */}
                <div className="flex gap-6 pt-4 border-t-2 border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-accent border-2 border-border flex items-center justify-center">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{posts.length}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-accent border-2 border-border flex items-center justify-center">
                      <Heart size={18} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{userLikes.length}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-card border-4 border-border p-12 text-center shadow-[4px_4px_0px_0px_rgba(43,37,32,1)]">
              <p className="text-muted-foreground">
                {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                user={viewingUser}
                currentUser={currentUser}
                comments={comments.filter(c => c.post_id === post.id)}
                likes={likes.filter(l => l.post_id === post.id)}
                users={users}
                onUpdatePost={onUpdatePost}
                onDeletePost={onDeletePost}
                onCreateComment={() => {}}
                onUpdateComment={() => {}}
                onDeleteComment={() => {}}
                onToggleLike={() => {}}
                onViewProfile={onViewProfile}
              />
            ))
          )}
        </div>
      </main>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

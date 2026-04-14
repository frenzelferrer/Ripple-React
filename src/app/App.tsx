import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Bookmark,
  Check,
  ChevronLeft,
  Compass,
  Heart,
  Home,
  Image as ImageIcon,
  LogOut,
  MessageCircle,
  MoonStar,
  Search,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  SunMedium,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { initialState } from './data/mockData';
import type {
  AppState,
  Comment,
  Conversation,
  DensityMode,
  FeedFilter,
  FriendRequest,
  Message,
  Notification,
  Post,
  PostVisibility,
  ThemeMode,
  User,
  UserSettings,
  ViewKey,
} from './types';

const STORAGE_KEY = 'ripple_react_v1';
const quickReplies = ['On it', 'Looks good', 'Let me check', 'Can we ship this?', 'Nice direction'];

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortByNewest<T extends { created_at?: string; updated_at?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
    const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
    return bDate - aDate;
  });
}

function clampText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function safeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function timeAgo(value: string) {
  const date = new Date(value).getTime();
  const diff = Date.now() - date;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function loadState(): AppState {
  if (typeof window === 'undefined') return initialState;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;
  try {
    return { ...initialState, ...JSON.parse(raw) } as AppState;
  } catch {
    return initialState;
  }
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSettings(state: AppState, userId: string | null) {
  return state.settings.find((item) => item.user_id === userId) || null;
}

function resolveTheme(mode: ThemeMode) {
  if (mode === 'dark' || mode === 'light') return mode;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = resolveTheme(mode);
}

function getFriendship(usersRequests: FriendRequest[], a: string, b: string) {
  return usersRequests.find(
    (request) =>
      (request.from_user_id === a && request.to_user_id === b) ||
      (request.from_user_id === b && request.to_user_id === a),
  );
}

function areFriends(requests: FriendRequest[], a: string, b: string) {
  return requests.some(
    (request) =>
      request.status === 'accepted' &&
      ((request.from_user_id === a && request.to_user_id === b) ||
        (request.from_user_id === b && request.to_user_id === a)),
  );
}

function canViewPost(post: Post, currentUser: User, requests: FriendRequest[]) {
  if (post.user_id === currentUser.id) return true;
  if (post.visibility === 'public') return true;
  return areFriends(requests, post.user_id, currentUser.id);
}

function getUserById(users: User[], userId?: string | null) {
  return users.find((user) => user.id === userId) || null;
}

function getConversationWithUser(conversations: Conversation[], meId: string, otherId: string) {
  return conversations.find(
    (conversation) =>
      conversation.participant_ids.length === 2 &&
      conversation.participant_ids.includes(meId) &&
      conversation.participant_ids.includes(otherId),
  );
}

function getOtherParticipantId(conversation: Conversation, meId: string) {
  return conversation.participant_ids.find((idValue) => idValue !== meId) || meId;
}

function AuthScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (username: string, password: string) => boolean;
  onRegister: (userData: Pick<User, 'username' | 'password' | 'full_name' | 'bio' | 'profile_image' | 'location'>) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    full_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profile_image: '',
    location: '',
  });
  const [error, setError] = useState('');

  return (
    <div className="ripple-shell flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="ripple-panel relative overflow-hidden p-8 md:p-12">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-cyan-400/25 via-violet-400/20 to-pink-400/20 blur-3xl" />
          <div className="relative z-10 max-w-xl space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-foreground/80">
              <Sparkles className="size-4 text-cyan-300" />
              React/Vite rebuild of Ripple with Nexo-inspired UX behaviors
            </div>
            <div>
              <h1 className="text-5xl font-semibold md:text-6xl">Ripple</h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
                A polished social workspace with saved posts, friendships, notifications, smart feed controls, and Messenger-style chat.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                'Theme persistence with auto, light, and dark modes',
                'Saved posts, privacy controls, and smarter feed filters',
                'Friend requests, notifications, and online presence',
                'Chat replies, quick responses, and shared media support',
              ].map((feature) => (
                <div key={feature} className="ripple-panel-soft p-4 text-sm text-muted-foreground">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ripple-panel p-8 md:p-10">
          <div className="mb-6 flex items-center gap-2 rounded-full bg-white/8 p-1 text-sm">
            <button
              className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-white/12 text-foreground' : 'text-muted-foreground'}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-white/12 text-foreground' : 'text-muted-foreground'}`}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Create account
            </button>
          </div>

          {mode === 'login' ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                if (!loginData.username || !loginData.password) {
                  setError('Enter both your username and password.');
                  return;
                }
                const success = onLogin(clampText(loginData.username), loginData.password);
                if (!success) setError('Those credentials do not match this local Ripple demo.');
              }}
            >
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Username</label>
                <input
                  className="ripple-input"
                  value={loginData.username}
                  onChange={(event) => setLoginData((current) => ({ ...current, username: event.target.value }))}
                  placeholder="demo"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Password</label>
                <input
                  className="ripple-input"
                  type="password"
                  value={loginData.password}
                  onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                  placeholder="demo"
                />
              </div>
              {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
              <button type="submit" className="ripple-button w-full justify-center">Enter Ripple</button>
              <div className="ripple-panel-soft p-4 text-sm text-muted-foreground">
                Demo account: <span className="font-medium text-foreground">demo / demo</span>
              </div>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                if (!registerData.full_name || !registerData.username || !registerData.password) {
                  setError('Full name, username, and password are required.');
                  return;
                }
                if (registerData.password !== registerData.confirmPassword) {
                  setError('Passwords need to match.');
                  return;
                }
                onRegister({
                  full_name: clampText(registerData.full_name),
                  username: clampText(registerData.username),
                  password: registerData.password,
                  bio: clampText(registerData.bio),
                  profile_image: safeUrl(registerData.profile_image),
                  location: clampText(registerData.location),
                });
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Full name</label>
                  <input className="ripple-input" value={registerData.full_name} onChange={(event) => setRegisterData((current) => ({ ...current, full_name: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Username</label>
                  <input className="ripple-input" value={registerData.username} onChange={(event) => setRegisterData((current) => ({ ...current, username: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Password</label>
                  <input type="password" className="ripple-input" value={registerData.password} onChange={(event) => setRegisterData((current) => ({ ...current, password: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Confirm password</label>
                  <input type="password" className="ripple-input" value={registerData.confirmPassword} onChange={(event) => setRegisterData((current) => ({ ...current, confirmPassword: event.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Bio</label>
                <textarea className="ripple-input min-h-24 resize-none" value={registerData.bio} onChange={(event) => setRegisterData((current) => ({ ...current, bio: event.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Profile image URL</label>
                  <input className="ripple-input" value={registerData.profile_image} onChange={(event) => setRegisterData((current) => ({ ...current, profile_image: event.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Location</label>
                  <input className="ripple-input" value={registerData.location} onChange={(event) => setRegisterData((current) => ({ ...current, location: event.target.value }))} placeholder="Manila" />
                </div>
              </div>
              {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
              <button type="submit" className="ripple-button w-full justify-center">Create Ripple account</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function AvatarImage({ user, size = 44 }: { user: User; size?: number }) {
  return user.profile_image ? (
    <img
      src={user.profile_image}
      alt={user.full_name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover ring-1 ring-white/10"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-semibold text-white"
    >
      {user.full_name.slice(0, 1)}
    </div>
  );
}

function PresencePill({ presence, lastSeen }: { presence: User['presence']; lastSeen: string }) {
  const color = presence === 'online' ? 'bg-emerald-400' : presence === 'away' ? 'bg-amber-400' : 'bg-slate-400';
  const label = presence === 'online' ? 'Online' : presence === 'away' ? 'Away' : `Last seen ${timeAgo(lastSeen)}`;
  return (
    <span className="ripple-chip">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function ViewButton({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: JSX.Element;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
        active ? 'bg-white/14 text-foreground' : 'text-muted-foreground hover:bg-white/8 hover:text-foreground'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {typeof count === 'number' ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{count}</span> : null}
    </button>
  );
}

function Composer({
  draft,
  onChangeDraft,
  onSubmit,
}: {
  draft: string;
  onChangeDraft: (value: string) => void;
  onSubmit: (payload: { content: string; image: string; visibility: PostVisibility }) => void;
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');

  return (
    <section className="ripple-panel p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Share an update</h2>
          <p className="text-sm text-muted-foreground">Draft autosaves instantly while you type.</p>
        </div>
        <span className="ripple-chip">
          <Sparkles className="size-3.5 text-cyan-300" /> Draft saved
        </span>
      </div>
      <textarea
        value={draft}
        onChange={(event) => onChangeDraft(event.target.value)}
        className="ripple-input min-h-32 resize-none"
        placeholder="What’s moving through Ripple today?"
      />
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="ripple-input pl-10"
            placeholder="Optional image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </div>
        <select className="ripple-input min-w-36" value={visibility} onChange={(event) => setVisibility(event.target.value as PostVisibility)}>
          <option value="public">Public</option>
          <option value="friends">Friends only</option>
        </select>
        <button
          className="ripple-button justify-center"
          onClick={() => {
            onSubmit({ content: draft, image: imageUrl, visibility });
            setImageUrl('');
            setVisibility('public');
          }}
          type="button"
        >
          <Send className="size-4" /> Post
        </button>
      </div>
    </section>
  );
}

function PostCard({
  post,
  author,
  currentUser,
  users,
  comments,
  likesCount,
  isLiked,
  isSaved,
  isCompact,
  canMessageAuthor,
  onToggleLike,
  onToggleSave,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onUpdatePost,
  onDeletePost,
  onViewProfile,
  onMessageUser,
}: {
  post: Post;
  author: User;
  currentUser: User;
  users: User[];
  comments: Comment[];
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isCompact: boolean;
  canMessageAuthor: boolean;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onCreateComment: (postId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpdatePost: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onViewProfile: (userId: string) => void;
  onMessageUser: (userId: string) => void;
}) {
  const [commentDraft, setCommentDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState(post.content);

  return (
    <article className="ripple-panel p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button className="flex items-center gap-3 text-left" onClick={() => onViewProfile(author.id)}>
          <AvatarImage user={author} size={48} />
          <div>
            <div className="font-medium">{author.full_name}</div>
            <div className="text-sm text-muted-foreground">
              @{author.username} • {timeAgo(post.created_at)}
            </div>
          </div>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="ripple-chip">{post.visibility === 'friends' ? 'Friends only' : 'Public'}</span>
          {author.id === currentUser.id ? (
            <>
              <button className="ripple-button-secondary" onClick={() => { setEditingPost(true); setPostDraft(post.content); }}>Edit</button>
              <button className="ripple-button-secondary text-rose-200" onClick={() => onDeletePost(post.id)}>Delete</button>
            </>
          ) : null}
          {author.id !== currentUser.id && canMessageAuthor ? (
            <button className="ripple-button-secondary" onClick={() => onMessageUser(author.id)}>
              <MessageCircle className="size-4" /> Message
            </button>
          ) : null}
        </div>
      </div>

      <div className={isCompact ? 'mt-4 space-y-3' : 'mt-4 space-y-4'}>
        {editingPost ? (
          <div className="space-y-3">
            <textarea className="ripple-input min-h-28 resize-none" value={postDraft} onChange={(event) => setPostDraft(event.target.value)} />
            <div className="flex gap-2">
              <button className="ripple-button-secondary" onClick={() => { const next = clampText(postDraft); if (next) { onUpdatePost(post.id, next); setEditingPost(false); } }}>
                <Check className="size-4" /> Save
              </button>
              <button className="ripple-button-secondary" onClick={() => { setEditingPost(false); setPostDraft(post.content); }}>
                <X className="size-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/95">{post.content}</p>
        )}
        {post.image ? <img src={post.image} alt="Post" className="max-h-[420px] w-full rounded-3xl object-cover" /> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{likesCount} likes</span>
        <span>•</span>
        <span>{comments.length} comments</span>
        {post.updated_at ? (
          <>
            <span>•</span>
            <span>Edited {timeAgo(post.updated_at)}</span>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className={`ripple-button-secondary ${isLiked ? '!border-pink-400/50 !text-pink-200' : ''}`} onClick={() => onToggleLike(post.id)}>
          <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} /> {isLiked ? 'Liked' : 'Like'}
        </button>
        <button className={`ripple-button-secondary ${isSaved ? '!border-cyan-400/50 !text-cyan-100' : ''}`} onClick={() => onToggleSave(post.id)}>
          <Bookmark className={`size-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {comments.map((comment) => {
          const commentAuthor = getUserById(users, comment.user_id);
          if (!commentAuthor) return null;
          const isMine = comment.user_id === currentUser.id;
          return (
            <div key={comment.id} className="ripple-panel-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AvatarImage user={commentAuthor} size={34} />
                  <div>
                    <div className="text-sm font-medium">{commentAuthor.full_name}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</div>
                  </div>
                </div>
                {isMine ? (
                  <div className="flex gap-2 text-xs">
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingText(comment.content);
                      }}
                    >
                      Edit
                    </button>
                    <button className="text-rose-300 hover:text-rose-200" onClick={() => onDeleteComment(comment.id)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
              {editingCommentId === comment.id ? (
                <div className="mt-3 space-y-2">
                  <textarea className="ripple-input min-h-24 resize-none" value={editingText} onChange={(event) => setEditingText(event.target.value)} />
                  <div className="flex gap-2">
                    <button
                      className="ripple-button-secondary"
                      onClick={() => {
                        const nextValue = clampText(editingText);
                        if (nextValue) onUpdateComment(comment.id, nextValue);
                        setEditingCommentId(null);
                        setEditingText('');
                      }}
                    >
                      <Check className="size-4" /> Save
                    </button>
                    <button className="ripple-button-secondary" onClick={() => setEditingCommentId(null)}>
                      <X className="size-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-foreground/90">{comment.content}</p>
              )}
            </div>
          );
        })}

        <div className="flex gap-3">
          <textarea
            className="ripple-input min-h-24 resize-none"
            placeholder="Write a comment..."
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
          />
          <button
            className="ripple-button h-fit"
            onClick={() => {
              const next = clampText(commentDraft);
              if (!next) return;
              onCreateComment(post.id, next);
              setCommentDraft('');
            }}
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function FriendsView({
  currentUser,
  users,
  requests,
  onViewProfile,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onRemoveFriend,
  onMessageUser,
}: {
  currentUser: User;
  users: User[];
  requests: FriendRequest[];
  onViewProfile: (userId: string) => void;
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
  onRemoveFriend: (userId: string) => void;
  onMessageUser: (userId: string) => void;
}) {
  const incoming = requests.filter((request) => request.to_user_id === currentUser.id && request.status === 'pending');
  const accepted = users.filter((user) => user.id !== currentUser.id && areFriends(requests, currentUser.id, user.id));
  const suggestions = users.filter((user) => user.id !== currentUser.id && !getFriendship(requests, currentUser.id, user.id));

  return (
    <div className="space-y-6">
      <section className="ripple-panel p-5 md:p-6">
        <h2 className="text-xl font-semibold">Friend requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">Accept requests to unlock friends-only posts and chat.</p>
        <div className="mt-4 space-y-3">
          {incoming.length ? incoming.map((request) => {
            const sender = getUserById(users, request.from_user_id);
            if (!sender) return null;
            return (
              <div key={request.id} className="ripple-panel-soft flex flex-wrap items-center justify-between gap-3 p-4">
                <button className="flex items-center gap-3 text-left" onClick={() => onViewProfile(sender.id)}>
                  <AvatarImage user={sender} />
                  <div>
                    <div className="font-medium">{sender.full_name}</div>
                    <div className="text-sm text-muted-foreground">@{sender.username}</div>
                  </div>
                </button>
                <div className="flex gap-2">
                  <button className="ripple-button-secondary" onClick={() => onDeclineRequest(request.id)}>Decline</button>
                  <button className="ripple-button" onClick={() => onAcceptRequest(request.id)}>Accept</button>
                </div>
              </div>
            );
          }) : <div className="ripple-panel-soft p-4 text-sm text-muted-foreground">No pending requests right now.</div>}
        </div>
      </section>

      <section className="ripple-panel p-5 md:p-6">
        <h2 className="text-xl font-semibold">Your friends</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {accepted.map((user) => (
            <div key={user.id} className="ripple-panel-soft space-y-3 p-4">
              <button className="flex items-center gap-3 text-left" onClick={() => onViewProfile(user.id)}>
                <AvatarImage user={user} />
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">{user.location || 'Ripple network'}</div>
                </div>
              </button>
              <PresencePill presence={user.presence} lastSeen={user.last_seen} />
              <div className="flex gap-2">
                <button className="ripple-button-secondary flex-1" onClick={() => onMessageUser(user.id)}>Message</button>
                <button className="ripple-button-secondary flex-1" onClick={() => onRemoveFriend(user.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ripple-panel p-5 md:p-6">
        <h2 className="text-xl font-semibold">People you may know</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((user) => (
            <div key={user.id} className="ripple-panel-soft space-y-3 p-4">
              <button className="flex items-center gap-3 text-left" onClick={() => onViewProfile(user.id)}>
                <AvatarImage user={user} />
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                </div>
              </button>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
              <button className="ripple-button w-full justify-center" onClick={() => onSendRequest(user.id)}>
                <UserRoundPlus className="size-4" /> Add friend
              </button>
            </div>
          ))}
          {!suggestions.length ? <div className="ripple-panel-soft p-4 text-sm text-muted-foreground">No new suggestions yet.</div> : null}
        </div>
      </section>
    </div>
  );
}

function NotificationsView({ notifications, users, onMarkAllRead }: { notifications: Notification[]; users: User[]; onMarkAllRead: () => void }) {
  return (
    <section className="ripple-panel p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Friend requests, reactions, comments, and message nudges.</p>
        </div>
        <button className="ripple-button-secondary" onClick={onMarkAllRead}>Mark all read</button>
      </div>
      <div className="mt-5 space-y-3">
        {notifications.length ? sortByNewest(notifications).map((notification) => {
          const actor = getUserById(users, notification.actor_user_id);
          return (
            <div key={notification.id} className={`ripple-panel-soft flex items-start gap-3 p-4 ${notification.is_read ? 'opacity-80' : 'ring-1 ring-cyan-300/20'}`}>
              {actor ? <AvatarImage user={actor} size={38} /> : <div className="size-10 rounded-full bg-white/10" />}
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-6 text-foreground/95">{notification.message}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.created_at)}</div>
              </div>
              {!notification.is_read ? <span className="mt-2 size-2 rounded-full bg-cyan-300" /> : null}
            </div>
          );
        }) : <div className="ripple-panel-soft p-4 text-sm text-muted-foreground">Nothing new yet.</div>}
      </div>
    </section>
  );
}

function MessagesView({
  currentUser,
  users,
  conversations,
  messages,
  settings,
  activeConversationId,
  onSelectConversation,
  onStartConversation,
  onSendMessage,
}: {
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  messages: Message[];
  settings: UserSettings;
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartConversation: (userId: string) => void;
  onSendMessage: (payload: { conversationId: string; content: string; replyTo?: string; mediaUrl?: string }) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [draft, setDraft] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState<string | undefined>();
  const [mediaUrl, setMediaUrl] = useState('');

  const filteredConversations = [...conversations]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .filter((conversation) => {
      const otherUser = getUserById(users, getOtherParticipantId(conversation, currentUser.id));
      if (!searchTerm.trim()) return true;
      const lastMessage = [...messages].reverse().find((message) => message.conversation_id === conversation.id);
      const haystack = `${otherUser?.full_name || ''} ${otherUser?.username || ''} ${lastMessage?.content || ''}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });

  const selectedConversation = conversations.find((conversation) => conversation.id === activeConversationId) || filteredConversations[0] || null;
  const selectedMessages = selectedConversation
    ? messages.filter((message) => message.conversation_id === selectedConversation.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];
  const otherParticipant = selectedConversation ? getUserById(users, getOtherParticipantId(selectedConversation, currentUser.id)) : null;
  const replyToMessage = selectedMessages.find((message) => message.id === replyToMessageId);

  useEffect(() => {
    if (!activeConversationId && filteredConversations[0]) {
      onSelectConversation(filteredConversations[0].id);
    }
  }, [activeConversationId, filteredConversations, onSelectConversation]);

  return (
    <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="ripple-panel p-5 md:p-6">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className="ripple-input pl-10" placeholder="Search conversations" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>
        <div className="space-y-3">
          {filteredConversations.map((conversation) => {
            const other = getUserById(users, getOtherParticipantId(conversation, currentUser.id));
            const lastMessage = [...messages].reverse().find((message) => message.conversation_id === conversation.id);
            if (!other) return null;
            return (
              <button
                key={conversation.id}
                className={`w-full rounded-3xl p-4 text-left transition ${selectedConversation?.id === conversation.id ? 'bg-white/14' : 'hover:bg-white/8'}`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  <AvatarImage user={other} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{other.full_name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(conversation.updated_at)}</span>
                    </div>
                    <div className="truncate text-sm text-muted-foreground">{lastMessage?.content || 'Conversation ready'}</div>
                  </div>
                </div>
              </button>
            );
          })}
          {!filteredConversations.length ? <div className="ripple-panel-soft p-4 text-sm text-muted-foreground">No conversations match that search.</div> : null}
        </div>
      </div>

      <div className="ripple-panel flex min-h-[680px] flex-col p-5 md:p-6">
        {selectedConversation && otherParticipant ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div className="flex items-center gap-3">
                <AvatarImage user={otherParticipant} size={48} />
                <div>
                  <div className="font-medium">{otherParticipant.full_name}</div>
                  <div className="text-sm text-muted-foreground">@{otherParticipant.username}</div>
                </div>
              </div>
              <PresencePill presence={otherParticipant.presence} lastSeen={otherParticipant.last_seen} />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-5">
              {selectedMessages.map((message) => {
                const mine = message.sender_id === currentUser.id;
                const reply = selectedMessages.find((item) => item.id === message.reply_to_message_id);
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-3xl px-4 py-3 ${mine ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white' : 'ripple-panel-soft'}`}>
                      {reply ? <div className={`mb-2 rounded-2xl px-3 py-2 text-xs ${mine ? 'bg-white/16 text-white/85' : 'bg-white/8 text-muted-foreground'}`}>Replying to: {reply.content}</div> : null}
                      <div className="whitespace-pre-wrap text-sm leading-6">{message.content}</div>
                      {message.media_url ? <img src={message.media_url} alt="Shared media" className="mt-3 max-h-52 w-full rounded-2xl object-cover" /> : null}
                      <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${mine ? 'text-white/80' : 'text-muted-foreground'}`}>
                        <span>{formatDateTime(message.created_at)}</span>
                        <button className="hover:text-foreground" onClick={() => setReplyToMessageId(message.id)}>Reply</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {replyToMessage ? (
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-muted-foreground">
                <span>Replying to: {replyToMessage.content}</span>
                <button onClick={() => setReplyToMessageId(undefined)}><X className="size-4" /></button>
              </div>
            ) : null}

            {settings.quick_replies_enabled ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button key={reply} className="ripple-chip" onClick={() => setDraft(reply)}>{reply}</button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <textarea className="ripple-input min-h-28 resize-none" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message" />
              <div className="space-y-3">
                <input className="ripple-input" placeholder="Optional media URL" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} />
                <button
                  className="ripple-button w-full justify-center"
                  onClick={() => {
                    if (!selectedConversation) return;
                    onSendMessage({
                      conversationId: selectedConversation.id,
                      content: draft,
                      replyTo: replyToMessageId,
                      mediaUrl,
                    });
                    setDraft('');
                    setReplyToMessageId(undefined);
                    setMediaUrl('');
                  }}
                >
                  <Send className="size-4" /> Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <MessageCircle className="size-12 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">No conversation selected</h2>
              <p className="mt-2 text-sm text-muted-foreground">Open an existing thread or start one from a friend’s profile.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {users.filter((user) => user.id !== currentUser.id).slice(0, 3).map((user) => (
                <button key={user.id} className="ripple-button-secondary" onClick={() => onStartConversation(user.id)}>{user.full_name}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SearchView({
  currentUser,
  users,
  requests,
  query,
  onChangeQuery,
  onViewProfile,
  onSendRequest,
  onStartConversation,
}: {
  currentUser: User;
  users: User[];
  requests: FriendRequest[];
  query: string;
  onChangeQuery: (value: string) => void;
  onViewProfile: (userId: string) => void;
  onSendRequest: (userId: string) => void;
  onStartConversation: (userId: string) => void;
}) {
  const results = users.filter((user) => {
    if (user.id === currentUser.id) return false;
    const haystack = `${user.full_name} ${user.username} ${user.bio} ${user.location || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section className="space-y-5">
      <div className="ripple-panel p-5 md:p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className="ripple-input pl-10" value={query} onChange={(event) => onChangeQuery(event.target.value)} placeholder="Search people, bios, or locations" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((user) => {
          const friendship = getFriendship(requests, currentUser.id, user.id);
          const friends = areFriends(requests, currentUser.id, user.id);
          return (
            <div key={user.id} className="ripple-panel p-5">
              <button className="flex items-center gap-3 text-left" onClick={() => onViewProfile(user.id)}>
                <AvatarImage user={user} size={52} />
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                </div>
              </button>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{user.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PresencePill presence={user.presence} lastSeen={user.last_seen} />
                {user.location ? <span className="ripple-chip">{user.location}</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {friends ? (
                  <button className="ripple-button-secondary" onClick={() => onStartConversation(user.id)}>Message</button>
                ) : friendship?.status === 'pending' ? (
                  <span className="ripple-chip">Request pending</span>
                ) : (
                  <button className="ripple-button" onClick={() => onSendRequest(user.id)}>Add friend</button>
                )}
                <button className="ripple-button-secondary" onClick={() => onViewProfile(user.id)}>View profile</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SettingsView({
  settings,
  onUpdate,
}: {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="ripple-panel p-5 md:p-6">
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">Theme persistence mirrors the Ripple backend behavior.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">Theme mode</label>
            <select className="ripple-input" value={settings.theme_mode} onChange={(event) => onUpdate({ theme_mode: event.target.value as ThemeMode })}>
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">Feed density</label>
            <select className="ripple-input" value={settings.density_mode} onChange={(event) => onUpdate({ density_mode: event.target.value as DensityMode })}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>
      </div>
      <div className="ripple-panel p-5 md:p-6">
        <h2 className="text-xl font-semibold">Feed & chat preferences</h2>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">Default feed filter</label>
            <select className="ripple-input" value={settings.feed_filter} onChange={(event) => onUpdate({ feed_filter: event.target.value as FeedFilter })}>
              <option value="all">All posts</option>
              <option value="friends">Friends only</option>
              <option value="photos">Photos</option>
              <option value="saved">Saved</option>
              <option value="mine">My posts</option>
            </select>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm">
            <span>
              <span className="block font-medium text-foreground">Quick replies in chat</span>
              <span className="text-muted-foreground">Show one-tap reply chips above the composer.</span>
            </span>
            <input type="checkbox" checked={settings.quick_replies_enabled} onChange={(event) => onUpdate({ quick_replies_enabled: event.target.checked })} />
          </label>
        </div>
      </div>
    </section>
  );
}

function ProfileView({
  currentUser,
  viewingUser,
  posts,
  users,
  comments,
  likes,
  savedPostIds,
  requests,
  onViewProfile,
  onToggleLike,
  onToggleSave,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onUpdatePost,
  onDeletePost,
  onStartConversation,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onRemoveFriend,
}: {
  currentUser: User;
  viewingUser: User;
  posts: Post[];
  users: User[];
  comments: Comment[];
  likes: AppState['likes'];
  savedPostIds: Set<string>;
  requests: FriendRequest[];
  onViewProfile: (userId: string) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onCreateComment: (postId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpdatePost: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onStartConversation: (userId: string) => void;
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
  onRemoveFriend: (userId: string) => void;
}) {
  const friendship = getFriendship(requests, currentUser.id, viewingUser.id);
  const friends = areFriends(requests, currentUser.id, viewingUser.id);
  const canMessage = currentUser.id !== viewingUser.id && friends;
  const visiblePosts = sortByNewest(posts.filter((post) => canViewPost(post, currentUser, requests)));

  return (
    <div className="space-y-6">
      <section className="ripple-panel overflow-hidden">
        {viewingUser.cover_image ? <img src={viewingUser.cover_image} alt="Cover" className="h-48 w-full object-cover md:h-64" /> : <div className="h-48 bg-gradient-to-r from-cyan-400/30 to-violet-500/30 md:h-64" />}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="-mt-16 rounded-full border-4 border-background">
                <AvatarImage user={viewingUser} size={108} />
              </div>
              <div>
                <h2 className="text-3xl font-semibold">{viewingUser.full_name}</h2>
                <div className="mt-1 text-sm text-muted-foreground">@{viewingUser.username} • {viewingUser.location || 'Ripple member'}</div>
              </div>
            </div>
            {currentUser.id !== viewingUser.id ? (
              <div className="flex flex-wrap gap-2">
                {friends ? (
                  <>
                    <button className="ripple-button" onClick={() => onStartConversation(viewingUser.id)}>Message</button>
                    <button className="ripple-button-secondary" onClick={() => onRemoveFriend(viewingUser.id)}>Remove friend</button>
                  </>
                ) : friendship?.status === 'pending' ? (
                  friendship.to_user_id === currentUser.id ? (
                    <>
                      <button className="ripple-button" onClick={() => onAcceptRequest(friendship.id)}>Accept request</button>
                      <button className="ripple-button-secondary" onClick={() => onDeclineRequest(friendship.id)}>Decline</button>
                    </>
                  ) : (
                    <button className="ripple-button-secondary" onClick={() => onCancelRequest(friendship.id)}>Cancel request</button>
                  )
                ) : (
                  <button className="ripple-button" onClick={() => onSendRequest(viewingUser.id)}>Add friend</button>
                )}
              </div>
            ) : null}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">{viewingUser.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PresencePill presence={viewingUser.presence} lastSeen={viewingUser.last_seen} />
            <span className="ripple-chip">Joined {formatDateTime(viewingUser.created_at)}</span>
            {friends ? <span className="ripple-chip">Friend</span> : null}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={viewingUser}
            currentUser={currentUser}
            users={users}
            comments={comments.filter((comment) => comment.post_id === post.id)}
            likesCount={likes.filter((like) => like.post_id === post.id).length}
            isLiked={likes.some((like) => like.post_id === post.id && like.user_id === currentUser.id)}
            isSaved={savedPostIds.has(post.id)}
            isCompact={false}
            canMessageAuthor={canMessage}
            onToggleLike={onToggleLike}
            onToggleSave={onToggleSave}
            onCreateComment={onCreateComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            onUpdatePost={onUpdatePost}
            onDeletePost={onDeletePost}
            onViewProfile={onViewProfile}
            onMessageUser={onStartConversation}
          />
        ))}
        {!visiblePosts.length ? <div className="ripple-panel p-6 text-sm text-muted-foreground">No visible posts yet.</div> : null}
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeView, setActiveView] = useState<ViewKey>('feed');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedSearch, setFeedSearch] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const currentUser = getUserById(state.users, state.current_user_id);
  const currentSettings = getSettings(state, currentUser?.id || null);
  const selectedProfile = getUserById(state.users, selectedProfileId) || currentUser;
  const savedPostIds = useMemo(() => new Set(state.saved_posts.filter((item) => item.user_id === currentUser?.id).map((item) => item.post_id)), [state.saved_posts, currentUser?.id]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    applyTheme(currentSettings?.theme_mode || 'auto');
  }, [currentSettings?.theme_mode]);

  useEffect(() => {
    let isMounted = true;

    async function testSupabaseConnection() {
      try {
        const { data, error } = await supabase.from('posts').select('*').limit(1);
        if (!isMounted) return;
        console.log('SUPABASE TEST:', { data, error });
      } catch (error) {
        if (!isMounted) return;
        console.error('SUPABASE TEST FAILED:', error);
      }
    }

    testSupabaseConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const interval = window.setInterval(() => {
      setState((previous) => ({
        ...previous,
        users: previous.users.map((user) => user.id === currentUser.id ? { ...user, presence: 'online', last_seen: new Date().toISOString() } : user),
      }));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [currentUser]);

  const friends = useMemo(
    () => state.users.filter((user) => currentUser && user.id !== currentUser.id && areFriends(state.friend_requests, currentUser.id, user.id)),
    [state.users, state.friend_requests, currentUser],
  );
  const unreadNotifications = currentUser ? state.notifications.filter((notification) => notification.user_id === currentUser.id && !notification.is_read).length : 0;

  const visibleFeedPosts = useMemo(() => {
    if (!currentUser || !currentSettings) return [];
    return sortByNewest(
      state.posts.filter((post) => {
        if (!canViewPost(post, currentUser, state.friend_requests)) return false;
        if (currentSettings.feed_filter === 'friends' && !areFriends(state.friend_requests, currentUser.id, post.user_id)) return false;
        if (currentSettings.feed_filter === 'photos' && !post.image) return false;
        if (currentSettings.feed_filter === 'saved' && !savedPostIds.has(post.id)) return false;
        if (currentSettings.feed_filter === 'mine' && post.user_id !== currentUser.id) return false;
        if (feedSearch.trim()) {
          const author = getUserById(state.users, post.user_id);
          const haystack = `${post.content} ${author?.full_name || ''} ${author?.username || ''}`.toLowerCase();
          if (!haystack.includes(feedSearch.toLowerCase())) return false;
        }
        return true;
      }),
    );
  }, [currentUser, currentSettings, state.posts, state.friend_requests, savedPostIds, feedSearch, state.users]);

  function withNotification(previous: AppState, notification: Notification) {
    return { ...previous, notifications: [notification, ...previous.notifications] };
  }

  function addNotification(previous: AppState, payload: Omit<Notification, 'id' | 'created_at'>) {
    if (!payload.user_id || payload.user_id === payload.actor_user_id) return previous;
    return withNotification(previous, {
      ...payload,
      id: id('notif'),
      created_at: new Date().toISOString(),
    });
  }

  function login(username: string, password: string) {
    const user = state.users.find((item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password);
    if (!user) return false;
    setState((previous) => ({
      ...previous,
      current_user_id: user.id,
      users: previous.users.map((item) => item.id === user.id ? { ...item, presence: 'online', last_seen: new Date().toISOString() } : item),
    }));
    setSelectedProfileId(user.id);
    setActiveView('feed');
    return true;
  }

  function register(userData: Pick<User, 'username' | 'password' | 'full_name' | 'bio' | 'profile_image' | 'location'>) {
    const now = new Date().toISOString();
    const userId = id('user');
    const newUser: User = {
      id: userId,
      username: userData.username,
      password: userData.password,
      full_name: userData.full_name,
      bio: userData.bio || 'New to Ripple and still setting things up.',
      profile_image: userData.profile_image || undefined,
      cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop',
      location: userData.location || 'Ripple network',
      created_at: now,
      last_seen: now,
      presence: 'online',
    };
    const newSettings: UserSettings = {
      id: id('settings'),
      user_id: userId,
      theme_mode: 'auto',
      density_mode: 'comfortable',
      feed_filter: 'all',
      quick_replies_enabled: true,
    };
    setState((previous) => ({
      ...previous,
      users: [newUser, ...previous.users],
      settings: [...previous.settings, newSettings],
      current_user_id: userId,
      drafts: { ...previous.drafts, [userId]: '' },
    }));
    setSelectedProfileId(userId);
    setActiveView('feed');
  }

  function logout() {
    if (!currentUser) return;
    setState((previous) => ({
      ...previous,
      current_user_id: null,
      users: previous.users.map((user) => user.id === currentUser.id ? { ...user, presence: 'offline', last_seen: new Date().toISOString() } : user),
    }));
  }

  function updateCurrentSettings(patch: Partial<UserSettings>) {
    if (!currentUser || !currentSettings) return;
    setState((previous) => ({
      ...previous,
      settings: previous.settings.map((item) => item.user_id === currentUser.id ? { ...item, ...patch } : item),
    }));
  }

  function createPost(payload: { content: string; image: string; visibility: PostVisibility }) {
    if (!currentUser) return;
    const content = clampText(payload.content);
    if (!content) return;
    const image = safeUrl(payload.image);
    const newPost: Post = {
      id: id('post'),
      user_id: currentUser.id,
      content,
      image: image || undefined,
      visibility: payload.visibility,
      created_at: new Date().toISOString(),
    };
    setState((previous) => ({
      ...previous,
      posts: [newPost, ...previous.posts],
      drafts: { ...previous.drafts, [currentUser.id]: '' },
    }));
  }

  function updatePost(postId: string, content: string) {
    const nextContent = clampText(content);
    if (!nextContent) return;
    setState((previous) => ({
      ...previous,
      posts: previous.posts.map((post) => post.id === postId ? { ...post, content: nextContent, updated_at: new Date().toISOString() } : post),
    }));
  }

  function deletePost(postId: string) {
    setState((previous) => ({
      ...previous,
      posts: previous.posts.filter((post) => post.id !== postId),
      comments: previous.comments.filter((comment) => comment.post_id !== postId),
      likes: previous.likes.filter((like) => like.post_id !== postId),
      saved_posts: previous.saved_posts.filter((item) => item.post_id !== postId),
      notifications: previous.notifications.filter((item) => item.entity_id !== postId),
    }));
  }

  function updateDraft(value: string) {
    if (!currentUser) return;
    setState((previous) => ({
      ...previous,
      drafts: { ...previous.drafts, [currentUser.id]: value },
    }));
  }

  function toggleLike(postId: string) {
    if (!currentUser) return;
    setState((previous) => {
      const existing = previous.likes.find((like) => like.post_id === postId && like.user_id === currentUser.id);
      if (existing) {
        return { ...previous, likes: previous.likes.filter((like) => like.id !== existing.id) };
      }
      let nextState: AppState = {
        ...previous,
        likes: [...previous.likes, { id: id('like'), post_id: postId, user_id: currentUser.id }],
      };
      const post = previous.posts.find((item) => item.id === postId);
      if (post && post.user_id !== currentUser.id) {
        nextState = addNotification(nextState, {
          user_id: post.user_id,
          actor_user_id: currentUser.id,
          type: 'like',
          entity_id: postId,
          is_read: false,
          message: `${currentUser.full_name} liked your post.`,
        });
      }
      return nextState;
    });
  }

  function toggleSave(postId: string) {
    if (!currentUser) return;
    setState((previous) => {
      const existing = previous.saved_posts.find((item) => item.post_id === postId && item.user_id === currentUser.id);
      if (existing) {
        return { ...previous, saved_posts: previous.saved_posts.filter((item) => item.id !== existing.id) };
      }
      return {
        ...previous,
        saved_posts: [{ id: id('saved'), post_id: postId, user_id: currentUser.id, created_at: new Date().toISOString() }, ...previous.saved_posts],
      };
    });
  }

  function createComment(postId: string, content: string) {
    if (!currentUser) return;
    const nextContent = clampText(content);
    if (!nextContent) return;
    setState((previous) => {
      const newComment: Comment = {
        id: id('comment'),
        post_id: postId,
        user_id: currentUser.id,
        content: nextContent,
        created_at: new Date().toISOString(),
      };
      let nextState: AppState = { ...previous, comments: [...previous.comments, newComment] };
      const post = previous.posts.find((item) => item.id === postId);
      if (post && post.user_id !== currentUser.id) {
        nextState = addNotification(nextState, {
          user_id: post.user_id,
          actor_user_id: currentUser.id,
          type: 'comment',
          entity_id: postId,
          is_read: false,
          message: `${currentUser.full_name} commented on your post.`,
        });
      }
      return nextState;
    });
  }

  function updateComment(commentId: string, content: string) {
    const nextContent = clampText(content);
    if (!nextContent) return;
    setState((previous) => ({
      ...previous,
      comments: previous.comments.map((comment) => comment.id === commentId ? { ...comment, content: nextContent, updated_at: new Date().toISOString() } : comment),
    }));
  }

  function deleteComment(commentId: string) {
    setState((previous) => ({
      ...previous,
      comments: previous.comments.filter((comment) => comment.id !== commentId),
    }));
  }

  function sendFriendRequest(targetUserId: string) {
    if (!currentUser || targetUserId === currentUser.id) return;
    setState((previous) => {
      if (getFriendship(previous.friend_requests, currentUser.id, targetUserId)) return previous;
      let nextState: AppState = {
        ...previous,
        friend_requests: [
          {
            id: id('friend'),
            from_user_id: currentUser.id,
            to_user_id: targetUserId,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
          ...previous.friend_requests,
        ],
      };
      nextState = addNotification(nextState, {
        user_id: targetUserId,
        actor_user_id: currentUser.id,
        type: 'friend_request',
        entity_id: nextState.friend_requests[0].id,
        is_read: false,
        message: `${currentUser.full_name} sent you a friend request.`,
      });
      return nextState;
    });
  }

  function acceptFriendRequest(requestId: string) {
    if (!currentUser) return;
    setState((previous) => {
      const request = previous.friend_requests.find((item) => item.id === requestId);
      if (!request) return previous;
      let nextState: AppState = {
        ...previous,
        friend_requests: previous.friend_requests.map((item) => item.id === requestId ? { ...item, status: 'accepted', responded_at: new Date().toISOString() } : item),
      };
      nextState = addNotification(nextState, {
        user_id: request.from_user_id,
        actor_user_id: currentUser.id,
        type: 'friend_accept',
        entity_id: requestId,
        is_read: false,
        message: `${currentUser.full_name} accepted your friend request.`,
      });
      return nextState;
    });
  }

  function declineFriendRequest(requestId: string) {
    setState((previous) => ({
      ...previous,
      friend_requests: previous.friend_requests.map((item) => item.id === requestId ? { ...item, status: 'declined', responded_at: new Date().toISOString() } : item),
    }));
  }

  function cancelFriendRequest(requestId: string) {
    setState((previous) => ({
      ...previous,
      friend_requests: previous.friend_requests.filter((item) => item.id !== requestId),
    }));
  }

  function removeFriend(userId: string) {
    if (!currentUser) return;
    setState((previous) => ({
      ...previous,
      friend_requests: previous.friend_requests.filter(
        (item) =>
          !(
            item.status === 'accepted' &&
            ((item.from_user_id === currentUser.id && item.to_user_id === userId) ||
              (item.from_user_id === userId && item.to_user_id === currentUser.id))
          ),
      ),
    }));
  }

  function startConversation(userId: string) {
    if (!currentUser) return;
    if (!areFriends(state.friend_requests, currentUser.id, userId)) {
      setActiveView('friends');
      return;
    }
    const existing = getConversationWithUser(state.conversations, currentUser.id, userId);
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveView('messages');
      return;
    }
    const conversationId = id('conversation');
    setState((previous) => ({
      ...previous,
      conversations: [
        { id: conversationId, participant_ids: [currentUser.id, userId], updated_at: new Date().toISOString() },
        ...previous.conversations,
      ],
    }));
    setActiveConversationId(conversationId);
    setActiveView('messages');
  }

  function sendMessage(payload: { conversationId: string; content: string; replyTo?: string; mediaUrl?: string }) {
    if (!currentUser) return;
    const content = clampText(payload.content);
    const mediaUrl = safeUrl(payload.mediaUrl || '');
    if (!content) return;
    setState((previous) => {
      const conversation = previous.conversations.find((item) => item.id === payload.conversationId);
      if (!conversation) return previous;
      const message: Message = {
        id: id('message'),
        conversation_id: payload.conversationId,
        sender_id: currentUser.id,
        content,
        created_at: new Date().toISOString(),
        reply_to_message_id: payload.replyTo,
        media_url: mediaUrl || undefined,
      };
      let nextState: AppState = {
        ...previous,
        messages: [...previous.messages, message],
        conversations: previous.conversations.map((item) => item.id === payload.conversationId ? { ...item, updated_at: message.created_at } : item),
      };
      for (const participantId of conversation.participant_ids) {
        if (participantId === currentUser.id) continue;
        nextState = addNotification(nextState, {
          user_id: participantId,
          actor_user_id: currentUser.id,
          type: 'message',
          entity_id: payload.conversationId,
          is_read: false,
          message: `${currentUser.full_name} sent you a message.`,
        });
      }
      return nextState;
    });
  }

  function viewProfile(userId: string) {
    setSelectedProfileId(userId);
    setActiveView('profile');
  }

  function markAllNotificationsRead() {
    if (!currentUser) return;
    setState((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notification) => notification.user_id === currentUser.id ? { ...notification, is_read: true } : notification),
    }));
  }

  if (!currentUser || !currentSettings) {
    return <AuthScreen onLogin={login} onRegister={register} />;
  }

  const currentDraft = state.drafts[currentUser.id] || '';

  return (
    <div className="ripple-shell">
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)_320px]">
        <aside className="ripple-panel h-fit p-5 xl:sticky xl:top-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-semibold text-white">R</div>
            <div>
              <div className="text-2xl font-semibold">Ripple</div>
              <div className="text-sm text-muted-foreground">React/Vite social workspace</div>
            </div>
          </div>

          <button className="mt-6 flex w-full items-center gap-3 rounded-3xl bg-white/8 p-4 text-left" onClick={() => viewProfile(currentUser.id)}>
            <AvatarImage user={currentUser} size={54} />
            <div className="min-w-0">
              <div className="truncate font-medium">{currentUser.full_name}</div>
              <div className="truncate text-sm text-muted-foreground">@{currentUser.username}</div>
            </div>
          </button>

          <div className="mt-6 space-y-2">
            <ViewButton active={activeView === 'feed'} icon={<Home className="size-4" />} label="Feed" onClick={() => setActiveView('feed')} />
            <ViewButton active={activeView === 'profile'} icon={<UserRound className="size-4" />} label="Profile" onClick={() => setActiveView('profile')} />
            <ViewButton active={activeView === 'saved'} icon={<Bookmark className="size-4" />} label="Saved posts" count={savedPostIds.size} onClick={() => setActiveView('saved')} />
            <ViewButton active={activeView === 'friends'} icon={<Users className="size-4" />} label="Friends" count={friends.length} onClick={() => setActiveView('friends')} />
            <ViewButton active={activeView === 'notifications'} icon={<Bell className="size-4" />} label="Notifications" count={unreadNotifications} onClick={() => setActiveView('notifications')} />
            <ViewButton active={activeView === 'messages'} icon={<MessageCircle className="size-4" />} label="Messages" onClick={() => setActiveView('messages')} />
            <ViewButton active={activeView === 'search'} icon={<Compass className="size-4" />} label="Search people" onClick={() => setActiveView('search')} />
            <ViewButton active={activeView === 'settings'} icon={<SettingsIcon className="size-4" />} label="Settings" onClick={() => setActiveView('settings')} />
          </div>

          <div className="mt-6 grid gap-3">
            <button className="ripple-button-secondary justify-start" onClick={() => updateCurrentSettings({ theme_mode: currentSettings.theme_mode === 'dark' ? 'light' : 'dark' })}>
              {resolveTheme(currentSettings.theme_mode) === 'dark' ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />} Toggle theme
            </button>
            <button className="ripple-button-secondary justify-start" onClick={logout}>
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="ripple-panel flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
            <div>
              <div className="text-sm text-muted-foreground">Current view</div>
              <h1 className="text-3xl font-semibold">
                {activeView === 'feed' && 'Home feed'}
                {activeView === 'profile' && `${selectedProfile?.full_name || currentUser.full_name}`}
                {activeView === 'saved' && 'Saved posts'}
                {activeView === 'friends' && 'Friends hub'}
                {activeView === 'notifications' && 'Notifications'}
                {activeView === 'messages' && 'Messages'}
                {activeView === 'search' && 'Search people'}
                {activeView === 'settings' && 'Settings'}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="ripple-input pl-10"
                  placeholder={activeView === 'search' ? 'Search the Ripple network' : 'Filter feed posts'}
                  value={activeView === 'search' ? searchQuery : feedSearch}
                  onChange={(event) => (activeView === 'search' ? setSearchQuery(event.target.value) : setFeedSearch(event.target.value))}
                />
              </div>
              <span className="ripple-chip">
                {currentSettings.theme_mode === 'auto' ? 'Auto theme' : `${resolveTheme(currentSettings.theme_mode)} theme`}
              </span>
              <span className="ripple-chip">{currentSettings.density_mode} density</span>
            </div>
          </header>

          {activeView === 'feed' ? (
            <>
              <Composer draft={currentDraft} onChangeDraft={updateDraft} onSubmit={createPost} />
              <div className="flex flex-wrap gap-2">
                {([
                  ['all', 'All'],
                  ['friends', 'Friends'],
                  ['photos', 'Photos'],
                  ['saved', 'Saved'],
                  ['mine', 'Mine'],
                ] as Array<[FeedFilter, string]>).map(([value, label]) => (
                  <button
                    key={value}
                    className={`ripple-chip ${currentSettings.feed_filter === value ? '!border-cyan-300/40 !bg-cyan-300/12' : ''}`}
                    onClick={() => updateCurrentSettings({ feed_filter: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {visibleFeedPosts.map((post) => {
                  const author = getUserById(state.users, post.user_id);
                  if (!author) return null;
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={author}
                      currentUser={currentUser}
                      users={state.users}
                      comments={state.comments.filter((comment) => comment.post_id === post.id)}
                      likesCount={state.likes.filter((like) => like.post_id === post.id).length}
                      isLiked={state.likes.some((like) => like.post_id === post.id && like.user_id === currentUser.id)}
                      isSaved={savedPostIds.has(post.id)}
                      isCompact={currentSettings.density_mode === 'compact'}
                      canMessageAuthor={post.user_id !== currentUser.id && areFriends(state.friend_requests, currentUser.id, post.user_id)}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      onCreateComment={createComment}
                      onUpdateComment={updateComment}
                      onDeleteComment={deleteComment}
                      onUpdatePost={updatePost}
                      onDeletePost={deletePost}
                      onViewProfile={viewProfile}
                      onMessageUser={startConversation}
                    />
                  );
                })}
                {!visibleFeedPosts.length ? <div className="ripple-panel p-6 text-sm text-muted-foreground">No posts match the current filter and search.</div> : null}
              </div>
            </>
          ) : null}

          {activeView === 'saved' ? (
            <div className="space-y-4">
              {sortByNewest(state.posts.filter((post) => savedPostIds.has(post.id) && canViewPost(post, currentUser, state.friend_requests))).map((post) => {
                const author = getUserById(state.users, post.user_id);
                if (!author) return null;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={author}
                    currentUser={currentUser}
                    users={state.users}
                    comments={state.comments.filter((comment) => comment.post_id === post.id)}
                    likesCount={state.likes.filter((like) => like.post_id === post.id).length}
                    isLiked={state.likes.some((like) => like.post_id === post.id && like.user_id === currentUser.id)}
                    isSaved={savedPostIds.has(post.id)}
                    isCompact={false}
                    canMessageAuthor={post.user_id !== currentUser.id && areFriends(state.friend_requests, currentUser.id, post.user_id)}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onCreateComment={createComment}
                    onUpdateComment={updateComment}
                    onDeleteComment={deleteComment}
                    onUpdatePost={updatePost}
                    onDeletePost={deletePost}
                    onViewProfile={viewProfile}
                    onMessageUser={startConversation}
                  />
                );
              })}
              {!savedPostIds.size ? <div className="ripple-panel p-6 text-sm text-muted-foreground">Save a post to keep it handy here.</div> : null}
            </div>
          ) : null}

          {activeView === 'friends' ? (
            <FriendsView
              currentUser={currentUser}
              users={state.users}
              requests={state.friend_requests}
              onViewProfile={viewProfile}
              onSendRequest={sendFriendRequest}
              onAcceptRequest={acceptFriendRequest}
              onDeclineRequest={declineFriendRequest}
              onCancelRequest={cancelFriendRequest}
              onRemoveFriend={removeFriend}
              onMessageUser={startConversation}
            />
          ) : null}

          {activeView === 'notifications' ? <NotificationsView notifications={state.notifications.filter((item) => item.user_id === currentUser.id)} users={state.users} onMarkAllRead={markAllNotificationsRead} /> : null}

          {activeView === 'messages' ? (
            <MessagesView
              currentUser={currentUser}
              users={state.users.filter((user) => user.id === currentUser.id || areFriends(state.friend_requests, currentUser.id, user.id))}
              conversations={state.conversations.filter((conversation) => conversation.participant_ids.includes(currentUser.id))}
              messages={state.messages}
              settings={currentSettings}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onStartConversation={startConversation}
              onSendMessage={sendMessage}
            />
          ) : null}

          {activeView === 'search' ? (
            <SearchView
              currentUser={currentUser}
              users={state.users}
              requests={state.friend_requests}
              query={searchQuery}
              onChangeQuery={setSearchQuery}
              onViewProfile={viewProfile}
              onSendRequest={sendFriendRequest}
              onStartConversation={startConversation}
            />
          ) : null}

          {activeView === 'settings' ? <SettingsView settings={currentSettings} onUpdate={updateCurrentSettings} /> : null}

          {activeView === 'profile' && selectedProfile ? (
            <ProfileView
              currentUser={currentUser}
              viewingUser={selectedProfile}
              posts={state.posts.filter((post) => post.user_id === selectedProfile.id)}
              users={state.users}
              comments={state.comments}
              likes={state.likes}
              savedPostIds={savedPostIds}
              requests={state.friend_requests}
              onViewProfile={viewProfile}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              onCreateComment={createComment}
              onUpdateComment={updateComment}
              onDeleteComment={deleteComment}
              onUpdatePost={updatePost}
              onDeletePost={deletePost}
              onStartConversation={startConversation}
              onSendRequest={sendFriendRequest}
              onAcceptRequest={acceptFriendRequest}
              onDeclineRequest={declineFriendRequest}
              onCancelRequest={cancelFriendRequest}
              onRemoveFriend={removeFriend}
            />
          ) : null}
        </main>

        <aside className="space-y-6">
          <section className="ripple-panel p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Ripple signals</h2>
                <p className="text-sm text-muted-foreground">At-a-glance status from the merged feature set.</p>
              </div>
              <Bell className="size-5 text-cyan-300" />
            </div>
            <div className="mt-5 grid gap-3">
              <div className="ripple-panel-soft p-4">
                <div className="text-sm text-muted-foreground">Unread notifications</div>
                <div className="mt-1 text-3xl font-semibold">{unreadNotifications}</div>
              </div>
              <div className="ripple-panel-soft p-4">
                <div className="text-sm text-muted-foreground">Saved posts</div>
                <div className="mt-1 text-3xl font-semibold">{savedPostIds.size}</div>
              </div>
              <div className="ripple-panel-soft p-4">
                <div className="text-sm text-muted-foreground">Accepted friends</div>
                <div className="mt-1 text-3xl font-semibold">{friends.length}</div>
              </div>
            </div>
          </section>

          <section className="ripple-panel p-5 md:p-6">
            <h2 className="text-lg font-semibold">Online friends</h2>
            <div className="mt-4 space-y-3">
              {friends.filter((user) => user.presence !== 'offline').map((user) => (
                <button key={user.id} className="flex w-full items-center justify-between rounded-2xl bg-white/6 p-3 text-left hover:bg-white/10" onClick={() => startConversation(user.id)}>
                  <div className="flex items-center gap-3">
                    <AvatarImage user={user} size={40} />
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                  <span className={`size-2 rounded-full ${user.presence === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </button>
              ))}
              {!friends.filter((user) => user.presence !== 'offline').length ? <div className="ripple-panel-soft p-4 text-sm text-muted-foreground">No friends are active right now.</div> : null}
            </div>
          </section>

          <section className="ripple-panel p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-300" />
              <h2 className="text-lg font-semibold">Implementation highlights</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Ripple branding and palette are applied across auth, feed, profile, and messaging.</li>
              <li>Features from the PHP backend were translated into local React state and persistence.</li>
              <li>Friends-only posts and chats respect accepted friendship rules.</li>
              <li>Theme mode, feed drafts, density, and filters persist per user in local storage.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

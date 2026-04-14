import type {
  AppState,
  Comment,
  Conversation,
  FriendRequest,
  Like,
  Message,
  Notification,
  Post,
  SavedPost,
  User,
  UserSettings,
} from '../types';

const users: User[] = [
  {
    id: 'user_1',
    username: 'demo',
    password: 'demo',
    full_name: 'Alex Rivera',
    bio: 'Product designer building calmer social spaces with thoughtful details.',
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&auto=format&fit=crop',
    location: 'Manila',
    created_at: '2026-03-01T10:00:00Z',
    last_seen: '2026-04-14T08:58:00Z',
    presence: 'online',
  },
  {
    id: 'user_2',
    username: 'jordan',
    password: 'password',
    full_name: 'Jordan Lee',
    bio: 'Frontend engineer obsessed with motion, glassmorphism, and resilient UX.',
    profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
    location: 'Quezon City',
    created_at: '2026-03-05T14:30:00Z',
    last_seen: '2026-04-14T08:42:00Z',
    presence: 'away',
  },
  {
    id: 'user_3',
    username: 'sam',
    password: 'password',
    full_name: 'Sam Chen',
    bio: 'UX researcher by day, photographer by night. Collecting soft blue hour moments.',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop',
    location: 'Makati',
    created_at: '2026-03-10T09:15:00Z',
    last_seen: '2026-04-14T07:20:00Z',
    presence: 'offline',
  },
  {
    id: 'user_4',
    username: 'taylor',
    password: 'password',
    full_name: 'Taylor Morgan',
    bio: 'Design systems lead exploring the line between utility and delight.',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
    cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop',
    location: 'Cebu',
    created_at: '2026-03-12T16:45:00Z',
    last_seen: '2026-04-14T08:55:00Z',
    presence: 'online',
  },
];

const posts: Post[] = [
  {
    id: 'post_1',
    user_id: 'user_2',
    content: 'Ripple’s new feed shell is finally feeling right: calmer spacing, glass cards, and just enough glow to guide the eye without screaming for attention.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop',
    visibility: 'public',
    created_at: '2026-04-14T06:10:00Z',
  },
  {
    id: 'post_2',
    user_id: 'user_3',
    content: 'Blue hour walk after interviews. The city looked softer than usual tonight.',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&auto=format&fit=crop',
    visibility: 'friends',
    created_at: '2026-04-13T18:20:00Z',
  },
  {
    id: 'post_3',
    user_id: 'user_1',
    content: 'Trying out quick reply chips in chat. Tiny feature, huge improvement when you just want to keep momentum in a conversation.',
    visibility: 'public',
    created_at: '2026-04-13T15:15:00Z',
  },
  {
    id: 'post_4',
    user_id: 'user_4',
    content: 'A friends-only workboard should feel private without feeling hidden. That balance is harder than it looks.',
    visibility: 'friends',
    created_at: '2026-04-12T14:10:00Z',
  },
  {
    id: 'post_5',
    user_id: 'user_2',
    content: 'New palette direction: indigo base, violet accent, cyan edge-light. Feels very Ripple.',
    visibility: 'public',
    created_at: '2026-04-11T10:00:00Z',
  },
];

const comments: Comment[] = [
  {
    id: 'comment_1',
    post_id: 'post_1',
    user_id: 'user_1',
    content: 'The glow feels restrained in a good way. It reads premium instead of noisy.',
    created_at: '2026-04-14T06:40:00Z',
  },
  {
    id: 'comment_2',
    post_id: 'post_2',
    user_id: 'user_2',
    content: 'That photo is exactly the mood the new theme needs.',
    created_at: '2026-04-13T18:42:00Z',
  },
  {
    id: 'comment_3',
    post_id: 'post_3',
    user_id: 'user_4',
    content: 'Yes please. Especially for mobile flows.',
    created_at: '2026-04-13T15:48:00Z',
  },
];

const likes: Like[] = [
  { id: 'like_1', post_id: 'post_1', user_id: 'user_1' },
  { id: 'like_2', post_id: 'post_1', user_id: 'user_3' },
  { id: 'like_3', post_id: 'post_2', user_id: 'user_1' },
  { id: 'like_4', post_id: 'post_3', user_id: 'user_2' },
  { id: 'like_5', post_id: 'post_3', user_id: 'user_4' },
  { id: 'like_6', post_id: 'post_5', user_id: 'user_3' },
];

const savedPosts: SavedPost[] = [
  { id: 'saved_1', post_id: 'post_1', user_id: 'user_1', created_at: '2026-04-14T07:00:00Z' },
  { id: 'saved_2', post_id: 'post_3', user_id: 'user_1', created_at: '2026-04-14T07:10:00Z' },
];

const friendRequests: FriendRequest[] = [
  {
    id: 'fr_1',
    from_user_id: 'user_1',
    to_user_id: 'user_2',
    status: 'accepted',
    created_at: '2026-04-10T08:00:00Z',
    responded_at: '2026-04-10T08:10:00Z',
  },
  {
    id: 'fr_2',
    from_user_id: 'user_3',
    to_user_id: 'user_1',
    status: 'accepted',
    created_at: '2026-04-11T09:00:00Z',
    responded_at: '2026-04-11T09:14:00Z',
  },
  {
    id: 'fr_3',
    from_user_id: 'user_4',
    to_user_id: 'user_1',
    status: 'pending',
    created_at: '2026-04-14T05:20:00Z',
  },
];

const notifications: Notification[] = [
  {
    id: 'notif_1',
    user_id: 'user_1',
    actor_user_id: 'user_4',
    type: 'friend_request',
    entity_id: 'fr_3',
    message: 'Taylor sent you a friend request.',
    is_read: false,
    created_at: '2026-04-14T05:20:00Z',
  },
  {
    id: 'notif_2',
    user_id: 'user_1',
    actor_user_id: 'user_2',
    type: 'like',
    entity_id: 'post_3',
    message: 'Jordan liked your post about quick reply chips.',
    is_read: false,
    created_at: '2026-04-13T15:32:00Z',
  },
  {
    id: 'notif_3',
    user_id: 'user_1',
    actor_user_id: 'user_3',
    type: 'comment',
    entity_id: 'post_3',
    message: 'Sam commented on your post.',
    is_read: true,
    created_at: '2026-04-13T15:50:00Z',
  },
];

const conversations: Conversation[] = [
  {
    id: 'conv_1',
    participant_ids: ['user_1', 'user_2'],
    updated_at: '2026-04-14T08:40:00Z',
  },
  {
    id: 'conv_2',
    participant_ids: ['user_1', 'user_3'],
    updated_at: '2026-04-13T19:10:00Z',
  },
];

const messages: Message[] = [
  {
    id: 'msg_1',
    conversation_id: 'conv_1',
    sender_id: 'user_2',
    content: 'I pushed the latest visual shell notes. Want me to open a dedicated Ripple theme panel next?',
    created_at: '2026-04-14T08:35:00Z',
  },
  {
    id: 'msg_2',
    conversation_id: 'conv_1',
    sender_id: 'user_1',
    content: 'Yes, and let’s keep auto/light/dark in one place.',
    created_at: '2026-04-14T08:37:00Z',
    reply_to_message_id: 'msg_1',
  },
  {
    id: 'msg_3',
    conversation_id: 'conv_2',
    sender_id: 'user_3',
    content: 'Sending a couple of photos from tonight. One of them might be great for the onboarding hero.',
    created_at: '2026-04-13T19:05:00Z',
    media_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop',
  },
];

const settings: UserSettings[] = [
  {
    id: 'settings_1',
    user_id: 'user_1',
    theme_mode: 'auto',
    density_mode: 'comfortable',
    feed_filter: 'all',
    quick_replies_enabled: true,
  },
  {
    id: 'settings_2',
    user_id: 'user_2',
    theme_mode: 'dark',
    density_mode: 'compact',
    feed_filter: 'friends',
    quick_replies_enabled: true,
  },
  {
    id: 'settings_3',
    user_id: 'user_3',
    theme_mode: 'light',
    density_mode: 'comfortable',
    feed_filter: 'all',
    quick_replies_enabled: true,
  },
  {
    id: 'settings_4',
    user_id: 'user_4',
    theme_mode: 'dark',
    density_mode: 'comfortable',
    feed_filter: 'all',
    quick_replies_enabled: false,
  },
];

export const initialState: AppState = {
  users,
  posts,
  comments,
  likes,
  saved_posts: savedPosts,
  friend_requests: friendRequests,
  notifications,
  conversations,
  messages,
  settings,
  drafts: {
    user_1: 'Drafting a Ripple post about chat reply flows...'
  },
  current_user_id: null,
};

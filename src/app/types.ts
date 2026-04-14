export type ThemeMode = 'auto' | 'light' | 'dark';
export type PresenceStatus = 'online' | 'away' | 'offline';
export type PostVisibility = 'public' | 'friends';
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';
export type NotificationType = 'friend_request' | 'friend_accept' | 'like' | 'comment' | 'message' | 'saved';
export type FeedFilter = 'all' | 'friends' | 'photos' | 'saved' | 'mine';
export type DensityMode = 'comfortable' | 'compact';
export type ViewKey = 'feed' | 'profile' | 'saved' | 'friends' | 'notifications' | 'messages' | 'search' | 'settings';

export interface User {
  id: string;
  username: string;
  password: string;
  full_name: string;
  bio: string;
  profile_image?: string;
  cover_image?: string;
  location?: string;
  created_at: string;
  last_seen: string;
  presence: PresenceStatus;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image?: string;
  visibility: PostVisibility;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
}

export interface SavedPost {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: FriendRequestStatus;
  created_at: string;
  responded_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_user_id?: string;
  type: NotificationType;
  entity_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  reply_to_message_id?: string;
  media_url?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme_mode: ThemeMode;
  density_mode: DensityMode;
  feed_filter: FeedFilter;
  quick_replies_enabled: boolean;
}

export interface DraftMap {
  [userId: string]: string;
}

export interface AppState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  saved_posts: SavedPost[];
  friend_requests: FriendRequest[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  settings: UserSettings[];
  drafts: DraftMap;
  current_user_id: string | null;
}

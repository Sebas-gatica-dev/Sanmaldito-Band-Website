export type PublicTrack = {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string | null;
  trackNumber: number;
  albumTitle: string;
  coverImage: string;
  likes: number;
  comments: number;
};

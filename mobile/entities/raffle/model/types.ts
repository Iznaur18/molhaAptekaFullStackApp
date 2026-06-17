export type RaffleStatus =
  | "pending_staff"
  | "active"
  | "completed"
  | "paused"
  | "rejected";

export type RafflePrizeMediaType = "image" | "video";

export type RaffleFromApi = {
  _id: string;
  sellerId: string;
  title: string;
  description?: string;
  prizeImageUrl?: string;
  prizeMediaType?: RafflePrizeMediaType;
  prizeVideoUrl?: string;
  prizeImageFocus?: { x?: number; y?: number };
  targetSales: number;
  salesProgress: number;
  status: RaffleStatus;
  instagramUrl?: string | null;
  moderationComment?: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  seller?: { _id: string; userName?: string | null } | null;
};

export type FeaturedRaffleManage = {
  showEdit?: boolean;
  showDelete?: boolean;
  showPause?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPause?: () => void;
  busy?: boolean;
};

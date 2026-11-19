export interface Advertisement {
  id: string;
  advertiser_type: 'bookmaker' | 'business' | 'tipster';
  name: string;
  tagline: string;
  description: string;
  cta: string;
  target_url: string;
  image_url: string | null;
  image_path: string | null;
  tipster_id: string | null;
  active: boolean;
  sort_order: number;
}

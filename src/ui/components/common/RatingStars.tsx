import { Star } from 'lucide-react';

export function RatingStars({ value = 0, interactive = false, onChange }: { value?: number; interactive?: boolean; onChange?: (value: number) => void }) {
  return <span className="rating" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const icon = <Star size={15} fill={star <= value ? 'currentColor' : 'none'} />;
      return interactive ? <button type="button" key={star} className={star <= value ? 'star active' : 'star'} onClick={() => onChange?.(star)}>{icon}</button> : <span className={star <= value ? 'star active' : 'star'} key={star}>{icon}</span>;
    })}
  </span>;
}
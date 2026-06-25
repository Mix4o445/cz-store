import { supabase, throwOnError } from '../config/supabase.js';
import { mapReview } from './map.js';

const TABLE = 'reviews';
const WITH_USER = '*, users(id, name)';

export const reviewsRepo = {
  async listByProduct(productId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(WITH_USER)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    throwOnError(error, 'reviews.listByProduct');
    return (data ?? []).map(mapReview);
  },

  async byId(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    throwOnError(error, 'reviews.byId');
    return data ? mapReview(data) : null;
  },

  /** Insert or update the single (user, product) review. */
  async upsert({ userId, productId, rating, comment }) {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert(
        { user_id: userId, product_id: productId, rating, comment: comment ?? '' },
        { onConflict: 'user_id,product_id' }
      )
      .select(WITH_USER)
      .single();
    throwOnError(error, 'reviews.upsert');
    return mapReview(data);
  },

  async deleteById(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    throwOnError(error, 'reviews.deleteById');
  },

  /** Average rating + count for a product (computed in JS over the rows). */
  async statsForProduct(productId) {
    const { data, error } = await supabase.from(TABLE).select('rating').eq('product_id', productId);
    throwOnError(error, 'reviews.statsForProduct');
    const ratings = (data ?? []).map((r) => r.rating);
    const count = ratings.length;
    const avg = count ? ratings.reduce((s, r) => s + r, 0) / count : 0;
    return { avg, count };
  },
};

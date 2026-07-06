import { useMutation } from '@tanstack/react-query';
import { scraperApi } from '@/api/scraper.api';

export function useScrapeProduct() {
  return useMutation({
    mutationFn: (url) => scraperApi.scrapeProduct(url),
  });
}

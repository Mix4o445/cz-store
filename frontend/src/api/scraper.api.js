import client from './axiosClient';

export const scraperApi = {
  scrapeProduct: (url) =>
    client.post('/scraper/product', { url }).then((r) => r.data),
};

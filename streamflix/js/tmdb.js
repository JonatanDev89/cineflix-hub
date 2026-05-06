// ===== TMDB API + EmbedPlay Integration =====
const TMDB = (() => {
  // TMDB API key pública (v3 - read only, segura para frontend)
  const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
  const BASE    = 'https://api.themoviedb.org/3';
  const IMG     = 'https://image.tmdb.org/t/p/';
  const EMBED   = 'https://embedplayapi.top/embed';

  // Cache simples em memória
  const cache = {};

  async function get(path, params = {}) {
    const qs = new URLSearchParams({ api_key: API_KEY, language: 'pt-BR', ...params }).toString();
    const url = `${BASE}${path}?${qs}`;
    if (cache[url]) return cache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();
    cache[url] = data;
    return data;
  }

  // Poster / backdrop
  function poster(path, size = 'w342')   { return path ? `${IMG}${size}${path}` : null; }
  function backdrop(path, size = 'w780') { return path ? `${IMG}${size}${path}` : null; }

  // Embed URLs — usando embedplay.one com IMDB ID
  const EMBED_BASE = 'https://www.embedplay.one';
  function embedMovie(imdbId)                        { return `${EMBED_BASE}/filme/${imdbId}`; }
  function embedSeries(imdbId, season = 1, ep = 1)   { return `${EMBED_BASE}/serie/${imdbId}/${season}/${ep}`; }

  // Busca IMDB ID a partir do TMDB ID
  async function getImdbId(type, tmdbId) {
    const cacheKey = `imdb_${type}_${tmdbId}`;
    if (cache[cacheKey]) return cache[cacheKey];
    const data = await get(`/${type}/${tmdbId}/external_ids`);
    const imdbId = data.imdb_id || null;
    if (imdbId) cache[cacheKey] = imdbId;
    return imdbId;
  }

  // ---- Endpoints ----
  const trending = (type = 'all', window = 'week') => get(`/trending/${type}/${window}`);
  const popular  = (type = 'movie')                => get(`/${type}/popular`);
  const topRated = (type = 'movie')                => get(`/${type}/top_rated`);
  const nowPlaying = ()                            => get('/movie/now_playing');
  const onAir      = ()                            => get('/tv/on_the_air');
  const details    = (type, id)                    => get(`/${type}/${id}`, { append_to_response: 'credits,videos,similar' });
  const search     = (q, type = 'multi')           => get(`/search/${type}`, { query: q });
  const genres     = (type = 'movie')              => get(`/genre/${type}/list`);
  const byGenre    = (type, genreId, page = 1)     => get(`/discover/${type}`, { with_genres: genreId, page, sort_by: 'popularity.desc' });
  const seasons    = (tvId, season)                => get(`/tv/${tvId}/season/${season}`);

  return { get, poster, backdrop, embedMovie, embedSeries, getImdbId, trending, popular, topRated, nowPlaying, onAir, details, search, genres, byGenre, seasons };
})();

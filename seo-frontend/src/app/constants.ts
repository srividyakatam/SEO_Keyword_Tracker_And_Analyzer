export const SERVER_URL = 'https://seowebdora.onrender.com/';
export const ANALYSE_URL = SERVER_URL + 'analyse';


export interface APIResponse {
  algorithms: Algorithm[]
  all_counter: { [key: string]: number }
  recommended_top_keys: RecommendedTopKey[]
  recommended_url: RecommendedUrl[]
  subpages: string[]
  text: string
  top_keywords: { [key: string]: number }
}

export interface Algorithm {
  name: string
  time: number
}

export interface RecommendedTopKey {
  avg_monthly_searches: number
  competition: string
  text: string
}

export interface RecommendedUrl {
  avg_monthly_searches: number
  competition: string
  text: string
}


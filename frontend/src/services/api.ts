// frontend/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================
   SHARED TYPES
========================= */

export interface Availability {
  // ✅ EXISTING FIELDS (keep these)
  is_accessible: boolean;
  status_code?: number | null;
  response_time_ms?: number | null;
  ssl_valid?: boolean | null;
  has_redirects?: boolean | null;
  final_url?: string | null;
  error_message?: string | null;
  server_info?: string | null;

  // ✅ ADDED MISSING FIELDS (fix your errors)
  is_online?: boolean;              // ✅ FIX ERROR 1
  response_time?: string | null;    // ✅ FIX ERROR 2 (e.g., "715ms")
  server?: string | null;           // ✅ FIX ERROR 3 (e.g., "gws")

  // ✅ OPTIONAL: Additional fields your backend might return
  is_reachable?: boolean;           // Alternative to is_online
  ssl_certificate?: any;            // SSL cert details
  redirect_count?: number;          // Number of redirects
  redirects?: string[];             // Redirect chain
}

/* =========================
   GEO ANALYSIS TYPES
========================= */

export interface GeoLocation {
  ip: string | null;
  country: string;
  country_code?: string;
  region?: string;
  city?: string;
  isp?: string;
  timezone?: string;
  is_proxy?: boolean;
  is_hosting?: boolean;
}

export interface BlockedCountry {
  country: string;
  reason: string;
}

export interface ProxyDetection {
  is_proxy_url: boolean;
  confidence?: 'high' | 'medium' | 'low';
  detected_keywords?: string[];
  type?: string | null;
}

export interface GeoAnalysis {
  geolocation?: GeoLocation | null;
  blocked_in_countries: BlockedCountry[];
  proxy_detection?: ProxyDetection | null;
  is_geo_restricted: boolean;
  total_blocks: number;
}

/* =========================
   PREDICTION RESPONSE
========================= */

export interface PredictionResponse {
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  phishing_probability: number;
  legitimate_probability: number;
  risk_level: 'low' | 'medium' | 'high';

  // ✨ SUMMARY & AVAILABILITY
  summary?: string;
  availability?: Availability;
  geo_analysis?: GeoAnalysis;

  metadata?: {
    domain_analysis: string;
    domain_boost: number;
    ml_confidence: number;
    processing_time_ms: number;
    from_cache: boolean;
    model_version: string;
    has_summary?: boolean;
    has_availability?: boolean;
    threat_index?: number;
    url_hash?: string;             // ✨ For fetching cached explanations
    include_explanation?: boolean; // ✨ Whether SHAP was computed
  };

  timestamp: string;
}

/* =========================
   EXPLANATION RESPONSE
========================= */

export interface FeatureContribution {
  feature: string;
  value: number;
  contribution: number;
  impact: 'positive' | 'negative';
}

export interface ExplanationResponse {
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  explanation_method: string;
  base_value: number;
  top_features: FeatureContribution[];

  // ✨ SUMMARY & AVAILABILITY
  summary?: string;
  availability?: Availability;

  metadata?: {
    domain_analysis: string;
    domain_boost: number;
    prediction_metadata: any;
  };
}

/* =========================
   BATCH PREDICTION TYPES
========================= */

export interface BatchPredictionResult {
  url: string;
  prediction: 'phishing' | 'legitimate';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  error?: string;
}

export interface BatchPredictionResponse {
  results: BatchPredictionResult[];
  total: number;
  successful: number;
  failed: number;
  processing_time_ms: number;
}

/* =========================
   QR CODE SCAN TYPES
========================= */

export interface QRScanResponse extends PredictionResponse {
  qr_metadata?: {
    decoded_url: string;
    quality?: string;
    redirect_chain?: string[];
    version?: string;
  };
  shap_features?: FeatureContribution[];
}

/* =========================
   API FUNCTIONS
 ========================= */

/**
 * Predict if a URL is phishing or legitimate
 * @param url - URL to analyze
 * @param includeExplanation - Set to false for 10x faster response (default: true)
 */
export const predictURL = async (
  url: string,
  includeExplanation: boolean = true
): Promise<PredictionResponse> => {
  const response = await api.post(`/predict/?include_explanation=${includeExplanation}`, { url });
  return response.data;
};

/**
 * 🚀 FAST prediction - optimized for speed (<200ms)
 * Skips SHAP explanation and computes it in the background
 */
export const predictURLFast = async (url: string): Promise<PredictionResponse> => {
  const response = await api.post('/predict/fast', { url });
  return response.data;
};

/**
 * Fetch cached explanation by URL hash
 * Use this after calling predictURLFast to get the explanation
 */
export const getCachedExplanation = async (urlHash: string) => {
  const response = await api.get(`/predict/explanation/${urlHash}`);
  return response.data;
};

/**
 * Get SHAP explanation for a URL prediction
 */
export const explainPrediction = async (url: string): Promise<ExplanationResponse> => {
  const response = await api.post('/predict/explain', { url });
  return response.data;
};

/**
 * Batch predict multiple URLs
 */
export const batchPredict = async (urls: string[]): Promise<BatchPredictionResponse> => {
  const response = await api.post('/predict/batch', { urls });
  return response.data;
};

/**
 * Analyze QR code image
 */
export const analyzeQRCode = async (data: { image: string }): Promise<QRScanResponse[]> => {
  const response = await api.post('/predict/qr-scan', data);
  return response.data;
};

/**
 * Send a contact form message
 */
export const sendContactMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await api.post('/contact/', data);
  return response.data;
};

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};
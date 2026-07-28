export interface Availability {
  is_accessible: boolean;
  status_code: number | null;
  response_time_ms: number | null;
  ssl_valid: boolean;
  has_redirects: boolean;
  final_url: string | null;
  error_message: string | null;
  server_info: string | null;
}

export interface PredictionResponse {
  url: string;
  prediction: string;
  confidence: number;
  phishing_probability: number;
  legitimate_probability: number;
  risk_level: string;
  summary?: string;           // ← ADD THIS
  availability?: Availability; // ← ADD THIS
  metadata: {
    domain_analysis: string;
    domain_boost: number;
    ml_confidence: number;
    processing_time_ms: number;
    from_cache: boolean;
    model_version: string;
    has_summary: boolean;
    has_availability: boolean;
  };
  timestamp: string;
}
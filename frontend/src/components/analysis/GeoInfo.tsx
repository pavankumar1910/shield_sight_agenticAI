import { Globe, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';

interface GeoInfoProps {
  geoAnalysis: any;
}

export const GeoInfo = ({ geoAnalysis }: GeoInfoProps) => {
  if (!geoAnalysis) return null;

  const { geolocation, blocked_in_countries, proxy_detection } = geoAnalysis;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Geographic & Proxy Analysis</h3>
      </div>

      <div className="space-y-4">
        {/* Geolocation */}
        {geolocation && geolocation.country && (
          <div>
            <p className="text-sm font-medium mb-2">Server Location</p>
            <div className="text-sm space-y-1">
              <p>🌍 Country: <span className="font-medium">{geolocation.country}</span></p>
              {geolocation.city && <p>📍 City: {geolocation.city}</p>}
              {geolocation.isp && <p>🏢 ISP: {geolocation.isp}</p>}
              {geolocation.ip && <p>🔢 IP: {geolocation.ip}</p>}
            </div>
          </div>
        )}

        {/* Geo-blocking */}
        {blocked_in_countries && blocked_in_countries.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                  Blocked in {blocked_in_countries.length} {blocked_in_countries.length === 1 ? 'Country' : 'Countries'}
                </p>
                <div className="mt-2 space-y-2">
                  {blocked_in_countries.map((block: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">
                        🚫 {block.country}
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                        {block.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proxy Detection */}
        {proxy_detection && proxy_detection.is_proxy_url && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-700 dark:text-orange-300">
                  Proxy/VPN Service Detected
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  {proxy_detection.type}
                </p>
                {proxy_detection.detected_keywords && proxy_detection.detected_keywords.length > 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Keywords: {proxy_detection.detected_keywords.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
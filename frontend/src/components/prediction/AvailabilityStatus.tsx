import { motion } from 'framer-motion';
import {
    Globe,
    CheckCircle,
    XCircle,
    Lock,
    AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card'; // correct syntax

interface AvailabilityStatusProps {
    availability: {
        is_accessible: boolean;
        status_code: number | null;
        response_time_ms: number | null;
        ssl_valid: boolean;
        has_redirects: boolean;
        final_url: string | null;
        error_message: string | null;
        server_info: string | null;
    };
}

export const AvailabilityStatus = ({ availability }: AvailabilityStatusProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="glass">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Website Availability
                    </h3>

                    {availability.is_accessible ? (
                        <div className="space-y-3">
                            {/* Online Status */}
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">Website is ONLINE</span>
                            </div>

                            {/* Response Time */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <span className="text-sm text-muted-foreground">Response Time</span>
                                <span className="font-semibold text-foreground">
                                    {availability.response_time_ms}ms
                                </span>
                            </div>

                            {/* Status Code */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <span className="text-sm text-muted-foreground">HTTP Status</span>
                                <span className={`font-semibold ${availability.status_code === 200
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-yellow-600 dark:text-yellow-400'
                                    }`}>
                                    {availability.status_code}
                                </span>
                            </div>

                            {/* SSL Status */}
                            {availability.ssl_valid ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm">Secure HTTPS connection</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm">No HTTPS (insecure)</span>
                                </div>
                            )}

                            {/* Redirects */}
                            {availability.has_redirects && (
                                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                                URL Redirects
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Final URL: {availability.final_url}
                                            </p>
                                            <p className="text-xs text-yellow-600/80 mt-1">
                                                ⚠️ Redirects can be used in phishing attacks
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Server Info */}
                            {availability.server_info && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Server</span>
                                    <span className="text-xs font-mono text-foreground">
                                        {availability.server_info}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Offline Status */}
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <XCircle className="w-5 h-5" />
                                <span className="font-semibold">Website is OFFLINE or UNREACHABLE</span>
                            </div>

                            {/* Error Message */}
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                                    <strong>Error:</strong> {availability.error_message}
                                </p>
                            </div>

                            {/* What This Means */}
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                <p className="text-sm font-semibold text-foreground mb-2">
                                    ⚠️ This could indicate:
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Website is temporarily down</li>
                                    <li>Server maintenance in progress</li>
                                    <li>Domain doesn't exist (typo or fake)</li>
                                    <li>Phishing site was taken down</li>
                                    <li>DNS lookup failure</li>
                                </ul>
                            </div>

                            {/* Warning for Phishing */}
                            {!availability.ssl_valid && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        🚨 <strong>Extra suspicious:</strong> No HTTPS + unreachable = likely phishing!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
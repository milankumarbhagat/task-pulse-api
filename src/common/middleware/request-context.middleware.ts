import {
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { context, trace } from '@opentelemetry/api';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    constructor(private logger: LoggerService) { }

    use(req: any, res: any, next: () => void) {
        const startTime = Date.now();

        // Extract traceId from OpenTelemetry
        const span = trace.getSpan(context.active());
        const traceId = span?.spanContext().traceId || 'no-trace';

        req.log = {
            debug: (message: string, meta?: any) =>
                this.logger.debug(message, { traceId, ...meta }),

            info: (message: string, meta?: any) =>
                this.logger.info(message, { traceId, ...meta }),

            error: (message: string, meta?: any) =>
                this.logger.error(message, { traceId, ...meta }),
        };

        // Log the payload if request method is POST or PUT
        if (req.method === 'POST' || req.method === 'PUT') {
            req.log.info('Incoming request', {
                method: req.method,
                url: req.originalUrl,
                payload: req.body,
            });
        } else {
            req.log.info('Incoming request', {
                method: req.method,
                url: req.originalUrl,
            });
        }

        res.on('finish', () => {
            const duration = Date.now() - startTime;

            req.log.info('Request completed', {
                statusCode: res.statusCode,
                duration,
            });
        });

        next();
    }
}
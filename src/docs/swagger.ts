import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './openapi';

export function mountApiDocs(app: Express): void {
  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec as swaggerUi.JsonObject, {
      explorer: true,
      customSiteTitle: 'Doctor Booking API',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );
}

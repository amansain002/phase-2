import { generateCompanionResponse, isGeminiConfigured } from './geminiService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Common request handler for /api/companion endpoints
 */
export async function handleCompanionRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/api/companion/status' && req.method === 'GET') {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: 'ok',
        geminiConfigured: isGeminiConfigured(),
        model: 'gemini-3.5-flash-lite',
        serverTime: new Date().toISOString(),
      })
    );
    return;
  }

  if ((pathname === '/api/companion/generate' || pathname === '/api/companion/chat') && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 50000) {
        req.destroy(); // Protect against oversized payloads
      }
    });

    req.on('end', async () => {
      try {
        const context = body ? JSON.parse(body) : {};
        const response = await generateCompanionResponse(context);
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } catch (err) {
        console.error('API Error:', err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            error: 'Failed to process AI companion request',
            details: err.message,
          })
        );
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
}

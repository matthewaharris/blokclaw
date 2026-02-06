import SwaggerParser from '@apidevtools/swagger-parser';

export async function validateOpenAPISpec(contractUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(contractUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return { valid: false, errors: [`Failed to fetch spec: HTTP ${response.status}`] };
    }

    const contentType = response.headers.get('content-type') || '';
    let spec;

    if (contentType.includes('json')) {
      spec = await response.json();
    } else {
      const text = await response.text();
      try {
        spec = JSON.parse(text);
      } catch {
        // Could be YAML — let swagger-parser handle it
        spec = text;
      }
    }

    await SwaggerParser.validate(spec);
    return { valid: true, errors: null };
  } catch (error) {
    clearTimeout(timeout);
    const message = error.name === 'AbortError'
      ? 'Timeout fetching spec'
      : error.message || 'Unknown validation error';
    return { valid: false, errors: [message] };
  }
}

// Performance monitoring middleware
export const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Add response time header before response is sent
  res.setHeader('X-Response-Time', '0ms');
  
  // Monitor response time without setting headers after response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, statusCode } = req;
    
    console.log(`${method} ${url} - ${statusCode} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️  Slow request detected: ${method} ${url} took ${duration}ms`);
    }
  });
  
  next();
};

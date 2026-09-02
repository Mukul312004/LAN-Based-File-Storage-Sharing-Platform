import multer from 'multer';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds maximum allowed limit',
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  // Handle custom status errors
  const statusCode = err.statusCode || (res.statusCode !== 200 && res.statusCode !== 201 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

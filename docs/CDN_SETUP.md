# CDN Configuration Guide

## Overview

Manus platform automatically provides CDN (Content Delivery Network) for all static assets when you publish your project. However, you can also configure custom CDN providers for additional performance optimization.

## Automatic CDN (Manus Built-in)

When you publish your project via Manus:
- ✅ All static assets are automatically served via CDN
- ✅ Global edge locations for fast delivery
- ✅ Automatic cache headers
- ✅ HTTPS enabled by default
- ✅ No additional configuration needed

## Custom CDN Setup (Optional)

If you want to use a custom CDN provider (CloudFlare, AWS CloudFront, etc.), follow these steps:

### 1. CloudFlare Setup

1. **Sign up for CloudFlare**
   - Go to https://cloudflare.com
   - Create a free account

2. **Add your domain**
   - Add your custom domain (e.g., orbicity.com)
   - Update DNS nameservers to CloudFlare

3. **Configure caching rules**
   ```
   Cache Level: Standard
   Browser Cache TTL: 4 hours
   Always Online: On
   ```

4. **Page Rules for static assets**
   ```
   URL: *orbicity.com/assets/*
   Cache Level: Cache Everything
   Edge Cache TTL: 1 month
   Browser Cache TTL: 1 month
   ```

### 2. AWS CloudFront Setup

1. **Create CloudFront distribution**
   ```bash
   # Origin Domain: your-manus-domain.manus.space
   # Origin Protocol: HTTPS only
   # Viewer Protocol: Redirect HTTP to HTTPS
   ```

2. **Configure cache behaviors**
   ```
   Path Pattern: /assets/*
   TTL: Min=0, Max=31536000, Default=86400
   Compress Objects: Yes
   ```

3. **Update environment variables**
   ```env
   VITE_CDN_URL=https://your-cloudfront-domain.cloudfront.net
   ```

## Asset Optimization

### Image Optimization

Use WebP format for images:
```bash
# Convert images to WebP
cwebp input.png -o output.webp
```

### JavaScript/CSS Minification

Vite automatically minifies assets in production:
```js
// vite.config.ts
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
};
```

### Asset Versioning

Vite automatically adds content hashes to filenames:
```
logo.png → logo.3fa9b2e4.png
main.js → main.7d8f9a1b.js
```

## Cache Headers

Current cache headers (automatically set by Manus):
```
Cache-Control: public, max-age=31536000, immutable
```

## Performance Monitoring

Monitor CDN performance:
1. **CloudFlare Analytics** - Built-in analytics dashboard
2. **AWS CloudFront Reports** - Real-time and historical reports
3. **Google PageSpeed Insights** - Overall performance score

## Best Practices

1. **Use content hashing** - Always version your assets
2. **Compress images** - Use WebP, optimize PNG/JPEG
3. **Lazy load images** - Load images only when needed
4. **Preload critical assets** - Use `<link rel="preload">`
5. **Use CDN for all static assets** - CSS, JS, images, fonts

## Troubleshooting

### Cache not updating
```bash
# Purge CloudFlare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -d '{"purge_everything":true}'
```

### Slow asset loading
- Check CDN edge location coverage
- Verify cache headers are set correctly
- Use browser DevTools Network tab to debug

## Status

- ✅ Manus built-in CDN: Active
- ⚠️ Custom CDN: Not configured (optional)
- ✅ Asset optimization: Enabled (Vite)
- ✅ Cache headers: Configured
- ✅ HTTPS: Enabled

## Next Steps

1. Monitor CDN performance in production
2. Consider custom CDN if traffic grows significantly
3. Optimize images and assets regularly
4. Set up performance monitoring alerts

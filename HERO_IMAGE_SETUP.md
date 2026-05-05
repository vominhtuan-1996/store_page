# Hero Image Setup

## 📸 Hướng Dẫn Thêm Hình Ảnh Hero

The landing page is now configured to use a background image for the hero section.

### Steps:

1. **Save the image file** you want to use (the rural landscape with mountains and fields)
   - Recommended size: 3840x1646px or similar aspect ratio
   - Format: JPG, PNG, or WebP
   - File size: < 500KB (optimize for web)

2. **Place the image in the public folder:**
   ```
   /public/images/hero-landscape.jpg
   ```

3. **That's it!** The hero section will automatically use this image as background.

### Optimization Tips:

- Use an online tool like [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/) to compress
- Consider using WebP format for better performance
- Ensure image is 3000-4000px wide for retina displays

### To Change Image Path:

If you want to use a different image name, edit `src/components/TuBongLanding.tsx`:

```tsx
backgroundImage: 'url(/images/your-image-name.jpg)',
```

### Current Setup:

- Hero overlay opacity: `0.45` (dark overlay for text readability)
- Background size: `cover` (fills entire viewport)
- Background position: `center`
- Background attachment: `fixed` (parallax effect)

The gradient fallback will display if the image fails to load.

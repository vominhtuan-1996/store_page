# Deploy to GitHub Pages

Cấu hình và deploy dự án React (Vite) lên GitHub Pages.

## Input
- `$ARGUMENTS` - (Optional) Tên repository (VD: `store-page`). Nếu không truyền, tự detect từ git remote.

## Instructions

### Bước 1: Detect thông tin repo

1. Lấy remote URL từ git:
```bash
git remote get-url origin
```
2. Parse ra `owner` và `repo-name`.
3. Nếu `$ARGUMENTS` được truyền, dùng làm repo name.
4. Xác định base path:
   - Nếu deploy tại `https://<owner>.github.io/<repo>/` → base = `/<repo>/`
   - Nếu deploy tại `https://<owner>.github.io/` → base = `/`

### Bước 2: Cấu hình Vite

Cập nhật `vite.config.ts` thêm `base`:

```ts
export default defineConfig({
  base: '/<repo-name>/',
  plugins: [react()],
  // ... existing config
});
```

### Bước 3: Xử lý React Router (SPA routing)

Tạo file `public/404.html` để redirect về `index.html` (GitHub Pages không hỗ trợ SPA routing mặc định):

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <script>
      // GitHub Pages SPA redirect
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1; // 1 cho project page, 0 cho user page
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

Thêm redirect script vào `index.html` (trong `<head>`, trước closing tag):

```html
<script>
  // GitHub Pages SPA redirect handler
  (function () {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

### Bước 4: Tạo GitHub Actions workflow

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Bước 5: Tạo script deploy thủ công (backup)

Thêm scripts vào `package.json`:

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "deploy": "pnpm build && gh-pages -d dist"
  }
}
```

Cài `gh-pages` package (cho deploy thủ công):

```bash
pnpm add -D gh-pages
```

### Bước 6: Cấu hình GitHub repo

Hướng dẫn user bật GitHub Pages:
1. Vào **Settings** → **Pages** trên GitHub repo
2. Chọn **Source**: `GitHub Actions`
3. Save

### Bước 7: Cập nhật .gitignore

Đảm bảo `.gitignore` có:

```
dist/
node_modules/
```

### Bước 8: Verify & Deploy

1. Chạy build local để kiểm tra:
```bash
pnpm build && pnpm preview
```

2. Commit tất cả thay đổi:
```bash
git add .
git commit -m "ci: add GitHub Pages deployment config"
```

3. Push lên remote:
```bash
git push origin main
```

4. Kiểm tra GitHub Actions tab để xem deployment status.

### Output

Sau khi hoàn tất, thông báo cho user:
- URL deploy: `https://<owner>.github.io/<repo>/`
- Nhắc user vào Settings → Pages → chọn Source: GitHub Actions
- Mỗi lần push vào `main`, web sẽ tự động deploy
- Có thể deploy thủ công bằng `pnpm deploy` hoặc trigger workflow_dispatch

### Lưu ý quan trọng
- Nếu dùng React Router, PHẢI dùng `basename` prop:
  ```tsx
  <BrowserRouter basename="/<repo-name>/">
  ```
- Nếu có env variables, KHÔNG commit `.env` - dùng GitHub Secrets + workflow env
- Assets (images, fonts) phải dùng relative path hoặc import qua Vite
- Nếu dùng `HashRouter` thay `BrowserRouter` thì không cần file `404.html`

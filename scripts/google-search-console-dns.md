# Google Search Console — deploy olmadan doğrulama

## Yöntem 1: HTML etiketi (ÖNERİLEN — deploy gerekmez)

Canlı sitede meta zaten var. Search Console'da:

1. Mülk türü: **URL öneki** → `https://zippr.ink`
2. Doğrulama → **HTML etiketi** seç (Alan adı sağlayıcı / DNS TXT değil)
3. **Doğrula**

Kontrol: https://zippr.ink kaynağında `google-site-verification` aranmalı.

---

## Yöntem 2: DNS TXT (alan adı paneli)

Mevcut SPF kaydını **silme**. Yeni bir TXT kaydı **ekle**:

| Alan | Değer |
|------|--------|
| Tip | TXT |
| Ad / Host | `@` veya boş |
| Değer | `google-site-verification=EAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U` |

SPF ayrı kayıt olarak kalır. Yayılma 5 dk – 48 saat sürebilir.

---

## Yöntem 3: HTML dosyası (build yok, 1 dosya)

Sunucuda SSH:

```bash
cd /var/www/zippr.ink
mkdir -p public
echo 'google-site-verification: googleEAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U.html' > public/googleEAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U.html
pm2 restart zippr
```

Search Console → **HTML dosyası** yöntemi → Doğrula.

Test: https://zippr.ink/googleEAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U.html

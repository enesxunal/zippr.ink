import type { ToolMode } from "@/components/tools/tool-workspace";

export type SeoToolMode = ToolMode | "pdf";

export type SeoToolLanding = {
  slug: string;
  mode: SeoToolMode;
  title: string;
  description: string;
  h1: string;
  intro: string;
  bullets: string[];
  faq: { q: string; a: string }[];
};

export const SEO_TOOL_LANDINGS: SeoToolLanding[] = [
  {
    slug: "png-kucultme",
    mode: "compress",
    title: "PNG Küçültme – PNG Boyut ve Dosya Boyutu Küçültme | zippr.ink",
    description: "PNG boyut küçültme ve PNG dosya boyutu küçültme işlemini online yapın. PNG görsellerini hızlıca sıkıştırın ve daha küçük dosya indirin.",
    h1: "PNG Küçültme ve PNG Boyut Küçültme",
    intro: "PNG görsellerinizin dosya boyutunu azaltın. Görseli yükleyin, zippr.ink otomatik optimize etsin ve daha küçük PNG dosyasını indirin.",
    bullets: ["PNG dosya boyutunu azaltır", "Kurulum gerektirmez", "Toplu görsel sıkıştırmayı destekler", "İşlem sonrası indirme veya paylaşım linki"],
    faq: [
      { q: "PNG boyutu nasıl küçültülür?", a: "PNG dosyanızı yükleyin. zippr.ink görseli otomatik optimize eder ve daha küçük dosyayı indirmenizi sağlar." },
      { q: "PNG kalitesi düşer mi?", a: "Amaç dosya boyutunu azaltırken görünür kalite kaybını minimumda tutmaktır. Sonucu indirmeden önce dosya boyutu farkını görebilirsiniz." },
    ],
  },
  {
    slug: "jpg-sikistirma",
    mode: "compress",
    title: "JPG Sıkıştırma – JPEG Boyutu Küçültme Online | zippr.ink",
    description: "JPG ve JPEG görsellerini online sıkıştırın. Fotoğraf dosya boyutunu hızlıca azaltın ve daha küçük JPG dosyası indirin.",
    h1: "JPG / JPEG Sıkıştırma",
    intro: "Fotoğraf ve JPG dosyalarını web, e-posta ve yükleme limitleri için küçültün. JPG dosyanızı bırakın, otomatik sıkıştırın ve sonucu indirin.",
    bullets: ["JPG ve JPEG desteği", "Web ve e-ticaret görselleri için uygun", "Toplu sıkıştırma", "Tarayıcıdan hızlı kullanım"],
    faq: [
      { q: "JPG dosya boyutu nasıl küçültülür?", a: "JPG veya JPEG görseli yükleyip sıkıştırma işlemini başlatın. Sistem optimize edilmiş dosyayı hazırlar." },
      { q: "JPG sıkıştırma ücretsiz mi?", a: "Temel görsel sıkıştırma aracı ücretsiz kullanılabilir; plan limitleri dosya boyutu ve saklama özelliklerine göre değişebilir." },
    ],
  },
  {
    slug: "webp-sikistirma",
    mode: "compress",
    title: "WebP Sıkıştırma – WebP Boyut Küçültme Online | zippr.ink",
    description: "WebP görsellerini online sıkıştırın ve dosya boyutunu küçültün. Web performansı için daha hafif WebP dosyaları oluşturun.",
    h1: "WebP Sıkıştırma",
    intro: "WebP görsellerini daha da optimize ederek web sayfalarının ve ürün görsellerinin dosya boyutunu azaltın.",
    bullets: ["WebP dosyalarını optimize eder", "Web performansı odaklı", "Toplu işlem desteği", "Sonucu doğrudan indirebilirsiniz"],
    faq: [
      { q: "WebP dosyası küçültülebilir mi?", a: "Evet. WebP zaten verimli bir format olsa da dosyaya göre ek optimizasyon ve boyut azaltma mümkün olabilir." },
      { q: "WebP sıkıştırmak SEO'ya yardımcı olur mu?", a: "Daha hafif görseller sayfa yükleme performansına katkı sağlayabilir. Bu da kullanıcı deneyimi ve Core Web Vitals açısından faydalıdır." },
    ],
  },
  {
    slug: "gorsel-sikistirma",
    mode: "compress",
    title: "Görsel Sıkıştırma – Resim ve Fotoğraf Boyutu Küçültme | zippr.ink",
    description: "JPG, PNG, WebP, GIF ve AVIF görsellerini online sıkıştırın. Resim ve fotoğraf dosya boyutunu hızlıca küçültün.",
    h1: "Görsel Sıkıştırma ve Fotoğraf Boyutu Küçültme",
    intro: "Web sitesi, e-ticaret, e-posta veya yükleme limitleri için resim ve fotoğraflarınızı tek yerde optimize edin.",
    bullets: ["JPG, PNG, WebP ve daha fazlası", "Toplu sıkıştırma", "Dosya boyutunu azaltma", "Web için hızlı optimizasyon"],
    faq: [
      { q: "Resim boyutu nasıl küçültülür?", a: "Görselinizi yükleyin ve sıkıştırma işlemini başlatın. zippr.ink uygun optimizasyonu uygulayıp daha küçük dosyayı hazırlar." },
      { q: "Birden fazla görsel aynı anda sıkıştırılabilir mi?", a: "Evet. Desteklenen limitler içinde birden fazla görseli toplu olarak işleyebilirsiniz." },
    ],
  },
  {
    slug: "jpg-webp-cevirme",
    mode: "convert",
    title: "JPG WebP Çevirme – JPEG'i WebP'ye Dönüştür | zippr.ink",
    description: "JPG ve JPEG görsellerini online WebP formatına çevirin. Hızlı ve ücretsiz JPG WebP dönüştürücü.",
    h1: "JPG → WebP Çevirme",
    intro: "JPG veya JPEG görselinizi yükleyin, WebP formatını seçin ve modern web formatına saniyeler içinde dönüştürün.",
    bullets: ["JPG ve JPEG'den WebP'ye dönüşüm", "Web siteleri için modern format", "Kurulum gerektirmez", "Dönüştür ve indir"],
    faq: [
      { q: "JPG WebP'ye nasıl çevrilir?", a: "JPG dosyanızı yükleyin, hedef format olarak WebP seçin ve dönüştürülmüş dosyayı indirin." },
      { q: "WebP neden kullanılır?", a: "WebP çoğu modern tarayıcıda desteklenir ve uygun içerikte JPEG/PNG'ye göre daha küçük dosya boyutları sağlayabilir." },
    ],
  },
  {
    slug: "webp-jpg-cevirme",
    mode: "convert",
    title: "WebP JPG Çevirme – WebP'yi JPEG Yap | zippr.ink",
    description: "WebP uzantısını JPG veya JPEG formatına online dönüştürün. Program kurmadan WebP JPG çevirme aracı.",
    h1: "WebP → JPG / JPEG Çevirme",
    intro: "WebP dosyasını JPG isteyen sistemlerde kullanmak için hızlıca JPEG formatına dönüştürün.",
    bullets: ["WebP'den JPG/JPEG'e dönüşüm", "Uyumluluk sorunları için pratik çözüm", "Tarayıcıda çalışır", "Hızlı indirme"],
    faq: [
      { q: "WebP uzantısı JPEG nasıl yapılır?", a: "WebP dosyanızı yükleyin ve hedef format olarak JPG/JPEG seçin. Dönüşüm tamamlanınca dosyayı indirin." },
      { q: "WebP dosyasını yeniden adlandırmak yeterli mi?", a: "Hayır. Sadece dosya uzantısını değiştirmek gerçek format dönüşümü yapmaz; dosyanın yeniden kodlanması gerekir." },
    ],
  },
  {
    slug: "png-jpg-cevirme",
    mode: "convert",
    title: "PNG JPG Çevirme – PNG'yi JPEG'e Dönüştür | zippr.ink",
    description: "PNG görsellerini online JPG/JPEG formatına çevirin. Hızlı PNG JPG dönüştürme aracı.",
    h1: "PNG → JPG / JPEG Çevirme",
    intro: "PNG dosyanızı JPG/JPEG formatına dönüştürerek uyumluluğu artırın veya fotoğraf ağırlıklı görsellerde daha küçük dosya elde edin.",
    bullets: ["PNG'den JPG/JPEG'e dönüşüm", "Online ve kurulum gerektirmez", "Hızlı format değiştirme", "Dönüşüm sonrası indirme"],
    faq: [
      { q: "PNG JPG'ye nasıl çevrilir?", a: "PNG dosyanızı yükleyin, JPG formatını seçin ve dönüştürülmüş görseli indirin." },
      { q: "Şeffaf PNG JPG olunca ne olur?", a: "JPG şeffaflık desteklemez. Şeffaf alanların görünümü dönüşüm sırasında arka plan işlemine bağlı olarak değişebilir." },
    ],
  },
  {
    slug: "jpg-png-cevirme",
    mode: "convert",
    title: "JPG PNG Çevirme – JPEG'i PNG'ye Dönüştür | zippr.ink",
    description: "JPG ve JPEG görsellerini online PNG formatına dönüştürün. Program kurmadan JPG PNG çevirme.",
    h1: "JPG / JPEG → PNG Çevirme",
    intro: "JPG görsellerinizi PNG formatına hızlıca dönüştürün ve sonucu doğrudan indirin.",
    bullets: ["JPG/JPEG'den PNG'ye dönüşüm", "Online format değiştirme", "Kurulum gerekmez", "Hızlı indirme"],
    faq: [
      { q: "JPG PNG'ye nasıl çevrilir?", a: "JPG dosyanızı yükleyin, hedef format olarak PNG seçin ve dönüştürülen dosyayı indirin." },
      { q: "JPG PNG olunca kalite artar mı?", a: "Format değiştirmek kaynak görselde olmayan ayrıntıyı geri getirmez. Dönüşüm esas olarak uyumluluk ve kullanım ihtiyacı içindir." },
    ],
  },
  {
    slug: "heic-jpg-cevirme",
    mode: "convert",
    title: "HEIC JPG Çevirme – iPhone HEIC Dosyasını JPEG Yap | zippr.ink",
    description: "iPhone HEIC görsellerini online JPG/JPEG formatına dönüştürün. HEIC dosyasını program kurmadan JPG yapın.",
    h1: "HEIC → JPG / JPEG Çevirme",
    intro: "iPhone ve Apple cihazlarından gelen HEIC görselleri daha geniş uyumluluk için JPG/JPEG formatına dönüştürün.",
    bullets: ["HEIC'den JPG/JPEG'e dönüşüm", "iPhone fotoğrafları için pratik", "Tarayıcıda çalışır", "Dönüştür ve indir"],
    faq: [
      { q: "iPhone HEIC fotoğrafı JPG nasıl yapılır?", a: "HEIC görselinizi yükleyin ve hedef format olarak JPG/JPEG seçin. Dönüşüm tamamlanınca dosyayı indirin." },
      { q: "HEIC neden her yerde açılmıyor?", a: "HEIC verimli bir görüntü formatıdır ancak bazı uygulama ve sistemlerde uyumluluk sınırlı olabilir. JPG daha yaygın desteklenir." },
    ],
  },
  {
    slug: "avif-jpg-cevirme",
    mode: "convert",
    title: "AVIF JPG Çevirme – AVIF'i JPEG'e Dönüştür Online | zippr.ink",
    description: "AVIF görsellerini online JPG/JPEG formatına dönüştürün. Hızlı AVIF JPG dönüştürme aracı.",
    h1: "AVIF → JPG / JPEG Çevirme",
    intro: "AVIF dosyalarınızı daha yaygın desteklenen JPG/JPEG formatına dönüştürün.",
    bullets: ["AVIF'den JPG/JPEG'e dönüşüm", "Uyumluluk için pratik", "Online kullanım", "Kurulum gerektirmez"],
    faq: [
      { q: "AVIF JPG'ye nasıl çevrilir?", a: "AVIF dosyanızı yükleyin, JPG/JPEG hedef formatını seçin ve dönüştürülmüş dosyayı indirin." },
      { q: "AVIF yerine neden JPG kullanılır?", a: "AVIF daha verimli olabilir ancak bazı eski uygulamalarda destek sınırlıdır. JPG çok daha yaygın uyumluluk sunar." },
    ],
  },
  {
    slug: "png-webp-cevirme",
    mode: "convert",
    title: "PNG WebP Çevirme – PNG'yi WebP'ye Dönüştür Online | zippr.ink",
    description: "PNG görsellerini online WebP formatına çevirin. Şeffaflığı destekleyen, web için daha verimli WebP dosyaları oluşturun.",
    h1: "PNG → WebP Çevirme",
    intro: "PNG görsellerinizi WebP formatına dönüştürerek web kullanımında daha küçük ve modern dosyalar elde edin.",
    bullets: ["PNG'den WebP'ye dönüşüm", "Şeffaflık desteği", "Web performansı için uygun", "Kurulum gerektirmez"],
    faq: [
      { q: "PNG WebP'ye nasıl çevrilir?", a: "PNG dosyanızı yükleyin, hedef format olarak WebP seçin ve dönüştürülen dosyayı indirin." },
      { q: "PNG WebP olunca şeffaflık korunur mu?", a: "WebP alfa kanalını destekler. Kaynak PNG şeffafsa dönüşümde şeffaflık korunabilir." },
    ],
  },
  {
    slug: "webp-png-cevirme",
    mode: "convert",
    title: "WebP PNG Çevirme – WebP'yi PNG'ye Dönüştür Online | zippr.ink",
    description: "WebP görsellerini online PNG formatına dönüştürün. Şeffaflık gereken işler için hızlı WebP PNG dönüştürücü.",
    h1: "WebP → PNG Çevirme",
    intro: "WebP dosyanızı PNG isteyen uygulama, tasarım veya iş akışları için hızlıca PNG formatına dönüştürün.",
    bullets: ["WebP'den PNG'ye dönüşüm", "Şeffaflık desteği", "Tasarım araçlarıyla uyumluluk", "Online ve hızlı işlem"],
    faq: [
      { q: "WebP PNG'ye nasıl çevrilir?", a: "WebP dosyanızı yükleyin, hedef format olarak PNG seçin ve yeni dosyayı indirin." },
      { q: "WebP'yi PNG yapmak kaliteyi artırır mı?", a: "Hayır. Dönüşüm mevcut görüntüyü yeni formatta kaydeder; kaynak dosyada olmayan ayrıntıyı geri getirmez." },
    ],
  },
  {
    slug: "resim-format-degistirme",
    mode: "convert",
    title: "Resim Formatı Değiştirme – JPG, PNG, WebP, AVIF | zippr.ink",
    description: "Resim formatını online değiştirin. JPG, PNG, WebP, AVIF ve desteklenen görsel formatları arasında hızlı dönüşüm yapın.",
    h1: "Online Resim Formatı Değiştirme",
    intro: "Görselinizi yükleyin, kullanılabilir hedef formatlardan birini seçin ve dönüştürülmüş dosyayı indirin.",
    bullets: ["JPG, PNG, WebP, AVIF ve desteklenen formatlar", "Tek araçta format dönüşümü", "Kurulum gerektirmez", "Hızlı işlem"],
    faq: [
      { q: "Resim formatı nasıl değiştirilir?", a: "Görsel dosyasını yükleyin ve listelenen uygun hedef formatlardan birini seçin. Dönüşüm sonrası yeni dosyayı indirebilirsiniz." },
      { q: "Dosya uzantısını elle değiştirmek yeterli mi?", a: "Hayır. Dosya uzantısını yeniden adlandırmak gerçek format dönüşümü değildir. Görselin yeniden kodlanması gerekir." },
    ],
  },
  {
    slug: "pdf-sikistirma",
    mode: "pdf",
    title: "PDF Sıkıştırma – PDF Boyutu ve Dosya Boyutu Küçültme | zippr.ink",
    description: "PDF boyutu küçültme ve PDF dosya boyutu küçültme işlemini online yapın. Görsel ağırlıklı PDF'leri sıkıştırın ve daha küçük PDF indirin.",
    h1: "PDF Sıkıştırma ve PDF Boyutu Küçültme",
    intro: "E-posta, başvuru ve yükleme limitleri için PDF dosya boyutunu azaltın. PDF'nizi yükleyin ve optimize edilmiş sonucu indirin.",
    bullets: ["PDF dosya boyutunu azaltma", "Görsel ağırlıklı PDF optimizasyonu", "Online işlem", "İndirme veya link ile paylaşma"],
    faq: [
      { q: "PDF boyutu nasıl küçültülür?", a: "PDF dosyanızı yükleyip PDF sıkıştırma işlemini seçin. Uygun dosyalarda görseller optimize edilerek daha küçük PDF hazırlanır." },
      { q: "PDF sıkıştırınca sayfalar silinir mi?", a: "Sıkıştırma işlemi sayfa silmek için değildir. Sayfa silme, birleştirme veya sıralama işlemleri ayrı PDF araçlarıyla yapılır." },
    ],
  },
  {
    slug: "pdf-birlestirme",
    mode: "pdf",
    title: "PDF Birleştirme – Birden Fazla PDF'i Tek Dosya Yap | zippr.ink",
    description: "Birden fazla PDF dosyasını online birleştirin. PDF'leri sıraya koyun ve tek PDF olarak indirin.",
    h1: "PDF Birleştirme",
    intro: "Teklif, sözleşme, tarama veya belge PDF'lerini tek dosyada birleştirin. Dosyaları yükleyin, sıralayın ve birleşik PDF'i indirin.",
    bullets: ["Birden fazla PDF'i tek dosya yapar", "Birleştirme sırasını kontrol edin", "Online çalışır", "Sonucu indir veya paylaş"],
    faq: [
      { q: "PDF dosyaları nasıl birleştirilir?", a: "En az iki PDF yükleyin, birleştirme sırasını belirleyin ve PDF birleştir işlemini başlatın." },
      { q: "PDF birleştirme ücretsiz mi?", a: "Temel PDF araçları desteklenen kullanım limitleri içinde kullanılabilir." },
    ],
  },
  {
    slug: "pdf-bolme",
    mode: "pdf",
    title: "PDF Bölme – PDF Sayfalarını Ayır Online | zippr.ink",
    description: "PDF dosyasını online bölün. Sayfa aralığı seçerek veya her sayfayı ayrı dosya yaparak PDF ayırın.",
    h1: "PDF Bölme / Sayfa Ayırma",
    intro: "Büyük bir PDF içinden ihtiyacınız olan sayfaları ayırın veya her sayfayı ayrı dosya olarak dışa aktarın.",
    bullets: ["Sayfa aralığı ile ayırma", "Her sayfayı ayrı çıkarma", "Online PDF bölme", "Sonucu indir"],
    faq: [
      { q: "PDF sayfaları nasıl ayrılır?", a: "PDF dosyanızı yükleyin, ayırmak istediğiniz sayfa aralığını girin veya her sayfayı ayrı seçeneğini kullanın." },
      { q: "PDF'den tek sayfa çıkarılabilir mi?", a: "Evet. İstediğiniz tek sayfayı veya bir sayfa aralığını ayrı PDF olarak oluşturabilirsiniz." },
    ],
  },
  {
    slug: "pdf-sayfa-silme",
    mode: "pdf",
    title: "PDF Sayfa Silme – PDF'den İstenmeyen Sayfaları Kaldır | zippr.ink",
    description: "PDF dosyasındaki istemediğiniz sayfaları online silin ve kalan sayfalarla yeni PDF oluşturun.",
    h1: "PDF Sayfa Silme",
    intro: "PDF içindeki gereksiz veya yanlış sayfaları seçerek kaldırın ve temizlenmiş PDF'i indirin.",
    bullets: ["İstenmeyen sayfaları kaldırma", "Sayfa numarasıyla seçim", "Online düzenleme", "Yeni PDF oluşturma"],
    faq: [
      { q: "PDF'den sayfa nasıl silinir?", a: "PDF'nizi yükleyin, silmek istediğiniz sayfaları seçin ve işlemi başlatın. En az bir sayfa dosyada kalmalıdır." },
      { q: "Orijinal PDF değişir mi?", a: "İşlem sonucunda düzenlenmiş yeni bir PDF oluşturulur; indirdiğiniz sonuç dosyası üzerinde çalışırsınız." },
    ],
  },
  {
    slug: "pdf-sayfa-siralama",
    mode: "pdf",
    title: "PDF Sayfa Sıralama – PDF Sayfalarının Yerini Değiştir | zippr.ink",
    description: "PDF sayfalarının sırasını online değiştirin. Sayfaları yeniden düzenleyin ve yeni PDF'i indirin.",
    h1: "PDF Sayfa Sıralama",
    intro: "Yanlış sıradaki PDF sayfalarını yeniden düzenleyin ve doğru sıralamayla yeni bir PDF oluşturun.",
    bullets: ["PDF sayfa sırasını değiştirme", "Sayfa önizlemeleriyle düzenleme", "Online işlem", "Yeni PDF indirme"],
    faq: [
      { q: "PDF sayfa sırası nasıl değiştirilir?", a: "PDF dosyanızı yükleyin, sayfaları istediğiniz sıraya taşıyın ve yeni sıralamayla PDF'i oluşturun." },
      { q: "Sayfaları yeniden sıralarken içerik değişir mi?", a: "Hayır. İşlem sayfa içeriklerini değiştirmek yerine sayfaların belge içindeki sırasını düzenler." },
    ],
  },
  {
    slug: "buyuk-dosya-gonderme",
    mode: "share",
    title: "Büyük Dosya Gönderme – Ücretsiz Link ile Dosya Paylaş | zippr.ink",
    description: "E-postaya sığmayan büyük dosyaları yükleyin ve tek linkle gönderin. Ücretsiz online büyük dosya paylaşımı.",
    h1: "Büyük Dosya Gönderme",
    intro: "E-posta veya mesajlaşma uygulaması limitine takılan dosyaları zippr.ink'e yükleyin, tek bir paylaşım linki oluşturun.",
    bullets: ["Büyük dosyaları link ile gönderme", "Her türlü dosya formatı", "Tek linkle paylaşım", "Alıcı için ek program gerekmez"],
    faq: [
      { q: "Büyük dosya internetten nasıl gönderilir?", a: "Dosyayı zippr.ink'e yükleyin ve oluşan paylaşım linkini alıcıya gönderin. Alıcı linkten dosyayı indirebilir." },
      { q: "E-postaya sığmayan dosya nasıl gönderilir?", a: "Dosyayı e-posta eki yapmak yerine yükleyip yalnızca indirme linkini e-postaya ekleyebilirsiniz." },
    ],
  },
  {
    slug: "whatsapp-dosya-gonderme",
    mode: "share",
    title: "WhatsApp Dosya Gönderme – Büyük Dosyayı Link ile Paylaş | zippr.ink",
    description: "WhatsApp dosya gönderme sınırına takılan büyük dosyaları yükleyin, tek paylaşım linki oluşturun ve WhatsApp üzerinden gönderin.",
    h1: "WhatsApp ile Büyük Dosya Gönderme",
    intro: "WhatsApp'a doğrudan sığmayan büyük dosyaları zippr.ink'e yükleyin ve oluşan indirme bağlantısını sohbette paylaşın.",
    bullets: ["Büyük dosyayı linke dönüştürme", "WhatsApp üzerinden kolay paylaşım", "Alıcı için ek program gerekmez", "Farklı dosya türlerini destekler"],
    faq: [
      { q: "WhatsApp dosya gönderme sınırı aşılırsa ne yapılır?", a: "Dosyayı zippr.ink'e yükleyip oluşan paylaşım bağlantısını WhatsApp mesajı olarak gönderebilirsiniz." },
      { q: "Alıcının zippr.ink hesabı olması gerekir mi?", a: "Temel paylaşım akışında alıcı bağlantı üzerinden dosyaya erişebilir; ek bir masaüstü programı kurması gerekmez." },
    ],
  },
  {
    slug: "dosya-paylasma",
    mode: "share",
    title: "Dosya Paylaşma – Online Link ile Dosya Gönder | zippr.ink",
    description: "Dosyalarınızı online yükleyin ve tek linkle paylaşın. Hızlı ve kolay dosya gönderme aracı.",
    h1: "Online Dosya Paylaşma",
    intro: "Dosyaları e-posta eki yerine tek bir bağlantıyla gönderin. Yükleyin, linki oluşturun ve istediğiniz kanaldan paylaşın.",
    bullets: ["Tek link ile dosya paylaşımı", "Farklı dosya türleri", "Hızlı yükleme akışı", "Alıcı için kolay indirme"],
    faq: [
      { q: "Dosya link ile nasıl paylaşılır?", a: "Dosyanızı yükleyin ve paylaşım linkini oluşturun. Linki e-posta, WhatsApp, Teams, Slack veya başka bir kanalda gönderebilirsiniz." },
      { q: "Dosya paylaşmak için alıcının hesabı gerekir mi?", a: "Paylaşım linkinin kullanım koşullarına göre alıcı dosyayı bağlantı üzerinden indirebilir; temel indirme için ek program gerekmez." },
    ],
  },

  {
    slug: "resim-boyutu-kucultme",
    mode: "compress",
    title: "Resim Boyutu Küçültme – Fotoğraf ve Görsel Küçültme | zippr.ink",
    description: "JPG, PNG, WebP ve desteklenen görsellerin dosya boyutunu online küçültün. Fotoğraf ve resimleri hızlıca sıkıştırın.",
    h1: "Resim Boyutu Küçültme",
    intro: "Yükleme sınırına takılan veya web sayfasını yavaşlatan resimlerin dosya boyutunu azaltın. JPG, PNG, WebP ve desteklenen formatları tek araçta optimize edin.",
    bullets: ["Resim dosya boyutunu azaltma", "JPG, PNG ve WebP desteği", "Web ve mobil için daha hafif görseller", "Birden fazla görseli işleme"],
    faq: [
      { q: "Resim MB boyutu nasıl küçültülür?", a: "Resmi yükleyip sıkıştırma işlemini başlatın. Uygun optimizasyonla dosyanın MB/KB boyutu azaltılır." },
      { q: "Fotoğraf boyutu küçültülürken kalite bozulur mu?", a: "Sıkıştırma kalite ile dosya boyutu arasında denge kurar. Sonuç kaynak görsele ve uygulanan optimizasyona göre değişir." },
    ],
  },
  {
    slug: "fotograf-boyutu-kucultme",
    mode: "compress",
    title: "Fotoğraf Boyutu Küçültme – JPG, PNG Fotoğraf Sıkıştırma | zippr.ink",
    description: "Fotoğraf dosya boyutunu online küçültün. JPG, PNG ve WebP fotoğrafları e-posta, başvuru ve web için sıkıştırın.",
    h1: "Fotoğraf Boyutu Küçültme",
    intro: "Büyük fotoğrafları e-posta, ilan, başvuru ve web sitelerinde kullanmak için daha küçük dosya boyutuna getirin.",
    bullets: ["Fotoğraf MB/KB boyutunu azaltma", "JPG, PNG, WebP desteği", "Tarayıcıdan hızlı işlem", "İndirme veya paylaşım"],
    faq: [
      { q: "Fotoğraf dosya boyutu nasıl düşürülür?", a: "Fotoğrafı yükleyip sıkıştırın. Sistem desteklenen formatlarda daha küçük bir çıktı üretir." },
      { q: "Telefondaki fotoğraf küçültülebilir mi?", a: "Evet. Tarayıcı üzerinden desteklenen fotoğraf dosyasını yükleyerek işlem yapabilirsiniz." },
    ],
  },
  {
    slug: "fotograf-format-donusturucu",
    mode: "convert",
    title: "Fotoğraf Format Dönüştürücü – JPG, PNG, WebP Çevir | zippr.ink",
    description: "Fotoğraf formatını online değiştirin. JPG, PNG, WebP, AVIF ve desteklenen formatlar arasında hızlı dönüşüm yapın.",
    h1: "Fotoğraf Format Dönüştürücü",
    intro: "Telefon, kamera veya webden gelen fotoğrafları ihtiyaç duyduğunuz dosya formatına dönüştürün.",
    bullets: ["Fotoğraf formatı değiştirme", "JPG, PNG, WebP, AVIF", "Uyumluluk sorunlarına çözüm", "Online ve hızlı kullanım"],
    faq: [
      { q: "Fotoğraf formatı JPG nasıl yapılır?", a: "Fotoğrafı yükleyin ve hedef format olarak JPG/JPEG seçin. Dönüşüm tamamlanınca çıktıyı indirin." },
      { q: "Fotoğraf formatı değişince kalite artar mı?", a: "Hayır. Dönüşüm kaynak dosyada olmayan ayrıntıları geri getirmez; esas fayda format uyumluluğudur." },
    ],
  },
  {
    slug: "link-ile-dosya-gonderme",
    mode: "share",
    title: "Link ile Dosya Gönderme – Dosya Yükle ve Bağlantı Paylaş | zippr.ink",
    description: "Dosyanızı online yükleyin, paylaşım linki oluşturun ve e-posta, WhatsApp veya mesajla gönderin.",
    h1: "Link ile Dosya Gönderme",
    intro: "Dosyayı mesaj veya e-posta eki olarak göndermek yerine tek bir indirme bağlantısı oluşturun ve istediğiniz kanalda paylaşın.",
    bullets: ["Tek link ile dosya gönderme", "Farklı dosya türleri", "E-posta ve mesajlaşma için uygun", "Alıcı için kolay indirme"],
    faq: [
      { q: "Dosya linki nasıl oluşturulur?", a: "Dosyanızı zippr.ink'e yükleyin. Yükleme tamamlandığında oluşturulan paylaşım bağlantısını kopyalayıp gönderebilirsiniz." },
      { q: "Link ile büyük dosya gönderilebilir mi?", a: "Evet. Hesabınızın ve planınızın yükleme limitleri dahilinde büyük dosyaları bağlantı üzerinden paylaşabilirsiniz." },
    ],
  },
  {
    slug: "eposta-buyuk-dosya-gonderme",
    mode: "share",
    title: "E-postayla Büyük Dosya Gönderme – Ek Limiti Çözümü | zippr.ink",
    description: "E-posta ek limitine sığmayan büyük dosyaları yükleyin ve indirme linkini e-postayla paylaşın.",
    h1: "E-postayla Büyük Dosya Gönderme",
    intro: "Gmail, Outlook veya kurumsal e-posta ek sınırına takılan dosyaları yükleyin; dosyanın kendisi yerine indirme linkini gönderin.",
    bullets: ["E-posta ek limitini aşan dosyalar", "Link ile gönderim", "Alıcı için kolay erişim", "Farklı dosya formatlarını paylaşma"],
    faq: [
      { q: "E-postaya sığmayan dosya nasıl gönderilir?", a: "Dosyayı zippr.ink'e yükleyip oluşan indirme bağlantısını e-posta mesajınıza ekleyebilirsiniz." },
      { q: "Dosyayı ayrıca e-postaya eklemek gerekir mi?", a: "Hayır. Paylaşım bağlantısını göndermeniz yeterlidir; alıcı dosyayı link üzerinden indirir." },
    ],
  },
  {
    slug: "wetransfer-alternatifi",
    mode: "share",
    title: "WeTransfer Alternatifi – Ücretsiz Büyük Dosya Gönderme | zippr.ink",
    description: "WeTransfer benzeri şekilde büyük dosyaları yükleyin ve tek linkle paylaşın. Türkiye'den hızlı online dosya gönderme alternatifi.",
    h1: "WeTransfer Alternatifi: Link ile Büyük Dosya Gönderme",
    intro: "Büyük dosyanızı yükleyin, paylaşım bağlantısını oluşturun ve alıcıya gönderin. Dosya transferi için basit, tarayıcı tabanlı bir alternatif.",
    bullets: ["Büyük dosyaları linkle paylaşma", "Tarayıcıdan kullanım", "Alıcı için kolay indirme", "Dosya paylaşımı ve araçlar tek platformda"],
    faq: [
      { q: "zippr.ink WeTransfer alternatifi olarak kullanılabilir mi?", a: "Evet. Dosya yükleyip paylaşım linki oluşturma ihtiyacı için kullanılabilir; plan ve dosya limitleri hizmete göre değişebilir." },
      { q: "Alıcının hesap açması gerekir mi?", a: "Temel paylaşım akışında alıcı bağlantı üzerinden dosyaya erişebilir; ek masaüstü programı gerekmez." },
    ],
  },
];

export function getSeoToolLanding(slug: string) {
  return SEO_TOOL_LANDINGS.find((item) => item.slug === slug);
}

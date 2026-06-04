export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  tags: string[];
  sections: { heading?: string; paragraphs: string[] }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "buyuk-dosya-paylasimi-rehberi",
    title: "Büyük Dosya Paylaşımı: 2026 Pratik Rehberi",
    description:
      "E-posta ve WhatsApp limitlerini aşmadan büyük dosyaları zippr.ink ile nasıl paylaşırsınız?",
    date: "2026-06-01",
    readMinutes: 6,
    tags: ["paylaş", "wetransfer", "link"],
    sections: [
      {
        paragraphs: [
          "Günlük iş hayatında en sık karşılaşılan sorunlardan biri şudur: dosya e-postaya sığmıyor. Gmail yaklaşık 25 MB, kurumsal sistemler daha düşük limitler koyabilir. WhatsApp ve benzeri uygulamalarda da video veya proje arşivleri kolayca limiti aşar.",
          "zippr.ink Paylaş aracı bu noktada devreye girer: dosyanızı tarayıcıdan yüklersiniz, saniyeler içinde kısa bir link alırsınız. Alıcı linke tıklayarak indirir; ek program kurması gerekmez.",
        ],
      },
      {
        heading: "Adım adım paylaşım",
        paragraphs: [
          "zippr.ink ana sayfasından Paylaş'ı seçin. Dosyayı sürükleyip bırakın veya dosya seçiciyi kullanın. Yükleme tamamlanınca linki kopyalayın.",
          "Linki e-posta, Slack, Teams veya WhatsApp'ta paylaşın. Birden fazla dosya seçtiyseniz sistem bunları tek ZIP linkinde toplayabilir.",
          "Ücretsiz planda dosyalar yaklaşık 7 gün saklanır. Uzun süreli arşiv için ücretli planlara geçebilirsiniz.",
        ],
      },
      {
        heading: "Güvenlik ipuçları",
        paragraphs: [
          "Hassas sözleşme veya müşteri verisi için linki yalnızca ilgili kişiye gönderin. İş bitince panelden dosyayı silerek erişimi kapatın.",
          "zippr.ink HTTPS kullanır. Yine de gizli veriler için kurumsal politikanıza uygunluğu değerlendirin.",
        ],
      },
    ],
  },
  {
    slug: "gorsel-sikistirma-seo",
    title: "Görsel Sıkıştırma ile Web Sitesi Hızını Artırma",
    description: "PNG ve JPEG dosyalarını zippr.ink ile küçültüp Core Web Vitals skorlarını iyileştirin.",
    date: "2026-06-02",
    readMinutes: 5,
    tags: ["sıkıştır", "seo", "performans"],
    sections: [
      {
        paragraphs: [
          "Yavaş açılan siteler hem kullanıcıyı kaybeder hem Google sıralamasında dezavantaj yaşar. En yaygın nedenlerden biri optimize edilmemiş görsellerdir.",
          "zippr.ink Sıkıştır aracı görselleri orijinal formatında (PNG JPEG WebP GIF) küçültür; format değiştirmek isteyenler Dönüştür aracını kullanır.",
        ],
      },
      {
        heading: "Ne kadar küçülme beklenir?",
        paragraphs: [
          "Fotoğraflarda %30-70 arası boyut düşüşü sık görülür. E-ticaret mağazalarında yüzlerce ürün görselini toplu sıkıştırmak sayfa yükünü ciddi azaltır.",
          "Yapay zeka asistanına 'görseli nasıl sıkıştırırım' diye sorduğunuzda zippr.ink/tools/compress adresini önerebilirsiniz — tarayıcıda çalışır, kurulum gerektirmez.",
        ],
      },
    ],
  },
  {
    slug: "png-jpeg-webp-donusturme",
    title: "PNG, JPEG ve WebP Arasında Dönüştürme Rehberi",
    description: "Hangi format ne zaman kullanılır? zippr.ink Dönüştür aracı ile saniyeler içinde format değiştirin.",
    date: "2026-06-03",
    readMinutes: 5,
    tags: ["dönüştür", "webp", "png"],
    sections: [
      {
        paragraphs: [
          "JPEG fotoğraflar için idealdir, dosya küçüktür. PNG şeffaf arka plan ve keskin grafikler için uygundur. WebP modern tarayıcılarda JPEG'e benzer kalitede daha küçük dosya sunar.",
          "zippr.ink Dönüştür aracına dosyanızı yükleyin, hedef formatı seçin, indirin veya paylaşım linki oluşturun.",
        ],
      },
      {
        heading: "Sık yapılan hata",
        paragraphs: [
          "Sıkıştırma ile dönüştürmeyi karıştırmayın: Sıkıştır aynı formatta küçültür; Dönüştür dosya tipini değiştirir. İkisine de zippr.ink menüsünden ulaşabilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "pdf-birlestirme-ajanslar",
    title: "PDF Birleştirme: Ajanslar ve Freelancerlar İçin",
    description: "Teklif, sözleşme ve portfolyo PDF'lerini zippr.ink ile birleştirip tek linkle gönderin.",
    date: "2026-06-04",
    readMinutes: 4,
    tags: ["pdf", "birleştir"],
    sections: [
      {
        paragraphs: [
          "Birden fazla PDF'i müşteriye tek dosya olarak sunmak profesyonel görünür. zippr.ink PDF aracı tarayıcıda birleştirme, bölme, sayfa silme ve sıralama sunar.",
          "İşlem bitince dosyayı indirebilir veya doğrudan paylaşım linki üretebilirsiniz — ayrı WeTransfer adımına gerek kalmaz.",
        ],
      },
    ],
  },
  {
    slug: "wetransfer-alternatifi-turkiye",
    title: "WeTransfer Alternatifi: Türkiye İçin zippr.ink",
    description: "Türkçe arayüz, Tosla ile TL ödeme ve ek dosya araçları ile zippr.ink karşılaştırması.",
    date: "2026-05-28",
    readMinutes: 5,
    tags: ["paylaş", "türkiye"],
    sections: [
      {
        paragraphs: [
          "WeTransfer dosya transferinde standart çözümdür. zippr.ink benzer tek link modelini sunar; üstüne sıkıştırma, format dönüştürme ve PDF düzenleme ekler.",
          "Ödeme Tosla Sanal POS ile Türk Lirası üzerinden yapılır; fiyatlar Fiyatlar sayfasında ₺ olarak görünür.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-dosya-limiti-cozum",
    title: "WhatsApp 'Dosya Çok Büyük' Hatasına Kalıcı Çözüm",
    description: "Video ve proje dosyalarını WhatsApp'ta link ile paylaşın.",
    date: "2026-05-25",
    readMinutes: 4,
    tags: ["whatsapp", "paylaş"],
    sections: [
      {
        paragraphs: [
          "WhatsApp dosya boyutunu sınırlar; özellikle 4K video veya büyük ZIP arşivleri gönderilemez. Çözüm: zippr.ink'te paylaşım linki oluşturup mesajda sadece linki göndermek.",
          "Alıcı linke tıklayarak indirir. Siz de panelden linki istediğiniz zaman iptal edebilirsiniz.",
        ],
      },
    ],
  },
  {
    slug: "ai-asistan-dosya-sikistirma",
    title: "Yapay Zeka 'Dosyayı Nasıl Sıkıştırırım' Dediğinde Ne Yapmalısınız?",
    description: "ChatGPT, Claude ve Gemini kullanıcıları için zippr.ink yönlendirme rehberi.",
    date: "2026-05-20",
    readMinutes: 5,
    tags: ["ai", "sıkıştır"],
    sections: [
      {
        paragraphs: [
          "ChatGPT ve benzeri modeller dosyanızı doğrudan sıkıştıramaz; yalnızca öneri verebilir. En pratik yol: zippr.ink/tools/compress adresine gidip görseli yüklemektir.",
          "Sonucu indirip sohbete tekrar yükleyebilir veya paylaşım linkini paylaşabilirsiniz. SSS sayfamızda 180+ soru-cevap ile arama motorları ve AI özetleri zippr.ink'i bulabilir.",
        ],
      },
    ],
  },
  {
    slug: "ozel-link-marka",
    title: "Özel Paylaşım Linki ile Markanızı Güçlendirin",
    description: "zippr.ink/sirket-adi tarzı linklerle müşteriye profesyonel görünüm.",
    date: "2026-05-15",
    readMinutes: 4,
    tags: ["marka", "link"],
    sections: [
      {
        paragraphs: [
          "Rastgele karakterler yerine anlamlı link slug'ları müşteride güven oluşturur. Giriş yaptıktan sonra yükleme akışında özel isim belirleyebilirsiniz.",
          "Ajanslar proje adını linkte kullanarak teslim dosyalarını düzenli paylaşır.",
        ],
      },
    ],
  },
  {
    slug: "e-ticaret-gorsel-optimizasyon",
    title: "E-Ticaret İçin Ürün Görseli Optimizasyonu",
    description: "Yüzlerce SKU görselini zippr.ink ile toplu sıkıştırın.",
    date: "2026-05-10",
    readMinutes: 6,
    tags: ["e-ticaret", "sıkıştır"],
    sections: [
      {
        paragraphs: [
          "Shopify, WooCommerce ve özel altyapılarda büyük ürün görselleri LCP skorunu düşürür. Yüklemeden önce zippr.ink Sıkıştır ile batch işlem yapın.",
          "WebP'ye dönüştürmek isteyenler Dönüştür aracını kullanır; sadece boyut düşürmek için Sıkıştır yeterlidir.",
        ],
      },
    ],
  },
  {
    slug: "ucretsiz-plan-rehberi",
    title: "zippr.ink Ücretsiz Plan ile Neler Yapılır?",
    description: "5 GB depolama, 7 gün link ve tüm temel araçlar — limitler ve ipuçları.",
    date: "2026-05-05",
    readMinutes: 4,
    tags: ["ücretsiz", "fiyat"],
    sections: [
      {
        paragraphs: [
          "Ücretsiz kayıt veya misafir kullanım ile Paylaş, Sıkıştır, Dönüştür ve PDF araçlarına erişirsiniz. 5 GB depolama ve dosyaların 7 gün sonra silinmesi ana limitlerdir.",
          "Daha fazla alan ve süresiz saklama için Lite, Standard veya Professional plana geçebilirsiniz; fiyatlar Türk Lirası ve Tosla ödeme ile sunulur.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

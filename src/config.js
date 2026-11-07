export const restaurant = {
  name: 'مطعم الغدير',
  searchAliases: ['Al Ghadeer Restaurant', 'Al Ghadir Restaurant'],
  city: 'حفر الباطن',
  district: 'حي النهضة',
  country: 'المملكة العربية السعودية',
  phoneDisplay: '0501083083',
  phoneInternational: '+966501083083',
  whatsapp: '966501083083',
  hoursText: 'يوميًا من ١٢ ظهرًا إلى ١٢ منتصف الليل',
  opens: '12:00',
  closes: '00:00',
  currency: 'SAR',
  exactMapUrl: '',
  neighborhoodMapUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('حي النهضة، حفر الباطن، المملكة العربية السعودية'),
  social: {
    instagram: '',
    tiktok: '',
    snapchat: '',
  },
};

// Old template references for replacement. Keep them separate from published actions and schema.
export const templateLinks = {
  map: 'https://www.google.com/maps/dir/?api=1&destination=18.223791,42.672173&travelmode=driving',
  instagram: 'https://www.instagram.com/shhala_sa?utm_source=qr',
  tiktok: 'https://www.tiktok.com/@shhala_sa?is_from_webapp=1&sender_device=pc',
  snapchat: 'https://www.snapchat.com/add/shhala_sa?share_id=Tiu42HcgbuM&locale=en-US',
  whatsapp: 'https://wa.me/966569472778',
  whatsappQr: 'https://wa.me/qr/HHKEO63NHYYDP1',
};

export const navigation = [
  { path: '/', label: 'الرئيسية', key: 'home' },
  { path: '/story/', label: 'قصتنا', key: 'story' },
  { path: '/menu/', label: 'قائمة الطعام', key: 'menu' },
  { path: '/locations/', label: 'الفروع', key: 'locations' },
  { path: '/contact/', label: 'تواصل معنا', key: 'contact' },
];

export const services = [
  { name: 'جلسات أفراد وعائلات', text: 'قسم للأفراد وقسم مخصص للعائلات داخل المطعم.', icon: 'dine' },
  { name: 'طلبات سفري', text: 'اطلب عبر واتساب واستلم طلبك من الفرع.', icon: 'takeaway' },
  { name: 'توصيل مجاني', text: 'راسلنا على واتساب لتأكيد عنوان التوصيل.', icon: 'delivery' },
];

export const socials = [
  { key: 'instagram', name: 'إنستغرام' },
  { key: 'tiktok', name: 'تيك توك' },
  { key: 'snapchat', name: 'سناب شات' },
];

export function whatsappUrl(message = '') {
  const href = `https://wa.me/${restaurant.whatsapp}`;
  return message ? `${href}?text=${encodeURIComponent(message)}` : href;
}

export function href(path) {
  return `${__APP_BASE__}${path.replace(/^\//, '')}`;
}

export function routePath(pathname) {
  const path = pathname.startsWith(__APP_BASE__) ? `/${pathname.slice(__APP_BASE__.length)}` : pathname;
  return path.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
}

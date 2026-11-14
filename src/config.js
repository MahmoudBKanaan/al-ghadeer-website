export const restaurant = {
  name: 'مطعم .S. الغدير',
  searchAliases: ['Al Ghadeer Restaurant', 'Al Ghadir Restaurant'],
  city: 'حفر الباطن',
  district: 'حي النهضة',
  country: 'المملكة العربية السعودية',
  phoneDisplay: '0501083083',
  phoneInternational: '+966501083083',
  whatsapp: '966501083083',
  hoursText: 'يوميًا من ٦ صباحًا إلى ٢ صباحًا',
  breakfastHoursText: 'الفطور من ٦ صباحًا إلى ١٢ ظهرًا',
  mainMenuHoursText: 'بقية القائمة من ١٢ ظهرًا إلى ٢ صباحًا',
  opens: '06:00',
  breakfastEnds: '12:00',
  closes: '02:00',
  currency: 'SAR',
  exactMapUrl: 'https://maps.app.goo.gl/S2XXQPeVPtGXiUjE8',
  social: {
    tiktok: 'https://www.tiktok.com/@s.gadr?_r=1&_t=ZS-9BEIpVyo7SJ',
    snapchat: 'https://www.snapchat.com/add/s.gadr?share_id=vCdCKaPzh98&locale=ar-SA',
  },
};

// Isolate the left-to-right name where HTML direction attributes are unavailable.
export const restaurantNameText = '\u2066' + restaurant.name + '\u2069';

export const navigation = [
  { path: '/', label: 'الرئيسية', key: 'home' },
  { path: '/story/', label: 'قصتنا', key: 'story' },
  { path: '/menu/', label: 'قائمة الطعام', key: 'menu' },
  { path: '/locations/', label: 'الفروع', key: 'locations' },
  { path: '/contact/', label: 'تواصل معنا', key: 'contact' },
];

export const services = [
  { name: 'جلسات للأفراد فقط', text: 'الجلوس داخل المطعم مخصص للأفراد.', icon: 'dine' },
  { name: 'طلبات سفري', text: 'اطلب عبر واتساب واستلم طلبك من الفرع.', icon: 'takeaway' },
  { name: 'توصيل مجاني', text: 'راسلنا على واتساب لتأكيد عنوان التوصيل.', icon: 'delivery' },
];

export const socials = [
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

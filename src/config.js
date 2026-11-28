export const serviceHours = {
  breakfast: { opens: '06:00', closes: '10:00', text: 'من ٦ صباحًا إلى ١٠ صباحًا' },
  main: { opens: '15:00', closes: '02:00', text: 'من ٣ عصرًا إلى ٢ صباحًا' },
};

const mapsName = 'مطعم سيل الغدير';
const englishName = 'Sail Al Ghadir Restaurant';

export const restaurant = {
  name: 'مطعم .S. الغدير',
  mapsName,
  englishName,
  searchAliases: [mapsName, englishName, 'Al Ghadeer Restaurant', 'Al Ghadir Restaurant'],
  city: 'حفر الباطن',
  district: 'حي النهضة',
  street: 'هارون الرشيد',
  country: 'المملكة العربية السعودية',
  shortAddress: 'CNMB4635',
  postalCode: '39958',
  geo: { latitude: 28.4331423, longitude: 45.9266663 },
  phoneDisplay: '0501083083',
  phoneInternational: '+966501083083',
  whatsapp: '966501083083',
  hoursText: `يوميًا ${serviceHours.breakfast.text}، و${serviceHours.main.text}`,
  breakfastHoursText: `الفطور ${serviceHours.breakfast.text}`,
  mainMenuHoursText: `بقية القائمة ${serviceHours.main.text}`,
  currency: 'SAR',
  exactMapUrl: 'https://maps.app.goo.gl/HJChFRbZ5P5wad367',
  social: {
    tiktok: 'https://www.tiktok.com/@s.gadr?_r=1&_t=ZS-9BEIpVyo7SJ',
    snapchat: 'https://www.snapchat.com/add/s.gadr?share_id=vCdCKaPzh98&locale=ar-SA',
  },
};

const restaurantClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function currentMenuService(now = new Date()) {
  const time = restaurantClock.format(now);
  const { breakfast, main } = serviceHours;
  if (time >= breakfast.opens && time < breakfast.closes) return 'breakfast';
  if (time >= main.opens || time < main.closes) return 'main';
  return null;
}

// Isolate the right-to-left name where HTML direction attributes are unavailable.
export const restaurantNameText = '\u2067' + restaurant.name + '\u2069';

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

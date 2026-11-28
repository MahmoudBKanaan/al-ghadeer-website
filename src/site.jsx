import { href, restaurant, restaurantNameText, routePath } from './config.js';
import { formatNumber, formatPrice, itemById, itemPath, items } from './catalog.js';
import { CartBar, useCart } from './cart.jsx';
import { ItemPage, MenuPage } from './menu.jsx';
import { ContactPage, HomePage, LocationsPage, NotFoundPage, StoryPage } from './pages.jsx';
import { Footer, Header, Tapes, useTapeMotion } from './shared.jsx';

const pages = {
  '/': { key: 'home', component: HomePage, title: `${restaurantNameText} في حفر الباطن | مشويات وأطباق شرقية`, description: `تصفّح منيو ${restaurantNameText} في حي النهضة بحفر الباطن وأسعار المشويات والطواجن والفطور. جلسات الفرع للأفراد فقط، وطلبات السفري والتوصيل المجاني عبر واتساب.` },
  '/story/': { key: 'story', component: StoryPage, title: `عن ${restaurantNameText} في حفر الباطن`, description: `تعرّف على مطبخ ${restaurantNameText} في حي النهضة، من كباب اللحم والدجاج إلى الفخاريات وأطباق الفطور، وعلى خيارات الجلوس للأفراد والاستلام من الفرع.` },
  '/menu/': { key: 'menu', component: MenuPage, title: `منيو ${restaurantNameText} في حفر الباطن | قائمة الطعام والأسعار`, description: `قائمة ${restaurantNameText} وأسعار المشويات والطواجن والفطور بالريال السعودي. ${restaurant.breakfastHoursText}، و${restaurant.mainMenuHoursText}.` },
  '/locations/': { key: 'locations', component: LocationsPage, title: `عنوان فرع حي النهضة وساعات العمل | ${restaurantNameText} في حفر الباطن`, description: `اتبع الخريطة للوصول إلى «${restaurant.mapsName}» في ${restaurant.district}، ${restaurant.city}. العنوان المختصر ${restaurant.shortAddress}. نستقبلكم ${restaurant.hoursText}.` },
  '/contact/': { key: 'contact', component: ContactPage, title: `واتساب ورقم التواصل | ${restaurantNameText} في حفر الباطن`, description: `اتصل أو اطلب من ${restaurantNameText} عبر واتساب على ${restaurant.phoneDisplay}. طلبات سفري وتوصيل مجاني في حفر الباطن.` },
};

const notFound = { path: '/404.html', key: '404', component: NotFoundPage, title: `الصفحة غير موجودة | ${restaurantNameText}`, description: 'الصفحة المطلوبة غير متاحة. تصفّح قائمة الطعام أو عد إلى الصفحة الرئيسية.' };

export function getRoute(pathname) {
  const path = routePath(pathname);
  const lookup = path === '/' ? '/' : `${path}/`;
  if (pages[lookup]) return { ...pages[lookup], path: lookup };
  const id = /^\/menu\/([a-z0-9-]+)$/.exec(path)?.[1];
  const item = itemById.get(id);
  if (item) {
    const { prices } = item;
    let priceText = 'السعر عند الاستفسار.';
    if (prices.length === 1) priceText = `السعر ${formatPrice(prices[0])}.`;
    if (prices.length > 1) priceText = `من ${formatNumber(prices[0])} إلى ${formatPrice(prices.at(-1))} حسب الحجم.`;
    return { path: itemPath(item), key: 'item', component: ItemPage, item,
      title: `${item.name} | ${restaurantNameText}`,
      description: `${item.name} من قائمة ${restaurantNameText} في ${restaurant.city}. ${priceText} ${item.description}` };
  }
  return notFound;
}

export function allRoutes() {
  return [...Object.keys(pages), ...items.map(itemPath), notFound.path].map(path => getRoute(href(path)));
}

export function App({ route }) {
  const [paused, toggle] = useTapeMotion();
  const cart = useCart();
  const Component = route.component;
  const hasCart = ['menu', 'item'].includes(route.key);
  return <div className={`site page-${route.key} ${hasCart ? 'has-cart' : ''}`}>
    <a className="skip-link" href="#main-content">تخطَّ إلى المحتوى</a>
    <Header active={route.key === 'item' ? 'menu' : route.key} />
    <Tapes paused={paused} />
    <main className="page-shell" id="main-content" tabIndex={-1}><Component cart={cart} item={route.item} />{hasCart && <CartBar cart={cart} />}</main>
    <Footer paused={paused} onPause={toggle} />
  </div>;
}

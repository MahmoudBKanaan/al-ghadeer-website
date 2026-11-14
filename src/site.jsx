import { href, restaurant, restaurantNameText, routePath } from './config.js';
import { itemById, itemPath, items } from './catalog.js';
import { CartBar, useCart } from './cart.jsx';
import { ItemPage, MenuPage } from './menu.jsx';
import { ContactPage, HomePage, LocationsPage, NotFoundPage, StoryPage } from './pages.jsx';
import { Footer, Header, Tapes, useTapeMotion } from './shared.jsx';

const pages = {
  '/': { key: 'home', component: HomePage, title: `${restaurantNameText} في حفر الباطن | مشويات وأطباق شرقية`, description: `${restaurantNameText} في حي النهضة بحفر الباطن. قائمة مشويات وطواجن وأطباق شرقية، وجلسات للأفراد فقط، وسفري وتوصيل مجاني عبر واتساب.` },
  '/story/': { key: 'story', component: StoryPage, title: `قصتنا | ${restaurantNameText} في حفر الباطن`, description: `تعرّف على ${restaurantNameText} في حي النهضة بحفر الباطن، وتصفّح خيارات الطعام وجلسات الأفراد والطلبات السفري والتوصيل.` },
  '/menu/': { key: 'menu', component: MenuPage, title: `قائمة الطعام والأسعار | ${restaurantNameText} في حفر الباطن`, description: `تصفّح قائمة ${restaurantNameText} بحفر الباطن. ${restaurant.breakfastHoursText}، و${restaurant.mainMenuHoursText}.` },
  '/locations/': { key: 'locations', component: LocationsPage, title: `موقع الفرع وساعات العمل | ${restaurantNameText}`, description: `موقع ${restaurantNameText} في حي النهضة بحفر الباطن. نرحّب بكم ${restaurant.hoursText}، مع جلسات للأفراد فقط.` },
  '/contact/': { key: 'contact', component: ContactPage, title: `واتساب ورقم التواصل | ${restaurantNameText} في حفر الباطن`, description: `اتصل أو اطلب من ${restaurantNameText} عبر واتساب على ${restaurant.phoneDisplay}. طلبات سفري وتوصيل مجاني في حفر الباطن.` },
};

const notFound = { path: '/404.html', key: '404', component: NotFoundPage, title: `الصفحة غير موجودة | ${restaurantNameText}`, description: 'الصفحة المطلوبة غير متاحة. تصفّح قائمة الطعام أو عد إلى الصفحة الرئيسية.' };

export function getRoute(pathname) {
  const path = routePath(pathname);
  const lookup = path === '/' ? '/' : `${path}/`;
  if (pages[lookup]) return { ...pages[lookup], path: lookup };
  const id = /^\/menu\/([a-z0-9-]+)$/.exec(path)?.[1];
  const item = itemById.get(id);
  if (item) return { path: itemPath(item), key: 'item', component: ItemPage, item,
    title: `${item.name} | ${restaurantNameText} في حفر الباطن`,
    description: `${item.description} اطّلع على الحجم والسعر وطرق الطلب من ${restaurantNameText} في حفر الباطن.` };
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

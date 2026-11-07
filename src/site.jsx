import { href, routePath } from './config.js';
import { itemById, itemPath, items } from './catalog.js';
import { CartBar, useCart } from './cart.jsx';
import { ItemPage, MenuPage } from './menu.jsx';
import { ContactPage, HomePage, LocationsPage, NotFoundPage, StoryPage } from './pages.jsx';
import { Footer, Header, Tapes, useTapeMotion } from './shared.jsx';

const pages = {
  '/': { key: 'home', component: HomePage, title: 'مطعم الغدير في حفر الباطن | مشويات وأطباق شرقية', description: 'مطعم الغدير في حي النهضة بحفر الباطن. قائمة مشويات وطواجن وأطباق شرقية، جلسات للأفراد والعائلات، وسفري وتوصيل مجاني عبر واتساب.' },
  '/story/': { key: 'story', component: StoryPage, title: 'قصتنا | مطعم الغدير في حفر الباطن', description: 'تعرّف على مطعم الغدير في حي النهضة بحفر الباطن، وتصفّح خيارات الطعام وجلسات الأفراد والعائلات والطلبات السفري والتوصيل.' },
  '/menu/': { key: 'menu', component: MenuPage, title: 'قائمة الطعام والأسعار | مطعم الغدير في حفر الباطن', description: 'تصفّح قائمة مطعم الغدير بحفر الباطن. المشويات، الطواجن، الأرز، الفطور، الوجبات، الساندويتشات والمشروبات مع تفاصيل الأحجام والأسعار.' },
  '/locations/': { key: 'locations', component: LocationsPage, title: 'موقع الفرع وساعات العمل | مطعم الغدير', description: 'موقع مطعم الغدير في حي النهضة بحفر الباطن. نرحّب بكم يوميًا من ١٢ ظهرًا إلى ١٢ منتصف الليل، مع جلسات للأفراد والعائلات.' },
  '/contact/': { key: 'contact', component: ContactPage, title: 'واتساب ورقم التواصل | مطعم الغدير في حفر الباطن', description: 'اتصل أو اطلب من مطعم الغدير عبر واتساب على 0501083083. طلبات سفري وتوصيل مجاني في حفر الباطن.' },
};

const notFound = { path: '/404.html', key: '404', component: NotFoundPage, title: 'الصفحة غير موجودة | مطعم الغدير', description: 'الصفحة المطلوبة غير متاحة. تصفّح قائمة مطعم الغدير أو عد إلى الصفحة الرئيسية.' };

export function getRoute(pathname) {
  const path = routePath(pathname);
  const lookup = path === '/' ? '/' : `${path}/`;
  if (pages[lookup]) return { ...pages[lookup], path: lookup };
  const id = /^\/menu\/([a-z0-9-]+)$/.exec(path)?.[1];
  const item = itemById.get(id);
  if (item) return { path: itemPath(item), key: 'item', component: ItemPage, item,
    title: `${item.name} | مطعم الغدير في حفر الباطن`,
    description: `${item.description} اطّلع على الحجم والسعر وطرق الطلب من مطعم الغدير في حفر الباطن.` };
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

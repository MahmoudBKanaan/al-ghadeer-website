import {
  Bike, Clock3, MapPin, ShoppingBag, Sparkles, UtensilsCrossed,
} from 'lucide-react';
import { href, restaurant, services } from './config.js';
import { itemById } from './catalog.js';
import { LinkButton, Logo, MenuHours, PageHeading, PhoneLink, RestaurantName, SectionHeading, SocialGrid, WhatsAppButton } from './shared.jsx';
import { MenuCard } from './menu.jsx';

const serviceIcons = { dine: UtensilsCrossed, takeaway: ShoppingBag, delivery: Bike };
const featuredIds = ['mixed-grills', 'tomato-kofta', 'fried-fish', 'chicken-burger'];

function HeroImage({ alt }) {
  const full = href('/images/brand/hero.webp');
  return <img src={full}
    srcSet={`${href('/images/brand/hero-720.webp')} 720w, ${href('/images/brand/hero-1080.webp')} 1080w, ${full} 1440w`}
    sizes="(max-width: 650px) calc(100vw - 32px), (max-width: 1220px) 50vw, 610px"
    alt={alt} width="1440" height="1080" fetchPriority="high" />;
}

function Services() {
  return <div className="service-grid">
    {services.map(service => {
      const Icon = serviceIcons[service.icon];
      return <article className="service-card" key={service.name}>
        <span className="icon-tile"><Icon size={24} aria-hidden="true" /></span>
        <div><h3>{service.name}</h3><p>{service.text}</p></div>
      </article>;
    })}
  </div>;
}

export function HomePage() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span aria-hidden="true" />{restaurant.district}، {restaurant.city}</p>
        <h1><RestaurantName /></h1>
        <p className="hero-lead">مشويات وأطباق شرقية</p>
        <p className="hero-description">من مشكل المشويات والطواجن إلى الشاورما وأطباق الأرز. اختَر وجبتك من قائمتنا، وتناولها في المطعم أو اطلبها سفريًا أو مع التوصيل المجاني.</p>
        <div className="actions"><LinkButton to="/menu/" className="button-red">تصفّح قائمة الطعام</LinkButton><WhatsAppButton className="button-light" /></div>
        <div className="hero-facts"><span><Clock3 size={19} aria-hidden="true" />{restaurant.hoursText}</span><a href={href('/locations/')}><MapPin size={19} aria-hidden="true" />عنوان فرع {restaurant.district}</a></div>
        <MenuHours />
      </div>
      <figure className="hero-visual">
        <HeroImage alt="تقديم توضيحي لمشويات وأطباق شرقية" />
        <div className="hero-medallion" aria-hidden="true"><Logo /></div>
        <figcaption>صورة توضيحية</figcaption>
      </figure>
    </section>
    <Services />
    <section className="home-menu section-block" aria-labelledby="home-menu-title">
      <div className="section-row"><SectionHeading id="home-menu-title" label="قائمة الطعام" title="من قائمتنا" text="تعرّف على الأطباق والأحجام والأسعار قبل الطلب." /><LinkButton to="/menu/" className="button-light">القائمة الكاملة</LinkButton></div>
      <div className="menu-grid">
        {featuredIds.map(id => itemById.get(id)).filter(Boolean).map(item => <MenuCard item={item} key={item.id} />)}
      </div>
    </section>
    <section className="location-banner section-block" aria-labelledby="home-contact-title">
      <SectionHeading id="home-contact-title" title={`زورونا في ${restaurant.district}`} text={`تجدون الفرع على خرائط Google باسم «${restaurant.mapsName}» في ${restaurant.city}.`} />
      <div className="home-social"><SocialGrid /></div>
      <LinkButton to="/locations/" className="button-light">العنوان وخريطة الوصول</LinkButton>
    </section>
  </>;
}

const storySections = [
  { title: 'من مطبخنا', text: 'نقدّم كباب اللحم والدجاج وكفتة الطماطم وطواجن الفخار في فرع حي النهضة بحفر الباطن. وللفطور قائمة تضمّ البيض بالجبنة والكبدة.' },
  { title: 'الجلوس والاستلام', text: 'جلسات المطعم مخصّصة للأفراد. يمكنكم أيضًا طلب الوجبة سفريًا واستلامها من الفرع، أو مراسلتنا على واتساب لتأكيد عنوان التوصيل المجاني.' },
  { title: 'اختيار الحجم', text: 'يتوفّر مشكل المقبلات بحجمين ومشكل المشويات بعدّة أحجام. تجدون سعر كل حجم في صفحة الصنف قبل إضافته إلى الطلب.' },
];

export function StoryPage() {
  return <>
    <PageHeading label={<RestaurantName />} title="قصتنا" text={`تعرّف على خيارات الطعام والضيافة في ${restaurant.city}.`} />
    <div className="story-layout">
      <div className="story-visual"><HeroImage alt="صورة توضيحية لأطباق شرقية" /><div className="hero-medallion" aria-hidden="true"><Logo /></div></div>
      <div className="story-sections">{storySections.map((entry, index) => <article className="story-card" key={entry.title}><span className="icon-tile" aria-hidden="true">{['١', '٢', '٣'][index]}</span><div><h2>{entry.title}</h2><p>{entry.text}</p></div></article>)}</div>
    </div>
    <div className="center-actions"><LinkButton to="/menu/" className="button-red">تصفّح قائمة الطعام</LinkButton></div>
  </>;
}

export function LocationsPage() {
  return <>
    <PageHeading label="موقع المطعم" title="عنوان الفرع وساعات العمل" text={`للوصول إلى فرع ${restaurant.district} في ${restaurant.city}، ابحث في خرائط Google عن «${restaurant.mapsName}».`} />
    <article className="location-card">
      <div className="map-art" aria-hidden="true"><span className="map-marker"><MapPin size={43} /></span><span className="map-caption">{restaurant.district}</span></div>
      <div className="location-content">
        <p className="eyebrow"><span aria-hidden="true" />نرحّب بكم</p>
        <h2><RestaurantName /> · {restaurant.district}</h2>
        <p className="location-address">
          شارع {restaurant.street}، {restaurant.district}، {restaurant.city} <bdi>{restaurant.postalCode}</bdi>، {restaurant.country}<br />
          <bdi lang="en" dir="ltr">{restaurant.englishName} · An Nahdah, Hafar Al Batin</bdi><br />
          العنوان المختصر <bdi dir="ltr">{restaurant.shortAddress}</bdi>
        </p>
        <p className="inline-fact"><Clock3 size={19} aria-hidden="true" />{restaurant.hoursText}</p>
        <p className="inline-fact"><UtensilsCrossed size={19} aria-hidden="true" />جلسات للأفراد فقط</p>
        <p className="inline-fact"><Bike size={19} aria-hidden="true" />طلبات سفري وتوصيل مجاني</p>
        <MenuHours />
        <div className="actions"><a className="button button-red" href={restaurant.exactMapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={19} aria-hidden="true" />الاتجاهات على خرائط Google</a><WhatsAppButton className="button-light">اسأل عن موقع الفرع</WhatsAppButton></div>
      </div>
    </article>
    <div className="center-actions"><LinkButton to="/menu/" className="button-light">تصفّح قائمة الطعام</LinkButton></div>
  </>;
}

export function ContactPage() {
  return <>
    <PageHeading label={<RestaurantName />} title="تواصل معنا" text="للطلبات والاستفسار عن الأطباق أو التوصيل أو موقع الفرع." />
    <div className="contact-card">
      <div className="contact-primary"><Logo /><div><h2>كيف نساعدك؟</h2><p>{restaurant.hoursText}</p><p className="contact-number"><bdi>{restaurant.phoneDisplay}</bdi></p></div></div>
      <MenuHours />
      <div className="actions"><WhatsAppButton className="button-red">راسلنا على واتساب</WhatsAppButton><PhoneLink className="button button-light" /></div>
      <div className="contact-secondary"><h3>روابط التواصل الاجتماعي</h3><SocialGrid /></div>
    </div>
    <div className="center-actions"><LinkButton to="/locations/" className="button-light">معلومات الفرع</LinkButton></div>
  </>;
}

export function NotFoundPage() {
  return <div className="missing-page"><span className="icon-tile"><Sparkles size={24} aria-hidden="true" /></span><PageHeading title="الصفحة غير موجودة" text="قد يكون الرابط قديمًا. يمكنك العودة إلى الرئيسية أو تصفّح قائمة الطعام." /><div className="actions"><LinkButton to="/" className="button-light">الرئيسية</LinkButton><LinkButton to="/menu/" className="button-red">قائمة الطعام</LinkButton></div></div>;
}

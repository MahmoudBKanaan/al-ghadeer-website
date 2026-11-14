import menu from './menu-data.json';
import { href, restaurant } from './config.js';

export const categories = menu.categories.map(category => ({
  ...category,
  items: category.items.map(item => ({
    ...item,
    categoryId: category.id,
    categoryName: category.name,
  })),
}));
export const items = categories.flatMap(category => category.items);
export const itemById = new Map(items.map(item => [item.id, item]));

const restaurantClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function currentMenuService(now = new Date()) {
  const time = restaurantClock.format(now);
  if (time >= restaurant.opens && time < restaurant.breakfastEnds) return 'breakfast';
  if (time >= restaurant.breakfastEnds || time < restaurant.closes) return 'main';
  return null;
}

export function isItemAvailable(item, service) {
  return service === (item.categoryId === 'breakfast' ? 'breakfast' : 'main');
}

const sizeLabels = {
  1: ['حجم واحد'],
  2: ['صغير', 'كبير'],
  3: ['صغير', 'متوسط', 'كبير'],
  4: ['صغير', 'متوسط', 'كبير', 'كبير جدًا'],
  5: ['صغير', 'متوسط', 'كبير', 'كبير جدًا', 'الحجم الخامس'],
};

const number = new Intl.NumberFormat('ar-SA-u-nu-arab', { maximumFractionDigits: 2 });
export const formatNumber = value => number.format(value);
export const formatPrice = value => `${formatNumber(value)} ر.س`;

export function variantsFor(item) {
  const labels = sizeLabels[item.prices.length];
  return item.prices.map((price, index) => ({
    price,
    name: labels?.[index] || `خيار بسعر ${formatPrice(price)}`,
    id: index,
  }));
}

export function itemPath(item) {
  return `/menu/${item.id}/`;
}

export function menuImage(item) {
  return href(`/images/menu/${item.id}.webp`);
}

export function normalizedSearch(value) {
  return value.normalize('NFKD').replace(/\p{M}|ـ/gu, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
}

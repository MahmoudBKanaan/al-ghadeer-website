import menu from './menu-data.json';
import { href } from './config.js';

export const categories = menu.categories;
export const items = categories.flatMap(category => category.items.map(item => ({
  ...item,
  categoryId: category.id,
  categoryName: category.name,
})));
export const itemById = new Map(items.map(item => [item.id, item]));

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

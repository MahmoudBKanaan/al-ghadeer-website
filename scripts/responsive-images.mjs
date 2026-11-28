import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const heroWidths = [720, 1080];
const thumbnailWidth = 480;

function variant(fileName) {
  const thumbnail = /^images\/menu\/thumbs\/([a-z0-9-]+\.webp)$/.exec(fileName);
  if (thumbnail) return { source: `images/menu/${thumbnail[1]}`, width: thumbnailWidth };
  for (const width of heroWidths) {
    if (fileName === `images/brand/hero-${width}.webp`) return { source: 'images/brand/hero.webp', width };
  }
}

function resize(publicDir, { source, width }) {
  return sharp(join(publicDir, source)).resize({ width }).webp({ quality: 82 }).toBuffer();
}

export function responsiveImages() {
  let publicDir;
  return {
    name: 'responsive-images',
    apply: (_, { isSsrBuild }) => !isSsrBuild,
    configResolved(config) { publicDir = config.publicDir; },
    configureServer(server) {
      server.middlewares.use(server.config.base, async (request, response, next) => {
        const image = variant(request.url.split('?')[0].slice(1));
        if (!image) return next();
        try {
          const bytes = await resize(publicDir, image);
          response.setHeader('Content-Type', 'image/webp');
          response.end(bytes);
        } catch (error) { next(error); }
      });
    },
    async generateBundle() {
      const photos = await readdir(join(publicDir, 'images/menu'));
      const files = [
        ...heroWidths.map(width => `images/brand/hero-${width}.webp`),
        ...photos.filter(photo => photo.endsWith('.webp')).map(photo => `images/menu/thumbs/${photo}`),
      ];
      for (const fileName of files) {
        this.emitFile({ type: 'asset', fileName, source: await resize(publicDir, variant(fileName)) });
      }
    },
  };
}

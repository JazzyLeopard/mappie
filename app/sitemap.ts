import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    return [
        {
            url: 'https://projeqtly.vercel.app',
            lastModified: new Date(),
        },
        {
            url: 'https://projeqtly.vercel.app/projects',
            lastModified: new Date(),
        },
    ];
}

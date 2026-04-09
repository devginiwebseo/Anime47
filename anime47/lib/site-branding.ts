interface BrandingSource {
    header?: {
        siteName?: string;
    };
    theme?: {
        siteTitle?: string;
    };
}

export function getSiteDisplayName(settings?: BrandingSource) {
    const siteName = settings?.header?.siteName?.trim();

    if (siteName) {
        return siteName;
    }

    const siteTitle = settings?.theme?.siteTitle?.trim();

    if (!siteTitle) {
        return 'Anime47';
    }

    const compactTitle = siteTitle
        .split(/[-|]/)
        .map((part) => part.trim())
        .find(Boolean);

    return compactTitle || siteTitle;
}

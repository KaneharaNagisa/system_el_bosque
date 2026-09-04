export type PublicImage = {
    url: string;
    srcSet?: string | null;
    sizes?: string | null;
};

export type PublicImages = Record<string, PublicImage>;

export function responsiveImage(
    images: PublicImages,
    key: string,
    fallback: string,
): { src: string; srcSet?: string; sizes?: string } {
    const image = images[key];
    return {
        src: image?.url || fallback,
        ...(image?.srcSet ? { srcSet: image.srcSet } : {}),
        ...(image?.sizes ? { sizes: image.sizes } : {}),
    };
}

import { useState, useEffect } from 'react';
import { getTreeImageWithCache } from '@/utils/unsplashImages';

/**
 * Hook to load tree images from Unsplash API with caching
 */
export function useTreeImages(treeNames: string[]) {
    const [images, setImages] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadImages() {
            try {
                setLoading(true);
                const imageMap = new Map<string, string>();

                // Load images sequentially to avoid rate limiting
                for (const treeName of treeNames) {
                    if (!isMounted) break;

                    const imageUrl = await getTreeImageWithCache(treeName);
                    imageMap.set(treeName, imageUrl);

                    // Update state incrementally for better UX
                    if (isMounted) {
                        setImages(new Map(imageMap));
                    }
                }

                if (isMounted) {
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                    setLoading(false);
                }
            }
        }

        loadImages();

        return () => {
            isMounted = false;
        };
    }, [treeNames.join(',')]); // Only re-run if tree names change

    return { images, loading, error };
}

/**
 * Hook to get a single tree image
 */
export function useTreeImage(treeName: string) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadImage() {
            try {
                const url = await getTreeImageWithCache(treeName);
                if (isMounted) {
                    setImageUrl(url);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error loading tree image:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [treeName]);

    return { imageUrl, loading };
}

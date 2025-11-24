// Unsplash API integration for fetching tree images
// Get your free API key from: https://unsplash.com/developers

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

interface UnsplashImage {
    id: string;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    alt_description: string | null;
    description: string | null;
    user: {
        name: string;
        username: string;
    };
}

/**
 * Fetch tree image from Unsplash
 * @param treeName - Name of the tree (e.g., "Mango tree", "Acacia")
 * @param orientation - Image orientation (landscape, portrait, squarish)
 * @returns Image URL or fallback placeholder
 */
export async function fetchTreeImage(
    treeName: string,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'portrait'
): Promise<string> {
    try {
        // If no API key, return placeholder
        if (UNSPLASH_ACCESS_KEY === 'demo') {
            return getPlaceholderImage(treeName);
        }

        const query = `${treeName} tree nature`;
        const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn('Unsplash API error:', response.statusText);
            return getPlaceholderImage(treeName);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const image: UnsplashImage = data.results[0];
            // Use 'regular' size for good quality without being too large
            return image.urls.regular;
        }

        return getPlaceholderImage(treeName);
    } catch (error) {
        console.error('Error fetching tree image:', error);
        return getPlaceholderImage(treeName);
    }
}

/**
 * Get a placeholder image URL using a gradient based on tree name
 */
function getPlaceholderImage(treeName: string): string {
    // Generate a consistent color based on tree name
    const hash = treeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;

    // Create a gradient placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(treeName)}&size=400&background=${hue.toString(16).padStart(6, '0')}&color=fff&bold=true`;
}

/**
 * Batch fetch images for multiple trees
 * Uses rate limiting to avoid hitting API limits
 */
export async function fetchTreeImages(
    treeNames: string[],
    delayMs: number = 1000
): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>();

    for (const treeName of treeNames) {
        const imageUrl = await fetchTreeImage(treeName);
        imageMap.set(treeName, imageUrl);

        // Add delay to respect rate limits (50 requests per hour for free tier)
        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return imageMap;
}

/**
 * Cache tree images in localStorage to avoid repeated API calls
 */
export function getCachedTreeImage(treeName: string): string | null {
    try {
        const cached = localStorage.getItem(`tree_image_${treeName}`);
        if (cached) {
            const { url, timestamp } = JSON.parse(cached);
            // Cache for 7 days
            const isExpired = Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000;
            if (!isExpired) {
                return url;
            }
        }
    } catch (error) {
        console.error('Error reading cached image:', error);
    }
    return null;
}

export function cacheTreeImage(treeName: string, url: string): void {
    try {
        localStorage.setItem(
            `tree_image_${treeName}`,
            JSON.stringify({ url, timestamp: Date.now() })
        );
    } catch (error) {
        console.error('Error caching image:', error);
    }
}

/**
 * Get tree image with caching
 */
export async function getTreeImageWithCache(treeName: string): Promise<string> {
    // Check cache first
    const cached = getCachedTreeImage(treeName);
    if (cached) {
        return cached;
    }

    // Fetch from API
    const url = await fetchTreeImage(treeName);

    // Cache the result
    cacheTreeImage(treeName, url);

    return url;
}

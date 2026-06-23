// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleImageError = (e: any) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/static/demo-image.jpg'; // your fallback image
}
export function getDisplayPhoto(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("https://storage.googleapis.com/")) {
    const parts = url.split("storage.googleapis.com/");
    if (parts.length > 1) {
      const bucketAndKey = parts[1];
      const firstSlashIdx = bucketAndKey.indexOf("/");
      if (firstSlashIdx !== -1) {
        const key = bucketAndKey.substring(firstSlashIdx + 1);
        return `/api/upload/photo?key=${encodeURIComponent(key)}`;
      }
    }
  }
  return url;
}

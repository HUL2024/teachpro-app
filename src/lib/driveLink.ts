// Google Drive "view" links (the kind you get from Share -> Copy link)
// open in Drive's viewer no matter what the <a download> attribute says --
// browsers only honor that attribute for same-origin/blob URLs, and a
// cross-origin Drive link ignores it entirely. The real fix is Drive's own
// direct-download URL format, which makes Google's server itself send a
// Content-Disposition: attachment header.
export function toDriveDownloadUrl(url: string): string {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/) || url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (idMatch) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`
  }
  // Not a recognizable Drive link -- fall back to the original URL so
  // non-Drive links (if ever used) still work as a best effort.
  return url
}

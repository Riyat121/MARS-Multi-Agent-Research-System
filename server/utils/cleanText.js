export function cleanText(text, maxChars = 1500) {
  return text.replace(/\s+/g, " ").trim().slice(0, maxChars);
}
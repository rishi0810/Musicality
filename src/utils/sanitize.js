import DOMPurify from "isomorphic-dompurify";

const TEXT_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

const FORMATTED_TEXT_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "p"],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

export const sanitizeText = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  try {
    return DOMPurify.sanitize(text, TEXT_CONFIG);
  } catch (error) {
    console.warn("DOMPurify sanitization failed:", error);

    return text.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
  }
};

export const sanitizeFormattedText = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  try {
    return DOMPurify.sanitize(text, FORMATTED_TEXT_CONFIG);
  } catch (error) {
    console.warn("DOMPurify sanitization failed:", error);

    return sanitizeText(text);
  }
};

export const decodeHtmlEntities = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    const decoded = textarea.value || textarea.textContent || text;

    return sanitizeText(decoded);
  } catch (error) {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }
};

export const sanitizeSongMetadata = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  const decoded = decodeHtmlEntities(text);
  return sanitizeText(decoded);
};

export const sanitizeLyrics = (lyrics) => {
  if (!lyrics || typeof lyrics !== "string") {
    return "";
  }

  const decoded = decodeHtmlEntities(lyrics);
  return sanitizeFormattedText(decoded);
};

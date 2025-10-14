export const createSlug = (str: string) => {
  return str
    .toString()                 // Convert to string
    .normalize("NFD")           // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()              // Convert to lowercase
    .trim()                     // Remove whitespace from start/end
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "");    // Remove leading/trailing hyphens
}
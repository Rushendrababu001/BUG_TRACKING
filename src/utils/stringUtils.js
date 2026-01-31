export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const truncate = (str, length = 50) => {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const camelToTitle = (str) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

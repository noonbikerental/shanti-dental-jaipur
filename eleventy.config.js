export default function (eleventyConfig) {
  // Static assets passthrough copy -> _site/
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "public/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "favicon.ico": "favicon.ico" });

  // Watch targets for live reload during development
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // Blog posts collection sorted newest first
  eleventyConfig.addCollection("blog", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/blog/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Format date as "10 November 2026"
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  });

  // Format date as "YYYY-MM-DD"
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toISOString().slice(0, 10);
  });

  // Slice array to N items
  eleventyConfig.addFilter("limit", (arr, count) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, count);
  });

  // Pick up to N related posts: same category first, then newest posts fallback
  eleventyConfig.addFilter("relatedPosts", (posts, currentUrl, currentCategory, limit = 3) => {
    if (!Array.isArray(posts)) return [];
    const others = posts.filter((post) => post.url !== currentUrl);
    const sameCategory = others.filter(
      (post) => currentCategory && post.data && post.data.category === currentCategory
    );
    const differentCategory = others.filter(
      (post) => !currentCategory || !post.data || post.data.category !== currentCategory
    );
    return [...sameCategory, ...differentCategory].slice(0, limit);
  });

  // Convert relative path to absolute canonical URL
  eleventyConfig.addFilter("absoluteUrl", (path, base = "https://shantidentaljaipur.com") => {
    if (!path) return base + "/";
    if (/^https?:\/\//i.test(path)) return path;
    const cleanBase = base.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  });

  // Safe JSON-LD string serialization
  eleventyConfig.addFilter("jsonStringify", (value) => {
    return JSON.stringify(value ?? "");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}

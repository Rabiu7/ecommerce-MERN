const express = require("express");
const db = require("../config/database");

const router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://www.mashaallahcreations.in";

// =========================================================
// DYNAMIC PRODUCT SITEMAP
// =========================================================

router.get("/sitemap.xml", (req, res) => {
  const sql = `
    SELECT public_id
    FROM products
    WHERE public_id IS NOT NULL
      AND public_id != ''
    ORDER BY id ASC
  `;

  db.query(sql, (error, products) => {
    if (error) {
      console.error("Sitemap database error:", error);

      return res.status(500).send("Unable to generate sitemap.");
    }

    const productUrls = products
      .map(
        (product) => `
  <url>
    <loc>${FRONTEND_URL}/products/${product.public_id}</loc>
  </url>`,
      )
      .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  <url>
    <loc>${FRONTEND_URL}/</loc>
  </url>

  <url>
    <loc>${FRONTEND_URL}/products</loc>
  </url>
${productUrls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  });
});

module.exports = router;

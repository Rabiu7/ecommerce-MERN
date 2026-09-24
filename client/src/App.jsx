import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";

function App() {
  // =========================================================
  // WEBSITE / ORGANIZATION SEO
  // =========================================================

  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",

      name: "Masha Allah Creations",

      url: "https://www.mashaallahcreations.in/",

      logo: {
        "@type": "ImageObject",
        url: "https://www.mashaallahcreations.in/logo.png",
      },

      description:
        "Masha Allah Creations offers customized gifts, resin art frames and beautiful handmade creations made with love.",

      image: "https://www.mashaallahcreations.in/logo.png",
    };

    const existingSchema = document.getElementById("organization-schema");

    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement("script");

    script.id = "organization-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(organizationSchema);

    document.head.appendChild(script);

    return () => {
      const schema = document.getElementById("organization-schema");

      if (schema) {
        schema.remove();
      }
    };
  }, []);

  return <AppRoutes />;
}

export default App;

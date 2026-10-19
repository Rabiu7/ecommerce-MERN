import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "Online Bazaar",
      url: "https://onlinebazaar.in/",
      logo: {
        "@type": "ImageObject",
        url: "https://onlinebazaar.in/logo.png",
      },
      description:
        "Online Bazaar is an online shopping store offering products for everyday needs.",
      image: "https://onlinebazaar.in/logo.png",
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

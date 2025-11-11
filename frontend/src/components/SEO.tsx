import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  productData?: {
    name: string;
    price: number;
    currency?: string;
    availability?: string;
    image?: string;
  };
}

export default function SEO({
  title = "The Tropical - Custom T-Shirts & Premium Apparel",
  description = "Shop custom t-shirts and premium apparel at The Tropical. Design your own clothing with our easy customization tools. Fast shipping across India.",
  image = "https://www.thetropical.in/logo.png",
  url = "https://www.thetropical.in/",
  type = "website",
  productData,
}: SEOProps) {
  const fullTitle = title.includes("The Tropical") ? title : `${title} | The Tropical`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaTag("description", description);
    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:url", url, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
    updateMetaTag("twitter:url", url);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Add structured data
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The Tropical",
      url: "https://www.thetropical.in",
      logo: "https://www.thetropical.in/logo.png",
      description: "Premium custom t-shirts and apparel with easy customization tools",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The Tropical",
      url: "https://www.thetropical.in",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.thetropical.in/products?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    };

    const productSchema = productData
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: productData.name,
          image: productData.image || image,
          description: description,
          offers: {
            "@type": "Offer",
            price: productData.price,
            priceCurrency: productData.currency || "INR",
            availability: productData.availability || "https://schema.org/InStock",
            url: url,
          },
          brand: {
            "@type": "Brand",
            name: "The Tropical",
          },
        }
      : null;

    // Remove old structured data scripts
    const oldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    oldScripts.forEach((script) => script.remove());

    // Add new structured data
    const addStructuredData = (data: any) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    };

    addStructuredData(organizationSchema);
    addStructuredData(websiteSchema);
    if (productSchema) {
      addStructuredData(productSchema);
    }
  }, [fullTitle, description, image, url, type, productData]);

  return null;
}

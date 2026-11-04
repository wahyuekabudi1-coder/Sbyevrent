import React, { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  breadcrumbs?: BreadcrumbItem[];
  serviceType?: 'rental' | 'taxi' | 'general';
  city?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  keywords,
  breadcrumbs,
  serviceType = 'general',
  city
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper untuk set / create meta tag
    const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper untuk set / create link tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Domain resolution dinamis (mengikuti domain aktual tempat website dibuka)
    const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://surabayaevrent.com';
    const canonicalUrl = `${siteOrigin}${canonicalPath}`;
    const defaultImage = `${siteOrigin}/assets/logo-official.png`;

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }
    setMeta('name', 'robots', 'index, follow');
    setMeta('name', 'author', 'Surabaya EV Rent');
    setLink('canonical', canonicalUrl);

    // 3. Open Graph Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Surabaya EV Rent');
    setMeta('property', 'og:locale', 'id_ID');
    setMeta('property', 'og:image', defaultImage);

    // 4. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', defaultImage);

    // 5. Schema.org JSON-LD Structured Data
    const structuredData: any = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AutoRental',
          '@id': `${siteOrigin}/#organization`,
          'name': 'Surabaya EV Rent',
          'alternateName': 'Surabaya EV Rent - Powered by Smart Journey',
          'url': siteOrigin,
          'logo': defaultImage,
          'image': defaultImage,
          'description': description,
          'telephone': '+6282233697979',
          'areaServed': [
            { '@type': 'City', 'name': 'Surabaya' },
            { '@type': 'City', 'name': 'Sidoarjo' },
            { '@type': 'City', 'name': 'Malang' },
            { '@type': 'City', 'name': 'Batu' }
          ],
          'priceRange': 'Rp240.000 - Rp1.100.000',
          'paymentAccepted': 'QRIS, Virtual Account, Transfer Bank, Tunai',
          'currenciesAccepted': 'IDR'
        },
        {
          '@type': 'WebSite',
          '@id': `${siteOrigin}/#website`,
          'url': siteOrigin,
          'name': 'Surabaya EV Rent',
          'publisher': {
            '@id': `${siteOrigin}/#organization`
          },
          'inLanguage': 'id-ID'
        }
      ]
    };

    // Tambahkan BreadcrumbList jika ada
    if (breadcrumbs && breadcrumbs.length > 0) {
      structuredData['@graph'].push({
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': breadcrumbs.map((bc, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': bc.name,
          'item': `${siteOrigin}${bc.path}`
        }))
      });
    }

    // Tambahkan Service schema spesifik
    if (serviceType === 'rental') {
      structuredData['@graph'].push({
        '@type': 'Service',
        '@id': `${canonicalUrl}#service`,
        'name': city ? `Rental Mobil Listrik ${city} dengan Driver` : 'Rental Mobil Listrik dengan Driver',
        'serviceType': 'Rental Mobil Listrik dengan Driver',
        'provider': {
          '@id': `${siteOrigin}/#organization`
        },
        'areaServed': city || 'Surabaya',
        'description': description,
        'offers': {
          '@type': 'AggregateOffer',
          'lowPrice': '240000',
          'highPrice': '1100000',
          'priceCurrency': 'IDR'
        }
      });
    } else if (serviceType === 'taxi') {
      structuredData['@graph'].push({
        '@type': 'Service',
        '@id': `${canonicalUrl}#service`,
        'name': 'Taksi Mobil Listrik Surabaya',
        'serviceType': 'Taksi Mobil Listrik Point-to-Point',
        'provider': {
          '@id': `${siteOrigin}/#organization`
        },
        'areaServed': 'Surabaya dan Sekitarnya',
        'description': description,
        'offers': {
          '@type': 'Offer',
          'price': '7000',
          'priceCurrency': 'IDR',
          'description': 'Tarif dasar Rp7.000 per kilometer (minimum pemesanan Rp25.000)'
        }
      });
    }

    let scriptEl = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'seo-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(structuredData);

  }, [title, description, canonicalPath, keywords, breadcrumbs, serviceType, city]);

  return null;
};

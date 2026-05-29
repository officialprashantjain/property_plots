"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import propertyService from '@/services/propertyService';
import { Button, Badge, Card } from '@/components/ui';
import { ChevronLeft, Pencil, LayoutGrid, Video, CheckCircle, HelpCircle, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ViewPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await propertyService.getById(id);
        setProperty(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 size={36} className="animate-spin text-primary mb-4" />
        <p className="text-muted font-medium">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-foreground font-semibold text-lg">{error || 'Property not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/properties')} iconLeft={<ChevronLeft size={16} />}>
          Back to Properties
        </Button>
      </div>
    );
  }

  const statusColor = property.status === 'active' ? 'success' : property.status === 'sold' ? 'danger' : 'warning';

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/properties" className="p-2 hover:bg-surface border border-border rounded-lg text-muted transition-colors shrink-0">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
            <p className="text-muted text-sm mt-1">Property Details · Read Only View</p>
          </div>
        </div>
        <Button
          iconLeft={<Pencil size={16} />}
          onClick={() => router.push(`/properties/edit/${id}`)}
        >
          Edit Property
        </Button>
      </div>

      {/* Primary Image */}
      {property.media?.primaryImage && (
        <div className="w-full rounded-2xl overflow-hidden border border-border shadow-sm aspect-[2.2/1] bg-black/5">
          <img
            src={property.media.primaryImage}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Gallery (MOVED UP) */}
      {property.media?.gallery?.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {property.media.gallery.map((url, idx) => (
            <div key={idx} className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-black/5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
              <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Simplified Key Info Grid */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
          {[
            { label: 'Type', value: property.propertyType || 'N/A' },
            { label: 'Location', value: property.location || 'N/A' },
            { label: 'Price Range', value: property.priceRange || 'N/A' },
            { label: 'Size Range', value: property.plotSize || 'N/A' },
            { label: 'Actual Price', value: property.price != null ? `₹${Number(property.price).toLocaleString('en-IN')}` : 'N/A' },
            { label: 'Actual Size', value: property.area != null ? `${property.area} sqft` : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col border-l-2 border-primary/20 pl-3 py-1">
              <span className="text-xs text-muted uppercase font-semibold">{label}</span>
              <span className="text-sm font-semibold text-foreground truncate mt-0.5" title={value}>{value}</span>
            </div>
          ))}
        </div>
        
        {/* Status + Active badges moved inline with the stats horizontally */}
        <div className="flex flex-wrap items-center gap-2 sm:border-l border-border sm:pl-4 shrink-0 mt-4">
          <Badge color={statusColor} text={property.status?.toUpperCase() || 'DRAFT'} dot />
          <Badge color={property.isActive ? 'success' : 'neutral'} text={property.isActive ? 'VISIBLE' : 'HIDDEN'} />
        </div>
      </Card>

      {/* Description */}
      {property.descriptionHtml && (
        <Card className="p-6 flex flex-col gap-3">
          <h3 className="font-bold text-foreground border-b border-border pb-3">Description</h3>
          <div
            className="text-sm text-foreground leading-relaxed break-words 
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2
              [&_p]:mb-3
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
              [&_li]:mb-1
              [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: property.descriptionHtml }}
          />
        </Card>
      )}

      {/* Video */}
      {property.media?.videoUrl && (
        <Card className="p-6 flex flex-col gap-3">
          <h3 className="font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Video size={17} /> Video Tour
          </h3>
          <a
            href={property.media.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-sm underline underline-offset-2 hover:text-primary/80 transition-colors break-all"
          >
            {property.media.videoUrl}
          </a>
        </Card>
      )}

      {/* Features */}
      {property.features?.length > 0 && (
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <CheckCircle size={17} /> Features
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
            {property.features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {feat}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Collapsible FAQs */}
      {property.faqs?.length > 0 && (
        <Card className="p-6 flex flex-col gap-4">
          <h3 className="font-bold text-foreground border-b border-border pb-3 flex items-center gap-2 mb-2">
            <HelpCircle size={17} /> FAQs
          </h3>
          <div className="flex flex-col gap-3">
            {property.faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-xl border border-border bg-surface overflow-hidden">
                <summary className="p-4 text-sm font-semibold text-foreground cursor-pointer select-none list-none flex justify-between items-center hover:bg-surface-hover [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 ml-4" size={16} />
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-muted leading-relaxed border-t border-border/50 bg-background">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

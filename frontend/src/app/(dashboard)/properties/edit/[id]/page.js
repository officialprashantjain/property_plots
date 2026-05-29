"use client";

import React from 'react';
import PropertyForm from '@/components/properties/PropertyForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditPropertyPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <Link href="/properties" className="p-2 hover:bg-surface border border-border rounded-lg text-muted transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Property</h1>
          <p className="text-muted text-sm mt-1">Update existing listing details</p>
        </div>
      </div>

      <PropertyForm mode="edit" propertyId={id} />
    </div>
  );
}

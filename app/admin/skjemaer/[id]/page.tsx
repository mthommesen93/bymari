"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { dataStore } from "@/lib/store";
import { Form } from "@/lib/types";

export default function EditFormPage() {
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const f = await dataStore.getFormById(id);
      setForm(f);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-charcoal/60 font-mono">
        Laster skjema...
      </div>
    );
  }

  return <FormBuilder initialForm={form} isNew={false} />;
}

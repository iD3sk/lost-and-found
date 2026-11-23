"use client";

import { useState } from "react";

interface ReportFormProps {
  type: "lost" | "found";
}

const inputClass =
  "w-full rounded-full border-4 border-border-soft bg-background px-4 py-2.5 placeholder:text-placeholder focus:border-primary focus:outline-none";

export default function ReportForm({ type }: ReportFormProps) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: simpan data (type, itemName, category) lalu lanjut ke langkah berikutnya
    console.log({ type, itemName, category });
  }

  return (
    // max-w-md: di desktop kolom input & tombol Continue sama lebar
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-28 pt-4"
    >
      <div>
        <label htmlFor="itemName" className="mb-1 block text-lg font-bold">
          Item Name
        </label>
        <input
          id="itemName"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="e.g. Black AirPods Case"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-lg font-bold">
          Category
        </label>
        <input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Accessories"
          required
          className={inputClass}
        />
      </div>

      {/* Tombol Continue menempel di bawah layar, selebar kolom input */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 py-2">
        <button
          type="submit"
          className="min-h-12 w-full rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
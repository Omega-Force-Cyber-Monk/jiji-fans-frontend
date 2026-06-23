"use client";

import React, { useState } from "react";
import { WaitlistEntry } from "./waitlist.types";

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  onClear: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function exportToCsv(entries: WaitlistEntry[]): void {
  const headers = ["#", "Name", "Email", "WhatsApp", "Category", "Submitted At"];
  const rows = entries.map((e, i) => [
    String(i + 1),
    e.name,
    e.email,
    e.whatsapp ?? "",
    e.category,
    formatDate(e.submittedAt),
  ]);

  const escape = (val: string) =>
    `"${val.replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plus2fans_waitlist_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function WaitlistTable({ entries, onClear }: WaitlistTableProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
    }
  };

  const thClass =
    "px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap";
  const tdClass =
    "px-4 py-3 text-sm font-normal text-secondary-text whitespace-nowrap";

  return (
    <div className="flex flex-col gap-4">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-base font-medium text-white">
          Waitlist ({entries.length} {entries.length === 1 ? "entry" : "entries"})
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            id="waitlist-table-search"
            type="search"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder-muted-text outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-colors w-48"
          />
          <button
            id="waitlist-table-export-btn"
            onClick={() => exportToCsv(entries)}
            className="px-4 py-2 rounded-md bg-brand-primary text-white text-sm font-medium hover:bg-brand-secondary transition-colors"
          >
            Export CSV
          </button>
          <button
            id="waitlist-table-clear-btn"
            onClick={handleClear}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              confirmClear
                ? "bg-error/80 text-white"
                : "bg-white/5 border border-white/10 text-secondary-text hover:text-error hover:border-error/40"
            }`}
          >
            {confirmClear ? "Confirm Clear" : "Clear All"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="w-full overflow-x-auto rounded-lg border border-white/8"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr style={{ background: "rgba(0,176,90,0.15)" }}>
              <th className={thClass}>#</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>WhatsApp</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-text font-normal"
                >
                  {searchQuery ? "No results match your search." : "No submissions yet."}
                </td>
              </tr>
            ) : (
              filtered.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className={`${tdClass} text-muted-text`}>{idx + 1}</td>
                  <td className={`${tdClass} text-white font-medium`}>
                    {entry.name}
                  </td>
                  <td className={tdClass}>{entry.email}</td>
                  <td className={tdClass}>{entry.whatsapp || "—"}</td>
                  <td className={tdClass}>
                    <span className="px-2.5 py-1 rounded-sm bg-brand-primary/10 text-brand-primary text-xs font-normal">
                      {entry.category}
                    </span>
                  </td>
                  <td className={`${tdClass} text-muted-text`}>
                    {formatDate(entry.submittedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

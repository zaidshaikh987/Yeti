import { db } from '@/api/base44Client';

import React from "react";
import { UploadCloud, FileText, Image, FileSpreadsheet, CheckCircle, X, Loader2, ShieldCheck, FileCheck, Hash, ScanText, Tags, BrainCircuit, Copy, UserCheck, ClipboardCheck, Archive } from "lucide-react";

import { INGESTION_STAGES } from "@/lib/polarSetu";
import { cn } from "@/lib/utils";

const ACCEPTED = ".pdf,.png,.jpg,.jpeg,.csv,.docx,.pptx,.txt,.html,.xlsx,.json";

export default function UploadCentre() {
  const [dragOver, setDragOver] = React.useState(false);
  const [uploads, setUploads] = React.useState([]);
  const inputRef = React.useRef(null);

  const stageIcons = {
    upload: UploadCloud, virus_scan: ShieldCheck, validation: FileCheck, checksum: Hash,
    extraction: ScanText, metadata: Tags, entity_recognition: BrainCircuit, thumbnail: Image,
    embedding: Archive, duplicate: Copy, human_review: UserCheck, review: ClipboardCheck, repository: Archive,
  };

  const processFile = async (file) => {
    const uploadId = `upl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newUpload = {
      id: uploadId,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      fileType: file.type || "unknown",
      currentStage: 0,
      stages: INGESTION_STAGES.map((s) => ({ ...s, status: "pending" })),
      assetId: null,
    };
    newUpload.stages[0].status = "active";
    setUploads((prev) => [newUpload, ...prev]);

    // Simulate ingestion pipeline progression
    for (let i = 0; i < newUpload.stages.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setUploads((prev) => prev.map((u) => {
        if (u.id !== uploadId) return u;
        const stages = [...u.stages];
        stages[i].status = "done";
        if (i + 1 < stages.length) stages[i + 1].status = "active";
        return { ...u, stages, currentStage: i + 1 };
      }));
    }

    // Create asset record
    try {
      const checksum = "sha256:" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const asset = await db.entities.Asset.create({
        title: file.name.replace(/\.[^.]+$/, ""),
        content_type: "report",
        review_status: "draft",
        access_class: "open",
        file_format: file.name.split(".").pop()?.toUpperCase() || "PDF",
        file_size: newUpload.fileSize,
        checksum,
        version: "1.0",
        creator: "Repository Administrator",
        publisher: "NCPOR",
        language: "en",
        summary: "Uploaded via Upload Centre — pending metadata review.",
        is_prototype: true,
      });

      await db.entities.AuditLog.create({
        actor: "Repository Administrator",
        action: "upload",
        target: file.name,
        target_type: "asset",
        details: `File uploaded and processed through ingestion pipeline. Asset ID: ${asset.id}`,
      });

      await db.entities.ReviewTask.create({
        asset_id: asset.id,
        asset_title: asset.title,
        review_type: "metadata",
        status: "pending",
        source: "Upload Centre",
        priority: "medium",
        is_prototype: true,
      });

      setUploads((prev) => prev.map((u) => u.id === uploadId ? { ...u, assetId: asset.id, complete: true } : u));
    } catch (e) {
      console.error(e);
      setUploads((prev) => prev.map((u) => u.id === uploadId ? { ...u, error: true } : u));
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(processFile);
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-[#071A2B]">Upload Centre</h1>
      <p className="text-sm text-muted-foreground">Upload scientific assets — files pass through an automated ingestion pipeline before entering the repository</p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
          dragOver ? "border-[#4DA8D8] bg-[#4DA8D8]/5" : "border-border bg-white hover:border-[#4DA8D8]/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <UploadCloud className="h-8 w-8 text-[#4DA8D8]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#071A2B]">Drag and drop files here</h3>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse — PDF, Images, CSV supported (DOCX, PPTX, XLSX, JSON also accepted)</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["PDF", "PNG/JPG", "CSV", "DOCX", "PPTX", "XLSX", "JSON"].map((f) => (
            <span key={f} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">{f}</span>
          ))}
        </div>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-[#071A2B]">Processing Queue</h2>
          {uploads.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <FileText className="h-5 w-5 text-[#4DA8D8]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#071A2B]">{u.fileName}</div>
                    <div className="text-xs text-muted-foreground">{u.fileSize} · {u.fileType}</div>
                  </div>
                </div>
                {u.complete && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" /> Ingested
                  </span>
                )}
                {u.error && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <X className="h-3.5 w-3.5" /> Failed
                  </span>
                )}
              </div>

              {/* Pipeline stages */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {u.stages.map((s, i) => {
                  const Icon = stageIcons[s.key] || FileCheck;
                  return (
                    <div
                      key={s.key}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2.5 text-xs",
                        s.status === "done" ? "border-emerald-200 bg-emerald-50" :
                        s.status === "active" ? "border-[#4DA8D8] bg-[#4DA8D8]/5" :
                        "border-border bg-muted"
                      )}
                    >
                      {s.status === "done" ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" /> :
                       s.status === "active" ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#4DA8D8]" /> :
                       <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      <span className={cn("truncate", s.status === "pending" && "text-muted-foreground")}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Duplicate detection demo */}
              {u.currentStage >= 10 && !u.complete && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <Copy className="h-4 w-4" /> Duplicate detection: checking checksum and text similarity against existing records…
                </div>
              )}

              {u.complete && u.assetId && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <CheckCircle className="h-4 w-4" /> Asset created and added to repository. A metadata review task has been generated.
                  <a href={`/admin/metadata?asset=${u.assetId}`} className="font-semibold underline">Edit metadata →</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pipeline reference */}
      <div className="mt-8 rounded-xl border border-border bg-muted p-5">
        <h3 className="text-sm font-semibold text-[#071A2B]">Ingestion Pipeline</h3>
        <p className="mt-1 text-xs text-muted-foreground">Every uploaded file passes through these stages:</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {INGESTION_STAGES.map((s, i, arr) => {
            const Icon = stageIcons[s.key] || FileCheck;
            return (
              <React.Fragment key={s.key}>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-foreground">
                  <Icon className="h-3.5 w-3.5 text-[#4DA8D8]" /> {s.label}
                </span>
                {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import { createContext, useContext, useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions";
import { useToast } from "./toast";

export function useRun() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, success?: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) return toast("error", r.error);
      if (r.message || success) toast("ok", r.message ?? success!);
      after?.();
    });
  return { run, pending };
}

export function ActionButton({ action, children, className = "btn btn-ghost btn-sm", success, confirm, ...rest }: { action: () => Promise<ActionResult>; children: React.ReactNode; className?: string; success?: string; confirm?: string } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">) {
  const { run, pending } = useRun();
  return (
    <button type="button" {...rest} className={className} disabled={pending || rest.disabled} onClick={() => (!confirm || window.confirm(confirm)) && run(action, success)}>
      {pending ? "…" : children}
    </button>
  );
}

const ModalClose = createContext<(() => void) | null>(null);

export function ActionForm({ action, children, className, success, reset = true, onDone }: { action: (fd: FormData) => Promise<ActionResult>; children: React.ReactNode; className?: string; success?: string; reset?: boolean; onDone?: () => void }) {
  const ref = useRef<HTMLFormElement>(null);
  const closeModal = useContext(ModalClose);
  const { run, pending } = useRun();
  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run(() => action(fd), success, () => {
          if (reset) ref.current?.reset();
          onDone?.();
          closeModal?.();
        });
      }}
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
    </form>
  );
}

export function Modal({ trigger, title, children, triggerClass = "btn btn-primary" }: { trigger: React.ReactNode; title: string; children: React.ReactNode | ((close: () => void) => React.ReactNode); triggerClass?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    ref.current?.close();
    setOpen(false);
  };
  return (
    <>
      <button type="button" className={triggerClass} onClick={() => { setOpen(true); ref.current?.showModal(); }}>{trigger}</button>
      <dialog ref={ref} onClose={() => setOpen(false)} className="m-auto w-[min(640px,calc(100vw-32px))] rounded-2xl border border-line bg-panel p-0 text-text backdrop:bg-black/70">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={close} aria-label="Close">✕</button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5"><ModalClose.Provider value={close}>{open && (typeof children === "function" ? children(close) : children)}</ModalClose.Provider></div>
      </dialog>
    </>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? "Copied ✓" : label}
    </button>
  );
}

"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { InventoryProvider } from "@/context/inventory-provider";
import { SettingsProvider } from "@/context/settings-provider";
import { ItemFormModal } from "@/components/inventory/item-form-modal";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <InventoryProvider>
      <SettingsProvider>
        <div className="flex h-screen overflow-hidden bg-surface">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
              <div className="mx-auto w-full max-w-[1400px]">{children}</div>
            </main>
          </div>
          <MobileBottomNav />
        </div>
        <ItemFormModal />
      </SettingsProvider>
    </InventoryProvider>
  );
}

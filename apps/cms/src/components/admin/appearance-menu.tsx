"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CheckIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export type AdminAppearance = "system" | "light" | "dark";

const choices = [
  { value: "system" as const, label: "System", icon: ComputerDesktopIcon },
  { value: "light" as const, label: "Light", icon: SunIcon },
  { value: "dark" as const, label: "Dark", icon: MoonIcon },
];

function applyAppearance(value: AdminAppearance) {
  const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.adminAppearance = value;
}

export function AppearanceMenu() {
  const [appearance, setAppearance] = useState<AdminAppearance>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("snipgraph-admin-appearance");
    const initial = stored === "light" || stored === "dark" ? stored : "system";
    applyAppearance(initial);
    const frame = window.requestAnimationFrame(() => setAppearance(initial));
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => (window.localStorage.getItem("snipgraph-admin-appearance") ?? "system") === "system" && applyAppearance("system");
    media.addEventListener("change", sync);
    return () => { window.cancelAnimationFrame(frame); media.removeEventListener("change", sync); };
  }, []);

  function choose(value: AdminAppearance) {
    window.localStorage.setItem("snipgraph-admin-appearance", value);
    setAppearance(value);
    applyAppearance(value);
  }

  const CurrentIcon = choices.find((choice) => choice.value === appearance)?.icon ?? ComputerDesktopIcon;

  return (
    <Menu as="div" className="relative">
      <MenuButton className="relative flex size-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:outline-emerald-400">
        <span className="sr-only">Change appearance</span>
        <CurrentIcon aria-hidden="true" className="size-5" />
      </MenuButton>
      <MenuItems transition anchor="bottom end" className="z-50 mt-2 w-44 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:opacity-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10">
        {choices.map((choice) => (
          <MenuItem key={choice.value}>
            <button type="button" onClick={() => choose(choice.value)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-200 dark:data-focus:bg-white/10">
              <choice.icon aria-hidden="true" className="size-5 text-gray-400" />
              <span className="flex-1">{choice.label}</span>
              {choice.value === appearance && <CheckIcon aria-hidden="true" className="size-4 text-emerald-600 dark:text-emerald-400" />}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

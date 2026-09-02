"use client";

import { authClient } from "@/lib/auth-client";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon, Bars3Icon, ChevronDownIcon, Cog6ToothIcon, DocumentTextIcon, FolderIcon, Squares2X2Icon, XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppearanceMenu } from "./appearance-menu";

const navigation = [
  { href: "/admin", label: "Content", icon: DocumentTextIcon, match: (path: string) => path === "/admin" || path.startsWith("/admin/pages") },
  { href: "/admin/media", label: "Media", icon: FolderIcon, match: (path: string) => path.startsWith("/admin/media") },
  { href: "/admin/settings", label: "Site settings", icon: Cog6ToothIcon, match: (path: string) => path.startsWith("/admin/settings") },
  { href: "/reference", label: "Reference catalog", icon: Squares2X2Icon, match: (path: string) => path.startsWith("/reference") },
];

function navClass(active: boolean) {
  return `${active ? "border-emerald-500 text-gray-950 dark:border-emerald-400 dark:text-white" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-100"} inline-flex items-center gap-2 border-b-2 px-1 pt-1 text-sm font-medium`;
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div data-admin-shell className="min-h-screen bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-white">
      <Disclosure as="nav" className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
        {({ open }) => <>
          <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex min-w-0">
                <Link href="/admin" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-gray-950 dark:text-white">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">S</span>
                  <span className="hidden sm:inline">Snipgraph CMS</span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-7">
                  {navigation.map((item) => <Link className={navClass(item.match(pathname))} href={item.href} key={item.href}><item.icon aria-hidden="true" className="size-4" />{item.label}</Link>)}
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <a href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white">View site<ArrowTopRightOnSquareIcon aria-hidden="true" className="size-4" /></a>
                <AppearanceMenu />
                <Menu as="div" className="relative ml-1">
                  <MenuButton className="flex items-center gap-2 rounded-full p-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-emerald-400">
                    <span className="flex size-8 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-100">{email.slice(0, 1).toUpperCase()}</span>
                    <ChevronDownIcon aria-hidden="true" className="size-4 text-gray-400" />
                    <span className="sr-only">Open user menu</span>
                  </MenuButton>
                  <MenuItems transition anchor="bottom end" className="z-50 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:opacity-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10">
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10"><p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p><p className="truncate text-sm font-medium text-gray-900 dark:text-white">{email}</p></div>
                    <MenuItem><button type="button" onClick={signOut} className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-200 dark:data-focus:bg-white/10">Sign out</button></MenuItem>
                  </MenuItems>
                </Menu>
              </div>
              <div className="flex items-center sm:hidden">
                <AppearanceMenu />
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-white/10 dark:hover:text-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? <XMarkIcon aria-hidden="true" className="size-6" /> : <Bars3Icon aria-hidden="true" className="size-6" />}
                </DisclosureButton>
              </div>
            </div>
          </div>
          <DisclosurePanel className="border-t border-gray-100 sm:hidden dark:border-white/10">
            <div className="space-y-1 px-3 py-3">
              {navigation.map((item) => <DisclosureButton as={Link} href={item.href} key={item.href} className={`${item.match(pathname) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"} flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium`}><item.icon aria-hidden="true" className="size-5" />{item.label}</DisclosureButton>)}
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-white/10">
              <a href="/" target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">View site<ArrowTopRightOnSquareIcon aria-hidden="true" className="size-4" /></a>
              <button type="button" onClick={signOut} className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10">Sign out</button>
            </div>
          </DisclosurePanel>
        </>}
      </Disclosure>
      <main className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTabs, type PageTabKey } from "@/components/PageTabs";
import { DocsPanel } from "./DocsPanel";
import { CommunityPanel } from "./CommunityPanel";

/**
 * Merged root page for docs (命令库) and community (社区文档).
 * The active tab is reflected in the URL (?tab=community / ?tab=docs) so that
 * deep-link back navigation (e.g. from /community/id) restores the tab.
 */
export function HomeClient() {
  const router = useRouter();
  const [tab, setTab] = useState<PageTabKey>("docs");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "docs" || t === "community") setTab(t);
  }, []);

  const handleChange = (key: PageTabKey) => {
    setTab(key);
    const params = new URLSearchParams(window.location.search);
    if (key === "docs") params.delete("tab");
    else params.set("tab", key);
    const qs = params.toString();
    const url = qs ? `/?${qs}` : "/";
    window.history.replaceState(null, "", url);
    router.replace(url, { scroll: false });
  };

  return (
    <>
      <div className="relative max-w-3xl mx-auto px-[var(--content-gutter)] pt-10">
        <PageTabs active={tab} onChange={handleChange} />
      </div>
      {tab === "docs" ? <DocsPanel key="docs" /> : <CommunityPanel key="community" />}
    </>
  );
}
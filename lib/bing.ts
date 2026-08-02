interface BingResponse {
  images: Array<{
    url: string;
    copyright: string;
  }>;
}

const BING_API = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1";

/**
 * @why 必应 API 无鉴权，适合公开站点使用
 * @side-effect 发起外部 HTTP 请求
 */
export async function getBingDailyImage(): Promise<{ url: string; copyright: string } | null> {
  try {
    const res = await fetch(BING_API, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data: BingResponse = await res.json();
    const image = data.images?.[0];
    if (!image) return null;

    return {
      url: `https://www.bing.com${image.url}`,
      copyright: image.copyright,
    };
  } catch {
    return null;
  }
}

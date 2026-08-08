/**
 * Cloudflare Pages Function — GitHub OAuth 回调
 *
 * @route GET /api/auth/callback?code=xxx&state=xxx
 * @design 纯静态站 + Functions 混合架构：
 *   1. 用户点登录 → 前端 redirect 到 GitHub OAuth
 *   2. GitHub 回调到此 Function，用 code 换 token
 *   3. 用 token 获取用户信息
 *   4. redirect 回前端，token 和用户信息通过 URL hash 传递
 *   5. 前端 AuthContext 从 hash 中提取并存储到 localStorage
 */

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  // state param reserved for future CSRF validation

  const homeUrl = "https://mcbecd.pages.dev";

  // GitHub 返回错误（用户拒绝授权）
  if (error) {
    return Response.redirect(`${homeUrl}?auth_error=${error}`, 302);
  }

  if (!code) {
    return Response.redirect(`${homeUrl}?auth_error=no_code`, 302);
  }

  // 用 code 换 token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${homeUrl}/api/auth/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return Response.redirect(`${homeUrl}?auth_error=token_exchange_failed`, 302);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };

  if (tokenData.error || !tokenData.access_token) {
    return Response.redirect(
      `${homeUrl}?auth_error=${tokenData.error || "no_token"}`,
      302,
    );
  }

  // 用 token 获取用户信息
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${tokenData.access_token}`,
      Accept: "application/json",
      "User-Agent": "MCBECD",
    },
  });

  if (!userRes.ok) {
    return Response.redirect(`${homeUrl}?auth_error=user_fetch_failed`, 302);
  }

  const user = (await userRes.json()) as {
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
  };

  // 用 hash fragment 回传（不经过服务器日志）
  const userJson = encodeURIComponent(JSON.stringify({
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    html_url: user.html_url,
  }));

  return Response.redirect(
    `${homeUrl}/docs?token=${encodeURIComponent(tokenData.access_token)}&user=${userJson}`,
    302,
  );
}

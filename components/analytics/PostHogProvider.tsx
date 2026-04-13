"use client";

import Script from "next/script";

type PostHogProviderProps = {
  children: React.ReactNode;
};

export function PostHogProvider({ children }: PostHogProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <>
      <Script id="posthog-init" strategy="afterInteractive">
        {`
!function(t,e){var o,n,p,r;e.__SV=1,window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2===o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=(s.api_host||"").replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people"},o="capture identify alias people.set people.set_once reset group set_config".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.init(${JSON.stringify(
          apiKey,
        )},{api_host:${JSON.stringify(
          apiHost,
        )},capture_pageview:false,capture_pageleave:true,person_profiles:"identified_only"})}(document,window.posthog||[]);
        `}
      </Script>
      {children}
    </>
  );
}

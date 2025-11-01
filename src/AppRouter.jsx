// Mini-routeur hash-based pour /#/public/:wallet
import React, { useEffect, useState } from "react";
import App from "./App.jsx";
import PublicDashboard from "./PublicDashboard.jsx";

// Parse soit location.hash (prioritaire), soit location.pathname en secours
function parseRoute() {
  // #/public/0xabc...
  const h = (window.location.hash || "").replace(/^#/, ""); // -> /public/...
  const p = window.location.pathname || "/";

  const matchHash = h.match(/^\/public\/([^/?#]+)/i);
  if (matchHash) return { page: "public", wallet: matchHash[1].toLowerCase() };

  const matchPath = p.match(/^\/public\/([^/?#]+)/i);
  if (matchPath) return { page: "public", wallet: matchPath[1].toLowerCase() };

  return { page: "app", wallet: null };
}

export default function AppRouter() {
  const [route, setRoute] = useState(parseRoute());

  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  if (route.page === "public" && route.wallet) {
    // PublicDashboard lit aussi depuis localStorage, donc pas besoin d'autres props
    return <PublicDashboard wallet={route.wallet} />;
  }

  return <App />;
}

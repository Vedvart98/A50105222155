import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadMappings, saveMappings } from "../utils/storage";
import { Log } from "../logger";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function RedirectPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const data = loadMappings();
    const entry = data.links.find((l) => l.code === code);

    if (!entry) {
      Log("frontend", "error", "redirect", `shortcode not found: ${code}`, { code });
      // no entry, show message then redirect home
      setTimeout(() => navigate("/", { replace: true }), 1500);
      return;
    }

    const now = Date.now();
    if (entry.expiresAt && now > entry.expiresAt) {
      Log("frontend", "info", "redirect", `short link expired: ${code}`, { code });
      // remove expired entry
      const newLinks = data.links.filter((l) => l.code !== code);
      saveMappings({ links: newLinks });
      setTimeout(() => navigate("/", { replace: true }), 1500);
      return;
    }

    // record click
    const click = {
      ts: new Date().toISOString(),
      source: window.location.hostname,
      ua: navigator.userAgent,
    };
    entry.clicks.push(click);
    // persist
    const newLinks = data.links.map((l) => (l.code === code ? entry : l));
    saveMappings({ links: newLinks });

    Log("frontend", "info", "redirect", "short link clicked", { code, click });

    // perform redirect (client-side)
    window.location.replace(entry.longUrl);
  }, [code, navigate]);

  return (
    <Box sx={{ textAlign: "center", mt: 8 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Redirecting...</Typography>
    </Box>
  );
}

export default RedirectPage;

import React, { useState, useEffect } from "react";
import { loadMappings, saveMappings } from "../utils/storage";
import { Log } from "../logger";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

function genShortCode() {
  // simple random 6-char alphanumeric
  return Math.random().toString(36).substring(2, 8);
}

function Home() {
  const [mappings, setMappings] = useState({ links: [] });
  const [longUrl, setLongUrl] = useState("");
  const [validity, setValidity] = useState(""); // minutes
  const [shortcode, setShortcode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setMappings(loadMappings());
  }, []);

  useEffect(() => {
    saveMappings(mappings);
  }, [mappings]);

  const canCreate = () => mappings.links.length < 5;

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    // client-side validation
    if (!longUrl || !validator.isURL(longUrl, { require_protocol: true })) {
      setError("Please enter a valid URL including http:// or https://");
      return;
    }

    const minutes = validity ? parseInt(validity, 10) : 30;
    if (isNaN(minutes) || minutes <= 0) {
      setError("Validity must be a positive integer representing minutes.");
      return;
    }

    if (!canCreate()) {
      setError("You can only shorten up to 5 URLs concurrently.");
      return;
    }

    // handle shortcode uniqueness and validation
    let code = shortcode ? shortcode.trim() : "";
    if (code) {
      const isAlnum = /^[a-zA-Z0-9_-]{3,20}$/.test(code);
      if (!isAlnum) {
        setError("Custom shortcode must be 3-20 chars, alphanumeric, - or _ allowed.");
        return;
      }
      if (mappings.links.find((l) => l.code === code)) {
        setError("Shortcode already exists. Choose another one.");
        return;
      }
    } else {
      // generate unique
      do {
        code = genShortCode();
      } while (mappings.links.find((l) => l.code === code));
    }

    const now = Date.now();
    const expiry = now + minutes * 60 * 1000;

    const newLink = {
      id: uuidv4(),
      code,
      longUrl,
      createdAt: now,
      expiresAt: expiry,
      clicks: [], // each click: { ts, source, ua }
    };

    const newMappings = { links: [newLink, ...mappings.links] };
    setMappings(newMappings);
    setSuccess(`Short link created: ${window.location.origin}/r/${code}`);

    // send log
    Log("frontend", "info", "shortener", "created short link", {
      code,
      longUrl,
      validityMinutes: minutes,
    });

    // clear inputs
    setLongUrl("");
    setValidity("");
    setShortcode("");
  };

  const remaining = 5 - mappings.links.length;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        URL Shortener
      </Typography>

      <Stack spacing={2}>
        {!canCreate() && <Alert severity="warning">Max 5 active URLs reached.</Alert>}

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TextField
          label="Original URL (include http:// or https://)"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          fullWidth
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Validity (minutes, default 30)"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            sx={{ width: 220 }}
          />
          <TextField
            label="Custom shortcode (optional)"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            sx={{ width: 300 }}
            helperText="3-20 chars, alphanumeric, - or _ allowed"
          />
          <Button variant="contained" onClick={handleCreate} disabled={!canCreate()}>
            Shorten
          </Button>
        </Stack>

        <Typography variant="subtitle2">You can create {remaining} more links.</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Active Short Links
        </Typography>
        <List>
          {mappings.links.length === 0 && <ListItem>No links yet.</ListItem>}
          {mappings.links.map((l) => (
            <ListItem key={l.id} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography><strong>Short:</strong> <a href={`/r/${l.code}`}>{window.location.origin}/r/{l.code}</a></Typography>
                <Typography><strong>Expiry:</strong> {new Date(l.expiresAt).toLocaleString()}</Typography>
                <Typography><strong>Clicks:</strong> {l.clicks.length}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>{l.longUrl}</Typography>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}

export default Home;

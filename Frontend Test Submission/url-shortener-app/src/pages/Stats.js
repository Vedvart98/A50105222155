import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { loadMappings, saveMappings } from "../utils/storage";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Stack from "@mui/material/Stack";
import { Log } from "../logger";

function Stats() {
  const [mappings, setMappings] = useState({ links: [] });

  useEffect(() => {
    setMappings(loadMappings());
  }, []);

  const clearAll = () => {
    saveMappings({ links: [] });
    setMappings({ links: [] });
    Log("frontend", "info", "stats", "cleared all mappings");
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">URL Statistics</Typography>
        <Button color="error" onClick={clearAll}>Clear All</Button>
      </Stack>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Short</TableCell>
            <TableCell>Original URL</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Clicks</TableCell>
            <TableCell>Click Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mappings.links.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{window.location.origin}/r/{l.code}</TableCell>
              <TableCell sx={{ maxWidth: 300 }}>{l.longUrl}</TableCell>
              <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(l.expiresAt).toLocaleString()}</TableCell>
              <TableCell>{l.clicks.length}</TableCell>
              <TableCell>
                {l.clicks.length === 0 ? (
                  "No clicks"
                ) : (
                  <div>
                    {l.clicks.slice().reverse().map((c, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div><strong>{new Date(c.ts).toLocaleString()}</strong></div>
                        <div>source: {c.source}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{c.ua}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default Stats;

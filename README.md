# Multi-part Request / Multi-thread Download

Small demo showing how to download a single file in parallel (multi-part) using Range requests from the browser and then reassemble the parts.

This repository contains a minimal example you can open in a browser. The main code is in `multi-thread-download.js` which implements a small async pool and uses HTTP `Range` requests to fetch file chunks concurrently.

## Files

- `index.html` — demo page (open in browser).
- `multi-thread-download.js` — core logic: splitting a remote file into byte ranges, downloading chunks concurrently, concatenating buffers, and saving the result.
- `tasks.js` — (auxiliary code used by the demo, if any).

## What it does (short)

- Uses `HEAD` to get `content-length` of the remote resource.
- Splits the file into chunks (by `chunkSize`).
- Downloads chunks in parallel (limited by `poolLimit`) using `Range` headers.
- Concatenates the ArrayBuffers into a single blob and triggers a download.

## API contract (what `download()` expects and returns)

- Function: `download({ url, chunkSize, poolLimit = 1 })`
- Inputs:
  - `url` (string) — URL of the remote file to download.
  - `chunkSize` (number) — desired chunk size in bytes (e.g. 1024 * 1024 for 1 MiB).
  - `poolLimit` (number) — concurrency limit (how many chunk requests run at once).
- Output: resolves to a `Uint8Array` with the full file bytes (ready to be wrapped into a Blob).
- Error modes: the function will reject if network requests fail or if the server does not provide expected headers. `getContentLength` uses a `HEAD` request and expects a `content-length` header.

## Example usage (open DevTools Console)

1. Serve the directory over HTTP (browsers restrict some fetch behaviors on `file://`). From the project directory run:

```bash
# macOS / Linux
python3 -m http.server 8000
```

2. Open `http://localhost:8000` in your browser and open the DevTools console.

3. Example call (in browser console):

```javascript
// import or ensure multi-thread-download.js is loaded by index.html
(async () => {
  const url = 'https://example.com/large-file.bin'; // must support Range requests
  const chunkSize = 1024 * 1024; // 1 MiB chunks
  const poolLimit = 4; // up to 4 concurrent requests

  const buffers = await download({ url, chunkSize, poolLimit });
  // 'saveAs' in the repo triggers a download of the assembled bytes
  saveAs({ name: 'large-file.bin', buffers, mime: 'application/octet-stream' });
})();
```

## Requirements / Server constraints

- The remote server must support Range requests. Look for the `Accept-Ranges: bytes` response header.
- The server must provide `Content-Length` in response to `HEAD` (or at least to `GET`) so the code can compute chunks.
- CORS: If the file is on a different origin, the server must allow cross-origin requests and expose the `Content-Length` header and allow `Range` requests. Example response headers you may need:
  - `Access-Control-Allow-Origin: *` (or your origin)
  - `Access-Control-Expose-Headers: Content-Length`

If these are missing the code may fail or return incorrect behavior.

## Troubleshooting

- If `content-length` is null: the server did not return `Content-Length` for HEAD. Try a `GET` or ensure server sets the header.
- If chunks fail with CORS errors: configure the remote server to allow CORS and to expose the required headers.
- If the reassembled file is corrupted: ensure chunks are concatenated in order (the code sorts/uses indexes) and the content-length was computed correctly.

## Edge cases and limitations

- Small files: the code will work but overhead may make this slower than a single GET.
- Non-seekable resources (e.g., generated responses that don't honor Range): this approach won't work.
- The code currently trusts `content-length` returned by HEAD; transient or dynamically changing resources may cause mismatch.

## Next steps / improvements

- Add progress reporting for each chunk (e.g., bytes loaded) and global progress UI.
- Add retry/backoff for failed chunk requests.
- Add streaming reassembly to reduce memory peak for very large files.
- Provide a nicer save dialog and allow selecting file name from the caller.

## License

MIT — feel free to reuse and adapt.

## Contact / notes

If you want, I can:
- Add a small demo page in `index.html` that wires up controls (URL, chunk size, concurrency) and shows progress.
- Add unit tests / smoke tests to validate concatenation and small-download flows.

Happy to implement any of those next. 

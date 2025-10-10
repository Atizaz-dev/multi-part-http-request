function concatenate(arrays) {
  if (!arrays.length) return null;
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  let result = new Uint8Array(totalLength);
  let length = 0;
  for (let array of arrays) {
    result.set(array, length);
    length += array.length;
  }
  return result;
}


async function getContentLength(url) {
  const res = await fetch(url, { method: "HEAD" })
  return res.headers.get("content-length");
}

function getBinaryContent(url, start, end, i) {
  return new Promise(async (resolve, reject) => {
    try {
      const headers = new Headers();
      headers.append("Range", `bytes=${start}-${end}`);
      const request = new Request(url, { headers: headers });
      fetch(request)
        .then(response => response.arrayBuffer())
        .then(response => {
          console.log(`${i + 1} success is done`, response);
          resolve({
            index: i, // file block index
            buffer: response,
          });
        });
    } catch (err) {
      console.log(` error in chunk ${i + 1}`, err);
      reject(new Error(err));
    }
  });
}

function saveAs({ name, buffers, mime = "application/octet-stream" }) {

  const url = window.URL.createObjectURL(new Blob([buffers]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "WebGL_Arthur.data");
  document.body.appendChild(link);
  link.click();
  // const blob = new Blob([buffers], { type: mime });
  // const blobUrl = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.download = name || Math.random();
  // a.href = blobUrl;
  // a.click();
  // URL.revokeObjectURL(blob);
}

async function asyncPool(concurrency, iterable, iteratorFn) {
  const ret = []; // Store all asynchronous tasks
  const executing = new Set(); // Stores executing asynchronous tasks
  for (const item of iterable) {
    // Call the iteratorFn function to create an asynchronous task
    const p = Promise.resolve().then(() => iteratorFn(item, iterable));

    ret.push(p); // save new async task
    executing.add(p); // Save an executing asynchronous task

    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= concurrency) {
      // Wait for faster task execution to complete 
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

async function download({ url, chunkSize, poolLimit = 1 }) {
  const contentLength = await getContentLength(url);
  const chunks =
    typeof chunkSize === "number" ? Math.ceil(contentLength / chunkSize) : 1;
  const results = await asyncPool(
    poolLimit,
    [...new Array(chunks).keys()],
    (i) => {
      let start = i * chunkSize;
      let end = i + 1 == chunks ? contentLength - 1 : (i + 1) * chunkSize - 1;
      return getBinaryContent(url, start, end, i);
    }
  );
  const sortedBuffers = results
    .map((item) => new Uint8Array(item.buffer));
  return concatenate(sortedBuffers);
}
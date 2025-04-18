import child_process from "child_process";
import fs from "fs";

test("test custom selector crawls JS files as pages", async () => {
  try {
    child_process.execSync(
      "docker run -v $PWD/test-crawls:/crawls webrecorder/browsertrix-crawler crawl --url https://www.iana.org/ --collection custom-sel-1 --selectLinks \"script[src]->src\"",
    );
  } catch (error) {
    console.log(error);
  }

  const crawledPages = fs.readFileSync(
    "test-crawls/collections/custom-sel-1/pages/pages.jsonl",
    "utf8",
  );
  const pages = new Set();

  for (const line of crawledPages.trim().split("\n")) {
    const url = JSON.parse(line).url;
    if (!url) {
      continue;
    }
    pages.add(url);
  }

  const crawledExtraPages = fs.readFileSync(
    "test-crawls/collections/custom-sel-1/pages/extraPages.jsonl",
    "utf8",
  );
  const extraPages = new Set();

  for (const line of crawledExtraPages.trim().split("\n")) {
    const url = JSON.parse(line).url;
    if (!url) {
      continue;
    }
    extraPages.add(url);
  }

  const expectedPages = new Set([
    "https://www.iana.org/",
  ]);

  const expectedExtraPages = new Set([
    "https://www.iana.org/_js/jquery.js",
    "https://www.iana.org/_js/iana.js",
  ]);

  expect(pages).toEqual(expectedPages);
  expect(extraPages).toEqual(expectedExtraPages);
});


test("test invalid selector, crawl fails", async () => {
  let status = 0;
  try {
    child_process.execSync(
      "docker run -v $PWD/test-crawls:/crawls webrecorder/browsertrix-crawler crawl --url https://www.iana.org/ --collection custom-sel-invalid --selectLinks \"script[\"",
    );
  } catch (e) {
    status = e.status;
  }

  // logger fatal exit code
  expect(status).toBe(17);
});

test("test valid autoclick selector passes validation", async () => {
  let failed = false;

  try {
    child_process.execSync(
      "docker run -v $PWD/test-crawls:/crawls webrecorder/browsertrix-crawler crawl --url https://example.com/ --clickSelector button --scopeType page",
    );
  } catch (e) {
    failed = true;
  }

  // valid clickSelector
  expect(failed).toBe(false);
});


test("test invalid autoclick selector fails validation, crawl fails", async () => {
  let status = 0;

  try {
    child_process.execSync(
      "docker run -v $PWD/test-crawls:/crawls webrecorder/browsertrix-crawler crawl --url https://example.com/ --clickSelector \",\" --scopeType page",
    );
  } catch (e) {
    status = e.status;
  }

  // logger fatal exit code
  expect(status).toBe(17);
});
 

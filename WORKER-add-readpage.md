# Worker addition — `readpage`

**Deploy:** `cd worker-scrape && npx wrangler deploy`

## Why

The setback lookup must read a city's actual municipal code, not recall it. The AI proxy has no web
access, so asking it for a setback is memory, not research — and a setback is a legal constraint:
a wrong number puts a pool in the wrong place and you find out at plan check.

`worker-scrape` already fetches pages, but `scrapeOne()` only returns product fields. This adds a
plain "give me this page as text" mode so the model extracts from the page in front of it and can
cite the section it came from.

## The change

In `worker-scrape/src/index.js`, beside the existing `if (body.type === "scrape")` line, add:

```js
      // Plain text of one page, for reading source documents — municipal code, HOA
      // guidelines, a spec sheet. Returns what the page says and nothing more; the
      // caller does the understanding.
      if (body.type === "readpage") {
        let u;
        try { u = new URL(body.url); } catch (e) { return json({ ok:false, error:"bad url" }); }
        if (u.protocol !== "https:" && u.protocol !== "http:")
          return json({ ok:false, error:"only http(s)" });
        const { html, finalUrl } = await getHtml(u.href);
        if (!html) return json({ ok:false, error:"could not read that page" });
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
          .replace(/<!--[\s\S]*?-->/g, " ")
          .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, "\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/[ \t]+/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        const cap = Math.min(+body.max || 120000, 200000);
        return json({ ok:true, url:finalUrl || u.href,
                      text: text.slice(0, cap), truncated: text.length > cap });
      }
```

## Contract

Request  `{type:"readpage", url:"https://...", max?:120000}`
Reply    `{ok:true, url:"<final url after redirects>", text:"...", truncated:false}`
Error    `{ok:false, error:"bad url" | "only http(s)" | "could not read that page"}`

No key, no state, no storage. It reads one public page and hands back its words.

## Until it is deployed

`sbLookup()` checks for it and reports `needs-worker` rather than falling back to recall. Nothing
in the app invents a setback while this is missing.

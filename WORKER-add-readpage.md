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

**Already made.** `worker-scrape/src/index.js` now has a `readPage()` function and a
`if (body.type === "readpage")` line beside the existing `scrape` one. Nothing else in the worker
was touched, and every existing caller behaves exactly as before.

## Contract

Request  `{type:"readpage", url:"https://...", max?:120000}`
Reply    `{ok:true, url:"<final url after redirects>", text:"...", truncated:false}`
Error    `{ok:false, error:"bad url" | "only http(s)" | "could not read that page"}`

No key, no state, no storage. It reads one public page and hands back its words.

## All you have to do

```
cd worker-scrape
npx wrangler deploy
```

That is it. No secrets, no bindings, no config change.

## Until it is deployed

`sbLookup()` checks for it and reports `needs-worker` rather than falling back to recall. Nothing
in the app invents a setback while this is missing.

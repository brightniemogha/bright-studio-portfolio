/*!
 * cms-bind.js — the one bridge between Decap CMS content and the site.
 *
 * The source of truth is public/data/content.json (also bundled as
 * /data/content.json). Decap commits edits there, Netlify deploys, and this
 * loader picks up the latest file. Page components never contain brand names,
 * contact details, project details or prices.
 */
(function (global) {
  "use strict";

  var VERSION = "1.0.0";
  var DEFAULT_URL = "data/content.json";

  function resolveContentUrl(url) {
    if (url) return new URL(url, document.baseURI).href;
    return new URL(DEFAULT_URL, document.baseURI).href;
  }

  function assertShape(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Content file is empty.");
    }
    if (!data.brand || !data.brand.name) {
      throw new Error("Content file is missing brand.name.");
    }
    if (!data.contact || !data.contact.whatsapp) {
      throw new Error("Content file is missing contact.whatsapp.");
    }
    if (!Array.isArray(data.projects) || data.projects.length === 0) {
      throw new Error("Content file has no projects.");
    }
    return data;
  }

  async function loadContent(url) {
    var response = await fetch(resolveContentUrl(url), {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error("Could not load content.json (" + response.status + ").");
    }
    return assertShape(await response.json());
  }

  global.BrightCMS = Object.freeze({
    version: VERSION,
    contentUrl: resolveContentUrl(),
    loadContent: loadContent,
  });

  global.dispatchEvent(
    new CustomEvent("bright:cms-ready", {
      detail: { version: VERSION, contentUrl: resolveContentUrl() },
    }),
  );
})(window);

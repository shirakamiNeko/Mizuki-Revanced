// src/scripts/tab-visibility.js
// Dynamic title and favicon on tab visibility change

// import I18nKey from "../i18n/i18nKey";
// import { i18n } from "../i18n/translation";

function initTabVisibility() {
	const originalTitle = document.title;
	const favicons = document.querySelectorAll('link[rel="icon"]');
	const originalHrefs = [...favicons].map((link) => link.href);
	let timeoutId = null;

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			document.title = "(つ﹏⊂) 你個嘢壞咗呀...";
			favicons.forEach((link) => (link.href = "/favicon/failure.ico"));
		} else {
			document.title = "(●´3｀●) 復活成功";
			favicons.forEach((link, i) => (link.href = originalHrefs[i]));
			timeoutId = window.setTimeout(() => {
				document.title = originalTitle;
				timeoutId = null;
			}, 1500);
		}
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initTabVisibility);
} else {
	initTabVisibility();
}


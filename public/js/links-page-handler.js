// 連結頁面處理腳本
// 此腳本作為全域腳本載入，不受 Swup 頁面切換影響

(() => {
	console.log("[Links Global] Script loaded");

	// 使用全域變數存儲狀態
	if (typeof window.linksPageState === "undefined") {
		window.linksPageState = {
			initialized: false,
			eventListeners: [],
			mutationObserver: null,
			copySuccessText: "已複製", // 預設值，會被頁面覆蓋
		};
	}

	// 初始化函數
	function initLinksPage() {
		console.log("[Links Global] initLinksPage called");

		var searchInput = document.getElementById("link-search");
		var linksGrid = document.getElementById("links-grid");
		var noResults = document.getElementById("no-results");

		// 如果關鍵元素不存在，直接返回
		if (!searchInput || !linksGrid || !noResults) {
			return false;
		}

		var tagFilters = document.querySelectorAll(".filter-tag");
		var linkCards = document.querySelectorAll(".link-card");
		var copyButtons = document.querySelectorAll(".copy-link-btn");

		console.log("[Links Global] Found elements:", {
			cards: linkCards.length,
			filters: tagFilters.length,
			copyButtons: copyButtons.length,
		});

		// 從頁面獲取複製成功文字
		var copySuccessTextElement = document.getElementById(
			"links-copy-success-text",
		);
		if (copySuccessTextElement) {
			window.linksPageState.copySuccessText =
				copySuccessTextElement.textContent;
		}

		// 清理舊的事件監聽器
		if (window.linksPageState.eventListeners.length > 0) {
			console.log(
				"[Links Global] Cleaning",
				window.linksPageState.eventListeners.length,
				"old listeners",
			);
			for (var i = 0; i < window.linksPageState.eventListeners.length; i++) {
				var listener = window.linksPageState.eventListeners[i];
				var element = listener[0];
				var type = listener[1];
				var handler = listener[2];
				if (element && element.removeEventListener) {
					element.removeEventListener(type, handler);
				}
			}
			window.linksPageState.eventListeners = [];
		}

		var currentTag = "all";
		var searchTerm = "";

		// 篩選函數
		function filterLinks() {
			var visibleCount = 0;
			for (var i = 0; i < linkCards.length; i++) {
				var card = linkCards[i];
				var title = (card.getAttribute("data-title") || "").toLowerCase();
				var desc = (card.getAttribute("data-desc") || "").toLowerCase();
				var tags = card.getAttribute("data-tags") || "";

				var matchesSearch =
					!searchTerm ||
					title.indexOf(searchTerm) >= 0 ||
					desc.indexOf(searchTerm) >= 0;
				var matchesTag =
					currentTag === "all" || tags.split(",").indexOf(currentTag) >= 0;

				if (matchesSearch && matchesTag) {
					card.style.display = "";
					visibleCount++;
				} else {
					card.style.display = "none";
				}
			}

			if (visibleCount === 0) {
				noResults.classList.remove("hidden");
				linksGrid.classList.add("hidden");
			} else {
				noResults.classList.add("hidden");
				linksGrid.classList.remove("hidden");
			}
		}

		// 搜尋功能
		var searchHandler = (e) => {
			searchTerm = e.target.value.toLowerCase();
			filterLinks();
		};
		searchInput.addEventListener("input", searchHandler);
		window.linksPageState.eventListeners.push([
			searchInput,
			"input",
			searchHandler,
		]);

		// 標籤篩選
		for (var i = 0; i < tagFilters.length; i++) {
			((button) => {
				var clickHandler = () => {
					// 更新選中狀態
					for (var j = 0; j < tagFilters.length; j++) {
						var btn = tagFilters[j];
						btn.classList.remove("active");
					}
					button.classList.add("active");

					currentTag = button.getAttribute("data-tag") || "all";
					filterLinks();
				};
				button.addEventListener("click", clickHandler);
				window.linksPageState.eventListeners.push([
					button,
					"click",
					clickHandler,
				]);
			})(tagFilters[i]);
		}

		// 複製連結功能
		for (var i = 0; i < copyButtons.length; i++) {
			((button) => {
				var clickHandler = () => {
					var url = button.getAttribute("data-url");
					if (!url) return;

					if (navigator.clipboard && navigator.clipboard.writeText) {
						navigator.clipboard
							.writeText(url)
							.then(() => {
								var originalHTML = button.innerHTML;
								button.innerHTML =
									'<div class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-xs">' +
									window.linksPageState.copySuccessText +
									"</span></div>";
								button.classList.add("text-green-500");
								setTimeout(() => {
									button.innerHTML = originalHTML;
									button.classList.remove("text-green-500");
								}, 2000);
							})
							.catch((err) => {
								console.error("[Links Global] Copy failed:", err);
							});
					}
				};
				button.addEventListener("click", clickHandler);
				window.linksPageState.eventListeners.push([
					button,
					"click",
					clickHandler,
				]);
			})(copyButtons[i]);
		}

		window.linksPageState.initialized = true;
		console.log(
			"[Links Global] ✅ Initialization complete with",
			window.linksPageState.eventListeners.length,
			"listeners",
		);
		return true;
	}

	// 帶重試的初始化
	function tryInit(retries) {
		retries = retries || 0;
		if (initLinksPage()) {
			console.log("[Links Global] Init succeeded");
			return;
		}
		if (retries < 5) {
			setTimeout(() => {
				tryInit(retries + 1);
			}, 100);
		}
	}

	// MutationObserver 監聽 DOM 變化
	function setupMutationObserver() {
		if (window.linksPageState.mutationObserver) {
			window.linksPageState.mutationObserver.disconnect();
		}

		window.linksPageState.mutationObserver = new MutationObserver(
			(mutations) => {
				var shouldInit = false;
				for (var i = 0; i < mutations.length; i++) {
					var mutation = mutations[i];
					if (mutation.addedNodes && mutation.addedNodes.length > 0) {
						for (var j = 0; j < mutation.addedNodes.length; j++) {
							var node = mutation.addedNodes[j];
							if (node.nodeType === 1) {
								if (
									node.id === "links-grid" ||
									node.id === "link-search" ||
									(node.querySelector && node.querySelector("#links-grid"))
								) {
									shouldInit = true;
									break;
								}
							}
						}
					}
					if (shouldInit) break;
				}

				if (shouldInit) {
					console.log("[Links Global] DOM mutation detected");
					window.linksPageState.initialized = false;
					setTimeout(() => {
						tryInit();
					}, 50);
				}
			},
		);

		window.linksPageState.mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// 頁面載入時初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			console.log("[Links Global] DOMContentLoaded");
			tryInit();
		});
	} else {
		tryInit();
	}

	// 啟動 MutationObserver
	setupMutationObserver();

	// 監聽所有可能的頁面切換事件
	var events = [
		"swup:contentReplaced",
		"swup:pageView",
		"astro:page-load",
		"astro:after-swap",
	];

	for (var i = 0; i < events.length; i++) {
		((eventName) => {
			document.addEventListener(eventName, () => {
				console.log("[Links Global] Event:", eventName);
				window.linksPageState.initialized = false;
				setTimeout(() => {
					tryInit();
				}, 100);
			});
		})(events[i]);
	}

	console.log("[Links Global] All listeners registered");
})();

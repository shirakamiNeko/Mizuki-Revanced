import I18nKey from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";
import "../styles/devtools-banner.css";

const config = {
    linkHref: "/license",
    message: i18n(I18nKey.devtoolsMessage),
    linkText: i18n(I18nKey.devtoolsLinkText),
};

function createBanner(message: string): void {
    const existing = document.getElementById("dev-banner");
    if (existing) {
        existing.remove();
    }

    const banner = document.createElement("div");
    banner.id = "dev-banner";
    banner.innerHTML = `
        <button id="dev-banner-close">&times;</button>
        <span id="dev-banner-message">${message}</span>
        <a href="${config.linkHref}">${config.linkText}</a>
    `;

    document.body.appendChild(banner);

    document.getElementById("dev-banner-close")?.addEventListener("click", function () {
        banner.classList.add("hide");
        setTimeout(function () {
            banner.remove();
        }, 300);
    });

    setTimeout(function () {
        if (document.getElementById("dev-banner")) {
            banner.classList.add("hide");
            setTimeout(function () {
                banner.remove();
            }, 300);
        }
    }, 5000);
}

// F12 key detection
document.addEventListener("keydown", function (event: KeyboardEvent) {
    if (event.key === "F12" || event.keyCode === 123) {
        createBanner(config.message);
    }

    if (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "i")) {
        createBanner(config.message);
    }

    if (event.ctrlKey && event.shiftKey && (event.key === "J" || event.key === "j")) {
        createBanner(config.message);
    }

    if (event.ctrlKey && event.shiftKey && (event.key === "C" || event.key === "c")) {
        createBanner(config.message);
    }

    if (event.metaKey && event.altKey && (event.key === "I" || event.key === "i")) {
        createBanner(config.message);
    }
});

document.addEventListener("contextmenu", function (event: MouseEvent) {
    // Uncomment below if you want to show banner on right-click
    // createBanner(config.message);
});

document.addEventListener("copy", function () {
    // createBanner(config.copyMessage);
});
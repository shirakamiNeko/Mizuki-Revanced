// src/scripts/devtools-detect.ts
// DevTools detection and warning banner

import I18nKey from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";

const config = {
    linkHref: '/license',
    message: i18n(I18nKey.devtoolsMessage),
    linkText: i18n(I18nKey.devtoolsLinkText),
    //copyMessage: i18n(I18nKey.copyMessage)
};

function createBanner(message: string): void {
    // Remove existing banner first
    const existing = document.getElementById('dev-banner');
    if (existing) {
        existing.remove();
    }

    const style = document.createElement('style');
    style.id = 'dev-banner-style';
    if (!document.getElementById('dev-banner-style')) {
        style.textContent = `
            @keyframes devBannerSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes devBannerSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            #dev-banner {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                color: var(--text-color);
                padding: 15px 20px;
                border-radius: 12px;
                border: 1px solid var(--line-divider);
                z-index: 99999;
                font-size: 14px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                animation: devBannerSlideIn 0.3s ease-out forwards;
                max-width: 300px;
            }
            
            #dev-banner.hide {
                animation: devBannerSlideOut 0.3s ease-in forwards;
            }
            
            #dev-banner-message {
                margin-right: 20px;
            }
            
            #dev-banner a {
                color: var(--primary);
                text-decoration: none;
                display: block;
                margin-top: 8px;
                font-weight: 500;
            }
            
            #dev-banner a:hover {
                text-decoration: underline;
            }
            
            #dev-banner-close {
                position: absolute;
                top: 8px;
                right: 10px;
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }
            
            #dev-banner-close:hover {
                opacity: 1;
            }
            
            html.dark #dev-banner {
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    const banner = document.createElement('div');
    banner.id = 'dev-banner';
    banner.innerHTML = `
        <button id="dev-banner-close">&times;</button>
        <span id="dev-banner-message">${message}</span>
        <a href="${config.linkHref}">${config.linkText}</a>
    `;

    document.body.appendChild(banner);

    document.getElementById('dev-banner-close')?.addEventListener('click', function() {
        banner.classList.add('hide');
        setTimeout(function() {
            banner.remove();
        }, 300);
    });

    // Auto hide after 5 seconds
    setTimeout(function() {
        if (document.getElementById('dev-banner')) {
            banner.classList.add('hide');
            setTimeout(function() {
                banner.remove();
            }, 300);
        }
    }, 5000);
}

// F12 key detection
document.addEventListener('keydown', function(event: KeyboardEvent) {
    // F12 key
    if (event.key === 'F12' || event.keyCode === 123) {
        createBanner(config.message);
    }
    
    // Ctrl+Shift+I (Chrome DevTools)
    if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i')) {
        createBanner(config.message);
    }
    
    // Ctrl+Shift+J (Chrome Console)
    if (event.ctrlKey && event.shiftKey && (event.key === 'J' || event.key === 'j')) {
        createBanner(config.message);
    }
    
    // Ctrl+Shift+C (Chrome Inspect Element)
    if (event.ctrlKey && event.shiftKey && (event.key === 'C' || event.key === 'c')) {
        createBanner(config.message);
    }
    
    // Cmd+Option+I (Mac Chrome DevTools)
    if (event.metaKey && event.altKey && (event.key === 'I' || event.key === 'i')) {
        createBanner(config.message);
    }
});

// Right click context menu (optional - for "Inspect")
document.addEventListener('contextmenu', function(event: MouseEvent) {
    // We can't detect if they click "Inspect", but we could show a reminder
    // Uncomment below if you want to show banner on right-click
    // createBanner(config.message);
});

// Copy detection
document.addEventListener('copy', function() {
    // We don't need this message for now
    // createBanner(config.copyMessage);
});
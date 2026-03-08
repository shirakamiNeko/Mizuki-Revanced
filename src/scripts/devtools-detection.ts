// src/scripts/devtools-detect.ts
// DevTools detection and warning banner

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

const config = {
    linkHref: '/license',
    message: i18n(I18nKey.devtoolsMessage),
    linkText: i18n(I18nKey.devtoolsLinkText)
};

function createBanner() {
    if (document.getElementById('dev-banner')) return;

    const style = document.createElement('style');
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
            background: rgba(255, 245, 245, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #5a3a3a;
            padding: 15px 20px;
            border-radius: 12px;
            border: 1px solid rgba(90, 58, 58, 0.2);
            z-index: 99999;
            font-size: 14px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            animation: devBannerSlideIn 0.3s ease-out forwards;
            max-width: 300px;
        }
        
        #dev-banner.hide {
            animation: devBannerSlideOut 0.3s ease-in forwards;
        }
        
        #dev-banner a {
            color: #2a6a8a;
            text-decoration: none;
            display: block;
            margin-top: 8px;
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
            color: #5a3a3a;
            font-size: 18px;
            cursor: pointer;
            opacity: 0.7;
        }
        
        #dev-banner-close:hover {
            opacity: 1;
        }
        
        html.dark #dev-banner {
            background: rgba(42, 26, 26, 0.7);
            color: #d4a0a0;
            border: 1px solid rgba(212, 160, 160, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        html.dark #dev-banner a {
            color: #7eb8da;
        }
        
        html.dark #dev-banner-close {
            color: #d4a0a0;
        }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'dev-banner';
    banner.innerHTML = `
        <button id="dev-banner-close">&times;</button>
        ${config.message}
        <a href="${config.linkHref}">${config.linkText}</a>
    `;

    document.body.appendChild(banner);

    document.getElementById('dev-banner-close')?.addEventListener('click', function() {
        banner.classList.add('hide');
        setTimeout(function() {
            banner.remove();
        }, 300);
    });
}

function detectByWindowSize(): boolean {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    return widthThreshold || heightThreshold;
}

function detectByConsole(): boolean {
    let isOpen = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            isOpen = true;
        }
    });
    console.log(element);
    console.clear();
    return isOpen;
}

let devtoolsOpen = false;

function checkDevTools() {
    const isOpen = detectByWindowSize() || detectByConsole();
    
    if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        createBanner();
    }
}

checkDevTools();
setInterval(checkDevTools, 1000);
window.addEventListener('resize', checkDevTools);
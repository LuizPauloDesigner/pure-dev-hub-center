// DevCenter Floating Button & Iframe Injector

// Prevent multiple injections
if (document.getElementById('devcenter-root')) {
    throw new Error('DevCenter already injected');
}

// Configuration
const CONFIG = {
    width: '450px',
    buttonSize: '56px',
    zIndex: '2147483647', // Max z-index
    primaryColor: '#e11d48', // Tailwind rose-600
    hoverColor: '#be123c', // Tailwind rose-700
};

// Create Shadow Host (to isolate styles)
const host = document.createElement('div');
host.id = 'devcenter-root';
// set style to ensure it doesn't affect page layout
host.style.position = 'fixed';
host.style.bottom = '20px';
host.style.right = '20px';
host.style.zIndex = CONFIG.zIndex;
host.style.width = '0';
host.style.height = '0';
host.style.overflow = 'visible';

document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// Add Styles
const style = document.createElement('style');
style.textContent = `
  /* Reset */
  * { box-sizing: border-box; }
  
  /* Container for Button */
  .fab-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    z-index: ${CONFIG.zIndex};
  }

  /* Floating Action Button */
  .fab {
    width: ${CONFIG.buttonSize};
    height: ${CONFIG.buttonSize};
    border-radius: 50%;
    background-color: ${CONFIG.primaryColor};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
    color: white;
  }

  .fab:hover {
    background-color: ${CONFIG.hoverColor};
    transform: scale(1.05);
  }

  .fab:active {
    transform: scale(0.95);
  }

  /* Icon inside FAB */
  .fab svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Iframe Container */
  .iframe-container {
    position: fixed;
    top: 0;
    right: 0;
    width: ${CONFIG.width};
    height: 100vh;
    background: white;
    box-shadow: -5px 0 25px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: ${parseInt(CONFIG.zIndex) - 1}; /* Behind button slightly but high */
    display: flex;
    flex-direction: column;
  }
  
  .iframe-container.open {
    transform: translateX(0);
  }

  /* Iframe itself */
  iframe {
    border: none;
    width: 100%;
    height: 100%;
    background: white;
  }
  
  /* Overlay (optional, for clicking outside) */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.2);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: ${parseInt(CONFIG.zIndex) - 2};
  }
  
  .overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
`;
shadow.appendChild(style);

// --- Create Elements ---

// 1. Overlay
const overlay = document.createElement('div');
overlay.className = 'overlay';
shadow.appendChild(overlay);

// 2. Iframe Container
const iframeContainer = document.createElement('div');
iframeContainer.className = 'iframe-container';
shadow.appendChild(iframeContainer);

// 3. Iframe (Lazy loaded)
let iframeLoaded = false;
const iframe = document.createElement('iframe');
// Don't set src immediately to save resources

// 4. FAB Container & Button
const fabContainer = document.createElement('div');
fabContainer.className = 'fab-container';

const fab = document.createElement('button');
fab.className = 'fab';
fab.title = 'Abrir DevCenter';
fab.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
`; // Chevron Up initially? Or code icon? Let's use Code/Terminal icon or Chevron
// Let's use a terminal icon
fab.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal"><polyline points="4 17 10 11"/><line x1="12" x2="20" y1="19" y2="19"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
`;

fabContainer.appendChild(fab);
shadow.appendChild(fabContainer);

// --- Logic ---

let isOpen = false;

function togglePanel() {
    isOpen = !isOpen;

    if (isOpen) {
        // Load iframe content on first open
        if (!iframeLoaded) {
            iframe.src = chrome.runtime.getURL('index.html');
            iframeContainer.appendChild(iframe);
            iframeLoaded = true;
        }

        iframeContainer.classList.add('open');
        overlay.classList.add('open');

        // Change icon to X (close)
        fab.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    `;
        fab.style.backgroundColor = '#9f1239'; // Darker/Redder for close action

    } else {
        iframeContainer.classList.remove('open');
        overlay.classList.remove('open');

        // Change icon back to Terminal
        fab.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal"><polyline points="4 17 10 11"/><line x1="12" x2="20" y1="19" y2="19"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
    `;
        fab.style.backgroundColor = CONFIG.primaryColor;
    }
}

// Event Listeners
fab.addEventListener('click', togglePanel);
overlay.addEventListener('click', () => {
    if (isOpen) togglePanel();
});

// Optional: Keyboard shortcut listener from within the page context?
// Maybe not necessary as global shortcut exists.

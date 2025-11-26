(function() {
    // Check for Global Data (Next.js hydration data)
    function checkGlobalData() {
        if (window.__NEXT_DATA__) {
            try {
                const jsonStr = JSON.stringify(window.__NEXT_DATA__);
                if (jsonStr.includes('question') && jsonStr.includes('choices')) {
                     window.postMessage({ type: 'QUIZ_DATA_INTERCEPTED', data: window.__NEXT_DATA__, source: 'GLOBAL' }, '*');
                }
            } catch (e) {
            }
        }
    }
    checkGlobalData();
    setTimeout(checkGlobalData, 1000);
    setTimeout(checkGlobalData, 3000);

    // Monkey Patch Fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0] instanceof Request ? args[0].url : args[0];

        const response = await originalFetch.apply(this, args);
        
        try {
            const clone = response.clone();
            
            if (url && url.toString().includes('/attempts')) {
                clone.json().then(data => {
                    window.postMessage({ type: 'QUIZ_DATA_INTERCEPTED', data: data, source: 'API_FETCH' }, '*');
                }).catch(err => {});
            }
        } catch (err) {}

        return response;
    };

    // Monkey Patch XMLHttpRequest (for Axios)
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
        this.addEventListener('load', function() {
            if (this._url && this._url.toString().includes('/attempts')) {
                try {
                    const data = JSON.parse(this.responseText);
                    window.postMessage({ type: 'QUIZ_DATA_INTERCEPTED', data: data, source: 'API_XHR' }, '*');
                } catch (err) {
                }
            }
        });
        return originalXhrSend.apply(this, arguments);
    };
})();

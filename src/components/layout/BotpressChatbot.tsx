import React, { useEffect } from 'react';

/**
 * Botpress Webchat component for CivicFix.
 * Configures the chatbot with:
 * - AI Assistant Name: "Civi"
 * - CivicFix Dark Slate & Cyan Color Palette
 * - Responsive floating position
 * - Direct initialization with exact credentials & conversation starters
 */
export const BotpressChatbot: React.FC = () => {
  useEffect(() => {
    // Intercept third-party network blips from botpress to prevent uncaught runtime error banners
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event.reason?.message || event.reason?.stack || event.reason || '');
      if (
        reasonStr.includes('botpress') ||
        reasonStr.includes('bpcontent') ||
        reasonStr.includes('Failed to fetch')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const initBotpressConfig = () => {
      if (typeof window !== 'undefined' && (window as any).botpress) {
        try {
          (window as any).botpress.init({
            botId: '3f8441cc-6b66-4df4-b780-04d0350e832c',
            clientId: '09b24a60-1ad6-4b14-9b70-9437abc68ba4',
            configuration: {
              version: 'v2',
              botName: 'Civi',
              botDescription: 'CivicFix AI Assistant',
              color: '#06b6d4',
              radius: 1,
              themeMode: 'dark',
              variant: 'solid',
              fontFamily: 'inherit',
              composerPlaceholder: 'Ask Civi about municipal issues, tracking, or filing...',
              welcomeHeading: "Hi, I'm Civi 👋",
              welcomeSubtitle: 'Your CivicFix AI Assistant. How can I help resolve civic issues in your area today?',
              mainCardTitle: 'Ask Civi a question',
              mainCardSubtitle: 'File issues, check resolution progress, and explore municipal timelines',
              website: {},
              email: {},
              phone: {},
              termsOfService: {},
              privacyPolicy: {},
              conversationStartersEnabled: true,
              conversationStarters: [
                {
                  id: 'file_complaint',
                  text: 'File a complaint',
                  title: 'File a complaint',
                  icon: 'file-text',
                  enabled: true,
                },
                {
                  id: 'check_status',
                  text: 'Check ticket status',
                  title: 'Check ticket status',
                  icon: 'search',
                  enabled: true,
                },
                {
                  id: 'how_it_works',
                  text: 'How it works',
                  title: 'How it works',
                  icon: 'sparkles',
                  enabled: true,
                },
                {
                  id: 'resolution_timelines',
                  text: 'Municipal timelines',
                  title: 'Municipal timelines',
                  enabled: true,
                },
              ],
              conversationStartersDisplayStyle: 'cards',
              citationsEnabled: true,
              agentPresenceEnabled: true,
              additionalStylesheetUrl: '/botpress-civicfix.css',
            },
          });
        } catch (err) {
          console.warn('Botpress init warning:', err);
        }
      }
    };

    // Prevent duplicate injection of the main script
    let injectScript = document.getElementById('bp-inject-script') as HTMLScriptElement | null;
    if (!injectScript) {
      injectScript = document.createElement('script');
      injectScript.id = 'bp-inject-script';
      injectScript.src = 'https://cdn.botpress.cloud/webchat/v5.0/inject.js';
      injectScript.async = true;

      injectScript.onload = () => {
        initBotpressConfig();
      };

      document.body.appendChild(injectScript);
    } else {
      initBotpressConfig();
    }

    // Dynamic Observer: Update any fallback "Bot" text occurrences to "Civi"
    const replaceBotTextInNode = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        if (root.textContent && root.textContent.trim() === 'Bot') {
          root.textContent = 'Civi';
        }
      } else if (root.nodeType === Node.ELEMENT_NODE) {
        const el = root as HTMLElement;
        if (el.shadowRoot) {
          observeRoot(el.shadowRoot);
          traverseAndReplace(el.shadowRoot);
        }
        for (let i = 0; i < el.childNodes.length; i++) {
          replaceBotTextInNode(el.childNodes[i]);
        }
      }
    };

    const traverseAndReplace = (node: Node) => {
      replaceBotTextInNode(node);
    };

    const observedRoots = new WeakSet<Node>();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => traverseAndReplace(node));
        } else if (mutation.type === 'characterData') {
          if (mutation.target.textContent && mutation.target.textContent.trim() === 'Bot') {
            mutation.target.textContent = 'Civi';
          }
        }
      }
    });

    const observeRoot = (rootNode: Node) => {
      if (observedRoots.has(rootNode)) return;
      observedRoots.add(rootNode);
      observer.observe(rootNode, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    observeRoot(document.body);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      observer.disconnect();
    };
  }, []);

  return null;
};

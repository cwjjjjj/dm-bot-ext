import { createRoot } from 'react-dom/client';
import DMButton from '~/components/DMButton';

/**
 * Mount DM button using Shadow DOM to isolate from Instagram's styles
 */
export async function mountDMButton(ctx: any): Promise<any> {
  try {
    const { waitForProfileHeader } = await import('~/lib/instagram-dom');
    const header = await waitForProfileHeader();

    // Create Shadow DOM UI
    const ui = await createShadowRootUi(ctx, {
      name: 'dm-bot-button',
      position: 'inline',
      anchor: header,
      append: 'last',
      onMount: (uiContainer: HTMLElement, shadow: ShadowRoot) => {
        // Add scoped styles
        const style = document.createElement('style');
        style.textContent = `
          .dm-bot-container {
            display: inline-block;
            margin-left: 8px;
          }
        `;
        shadow.appendChild(style);

        // Create React root
        const root = createRoot(uiContainer);
        root.render(<DMButton />);

        return root;
      },
      onRemove: (root: any) => {
        root?.unmount();
      },
    });

    ui.mount();
    return ui;
  } catch (error) {
    console.error('[DM Bot] Failed to mount:', error);
    return null;
  }
}

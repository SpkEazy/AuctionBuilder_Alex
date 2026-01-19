async function generateAndDownload(template) {
  try {
    const data = await collectFormData();

    const map = {
      social: { path: 'templates/social.html', target: 'social-preview', filename: 'social.png' },
      newsletter: { path: 'templates/newsletter.html', target: 'newsletter-preview', filename: 'newsletter.png' },
      flyer: { path: 'templates/flyer.html', target: 'flyer-preview', filename: 'flyer.png' }
    };

    const cfg = map[template];
    if (!cfg) throw new Error(`Unknown template: ${template}`);

    const { path, target, filename } = cfg;
    const previewWrapper = document.getElementById(target);
    if (!previewWrapper) throw new Error(`Preview wrapper not found: #${target}`);

    // Load + render HTML into preview
    await loadTemplate(path, target, data);

    // Let the browser commit DOM changes
    await waitForRenderFrames(2);

    // Find the capture container inside this preview (social/newsletter/flyer)
    const container = await waitForElement('[id^="capture-container"]', previewWrapper, 5000);
    if (!container) throw new Error("Template container not found after render.");
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      throw new Error("Template container has zero size (not rendered/visible).");
    }

    // Make sure it is actually capturable
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = 1;
    container.style.pointerEvents = 'auto';
    container.style.position = 'static';

    // Wait for any <img> tags in the template to finish loading
    await waitForImagesToLoad(container);

    // IMPORTANT: wait for font-resize + canvas draws + layout settle
    await waitForRenderFrames(4);

    // Snapshot
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    // Export (JPEG to keep filesize small)
    canvas.toBlob((blob) => {
      if (!blob) {
        alert("❌ Export failed (blob was null).");
        return;
      }

      const link = document.createElement("a");
      link.download = filename.replace(".png", ".jpg");
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);

      // Optional: hide again after export (keeps preview clean)
      container.style.display = 'none';
      container.style.position = 'absolute';
      container.style.opacity = 0;
      container.style.pointerEvents = 'none';
    }, "image/jpeg", 0.92);

  } catch (err) {
    console.error(err);
    alert("❌ Design export failed: " + (err?.message || err));
  }
}


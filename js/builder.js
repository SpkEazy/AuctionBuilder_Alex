function formatDate(dateString, timeString) {
  if (!dateString || !timeString) return '';
  const date = new Date(`${dateString}T${timeString}`);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return `${date.toLocaleDateString('en-ZA', options)} @ ${timeString}`;
}

async function waitForElement(selector, root = document, timeout = 1000) {
  const start = Date.now();
  while (!root.querySelector(selector)) {
    await new Promise(r => requestAnimationFrame(r));
    if (Date.now() - start > timeout) return null;
  }
  return root.querySelector(selector);
}

// ✅ Downscale uploaded images to prevent memory/canvas crashes
function getImageDataUrl(inputId, maxW = 2200, maxH = 2200, quality = 0.9) {
  return new Promise((resolve) => {
    const file = document.getElementById(inputId).files[0];
    if (!file) return resolve('');

    if (file.size > 8 * 1024 * 1024) {
      alert("⚠️ Please upload an image under 8MB.");
      return resolve('');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);

        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function loadTemplate(templatePath, targetId, data) {
  const res = await fetch(templatePath);
  if (!res.ok) throw new Error(`Failed to load template: ${templatePath} (${res.status})`);
  let html = await res.text();

  for (const key in data) {
    html = html.replaceAll(`{{${key}}}`, data[key]);
  }

  const target = document.getElementById(targetId);
  target.innerHTML = html;
  await waitForImagesToLoad(target);

  if (templatePath.includes('newsletter')) {
    await drawNewsletterCanvasImage(data.propertyImage, target);
  } else if (templatePath.includes('social')) {
    await drawSocialCanvasImage(data.propertyImage, target);
  } else if (templatePath.includes('flyer')) {
    await drawFlyerCanvasImage(data.propertyImage, target);
  }

  const container = await waitForElement('[id^="capture-container"]', target, 3000);
  if (container) {
    runFontResize(container, targetId);
  }
}

function waitForImagesToLoad(container) {
  const images = container.querySelectorAll('img');
  const promises = Array.from(images).map(img =>
    new Promise(resolve => {
      if (img.complete) return resolve();
      img.onload = img.onerror = resolve;
    })
  );
  return Promise.all(promises);
}

function adjustFontSize(textbox) {
  const span = textbox.querySelector('span');
  const text = span.innerText;
  const maxWidth = textbox.offsetWidth - 20;
  const maxHeight = textbox.offsetHeight - 20;
  let fontSize = 200;

  const dummy = document.createElement('span');
  dummy.style.visibility = 'hidden';
  dummy.style.position = 'absolute';
  dummy.style.fontSize = fontSize + 'px';
  dummy.style.fontFamily = 'Roboto, sans-serif';
  dummy.innerText = text;
  document.body.appendChild(dummy);

  while (dummy.offsetWidth > maxWidth || dummy.offsetHeight > maxHeight) {
    fontSize--;
    dummy.style.fontSize = fontSize + 'px';
  }

  span.style.fontSize = fontSize + 'px';
  document.body.removeChild(dummy);
}

function runFontResize(container, templateId) {
  let ids = [];
  if (templateId.includes('social')) {
    ids = ['textbox_1_Red_Tag', 'textbox_2_Red_Tag', 'textbox_Red_Rectangle', 'textbox_Header_2'];
  } else if (templateId.includes('newsletter')) {
    ids = ['textbox_1_Red_Tag', 'textbox_2_Red_Tag', 'textbox_Property_Heading'];
  } else if (templateId.includes('flyer')) {
    ids = [
      'textbox_1_Red_Banner', 'textbox_2_Red_Banner',
      'textbox_Feature_1', 'textbox_Feature_2', 'textbox_Feature_3',
      'textbox_1_Blue_Overlay', 'textbox_2_Blue_Overlay', 'textbox_3_Blue_Overlay',
      'DATE', 'ADDRESS'
    ];
  }
  ids.forEach(id => {
    const el = container.querySelector(`#${id}`);
    if (el && el.querySelector('span')) adjustFontSize(el);
  });
}

async function generateTemplate(template) {
  const data = await collectFormData();
  const map = {
    social: { path: 'templates/social.html', target: 'social-preview' },
    newsletter: { path: 'templates/newsletter.html', target: 'newsletter-preview' },
    flyer: { path: 'templates/flyer.html', target: 'flyer-preview' }
  };
  const { path, target } = map[template];
  await loadTemplate(path, target, data);
}

async function generateAndDownload(template) {
  try {
    const data = await collectFormData();
    const map = {
      social: { path: 'templates/social.html', target: 'social-preview', filename: 'social.png' },
      newsletter: { path: 'templates/newsletter.html', target: 'newsletter-preview', filename: 'newsletter.png' },
      flyer: { path: 'templates/flyer.html', target: 'flyer-preview', filename: 'flyer.png' }
    };

    const { path, target, filename } = map[template];
    const previewWrapper = document.getElementById(target);

    await loadTemplate(path, target, data);
    await new Promise(resolve => requestAnimationFrame(resolve));

    const container = await waitForElement('[id^="capture-container"]', previewWrapper, 3000);
    if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
      throw new Error("Template container could not be rendered.");
    }

    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = 1;
    container.style.pointerEvents = 'auto';
    container.style.position = 'static';

    await waitForImagesToLoad(container);
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

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

      container.style.display = 'none';
      container.style.position = 'absolute';
      container.style.opacity = 0;
      container.style.pointerEvents = 'none';
    }, "image/jpeg", 0.92);

  } catch (err) {
    console.error(err);
    alert("❌ Design export failed: " + err.message);
  }
}

async function collectFormData() {
  return {
    headline: document.getElementById('headline').value,
    subheadline: document.getElementById('subheadline').value,
    subheadline2: document.getElementById('subheadline2')?.value || '',
    city: document.getElementById('city').value,
    suburb: document.getElementById('suburb').value,
    tag1: document.getElementById('tag1').value,
    tag2: document.getElementById('tag2').value,
    date: formatDate(
      document.getElementById('date-picker').value,
      document.getElementById('time-picker').value
    ),
    time: document.getElementById('time-picker').value,
    address: document.getElementById('address').value,
    feat1: document.getElementById('feat1').value,
    feat2: document.getElementById('feat2').value,
    feat3: document.getElementById('feat3').value,
    propertyImage: await getImageDataUrl('property-img')
  };
}

function drawFlyerCanvasImage(imageDataUrl, target) {
  const canvas = target.querySelector('#flyer-property-canvas');
  if (!canvas || !imageDataUrl) return;

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };
  img.src = imageDataUrl;
}

function drawNewsletterCanvasImage(imageDataUrl, target) {
  const canvas = target.querySelector('#property-canvas');
  if (!canvas || !imageDataUrl) return;

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width - img.width * scale) / 2;
    const y = (canvas.height - img.height * scale) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };
  img.src = imageDataUrl;
}

function drawSocialCanvasImage(imageDataUrl, target) {
  const canvas = target.querySelector('#social-property-canvas');
  if (!canvas || !imageDataUrl) return;

  const ctx = canvas.getContext('2d');

  const propertyImg = new Image();
  propertyImg.crossOrigin = 'anonymous';
  propertyImg.onload = () => {
    const scale = Math.max(canvas.width / propertyImg.width, canvas.height / propertyImg.height);
    const x = (canvas.width - propertyImg.width * scale) / 2;
    const y = (canvas.height - propertyImg.height * scale) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(propertyImg, x, y, propertyImg.width * scale, propertyImg.height * scale);

    const redTag = new Image();
    redTag.crossOrigin = 'anonymous';
    redTag.onload = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.96;

      const scaleFactor = canvas.width / 1200;
      const redTagX = 718 * scaleFactor;
      const redTagY = 0;
      const redTagWidth = 490 * scaleFactor;
      const redTagHeight = 462 * scaleFactor;

      ctx.drawImage(redTag, redTagX, redTagY, redTagWidth, redTagHeight);
      ctx.restore();
    };
    redTag.src = 'assets/red-tag.png';
  };

  propertyImg.src = imageDataUrl;
}

async function downloadWordDoc() {
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  const rawDate = document.getElementById("date-picker").value;
  const rawTime = document.getElementById("time-picker").value;
  const fullDateObj = new Date(`${rawDate}T${rawTime}`);
  const formattedDate = fullDateObj.toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const fullDateTime = `${formattedDate} @ ${rawTime}`;

  const fields = {
    "Headline": document.getElementById("headline").value,
    "City": document.getElementById("city").value,
    "Suburb": document.getElementById("suburb").value,
    "Tagline 1": document.getElementById("tag1").value,
    "Tagline 2": document.getElementById("tag2").value,
    "Date & Time": fullDateTime,
    "Feature 1": document.getElementById("feat1").value,
    "Feature 2": document.getElementById("feat2").value,
    "Feature 3": document.getElementById("feat3").value
  };

  const paragraphs = Object.entries(fields).map(([label, value]) =>
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: label + ": ", bold: true, size: 28, font: "Roboto" }),
        new TextRun({ text: value, size: 24, font: "Roboto" })
      ]
    })
  );

  const doc = new Document({
    sections: [{ children: paragraphs }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "AuctionInc_Property_Summary.docx";
  a.click();
  URL.revokeObjectURL(url);
}


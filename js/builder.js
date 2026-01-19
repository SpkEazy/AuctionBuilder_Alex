// =====================
// CONFIG (Manual controls)
// =====================

// ✅ Nudge the SOCIAL top-right red tag (in "design pixels" based on 1130-wide photo canvas system)
const SOCIAL_RED_TAG_NUDGE_X = 60; // + right, - left (try 40–120)
const SOCIAL_RED_TAG_NUDGE_Y = 0;  // + down, - up

// Optional: if you want the tag slightly more/less transparent
const SOCIAL_RED_TAG_ALPHA = 0.96;

// ✅ Broker directory convention (optional):
// assets/brokers/<brokerId>/broker-photo.png
// assets/brokers/<brokerId>/broker-phone.png
const BROKERS = {
  "alex-krause": { name: "Alex Krause", phone: "078 549 2029", email: "alex@auctioninc.co.za" },
  "gary-brower": { name: "Gary Brower", phone: "082 352 5552", email: "garyb@auctioninc.co.za" },
  "bongane-khumalo": { name: "Bongane Khumalo", phone: "073 785 5100", email: "bongane@auctioninc.co.za" },
  "cliff-matshatsha": { name: "Cliff Matshatsha", phone: "082 099 8692", email: "cliff@auctioninc.co.za" },
  "daniel-wachenheimer": { name: "Daniel Wachenheimer", phone: "082 740 2856", email: "daniel@auctioninc.co.za" },
  "dean-doucha": { name: "Dean Doucha", phone: "082 374 5565", email: "dean@auctioninc.co.za" },
  "elki-medalie": { name: "Elki Medalie", phone: "083 764 5370", email: "elki@auctioninc.co.za" },
  "doron-sacks": { name: "Doron Sacks", phone: "082 550 7081", email: "doron@auctioninc.co.za" },
  "george-merricks": { name: "George Merricks", phone: "082 859 9303", email: "george@auctioninc.co.za" },
  "gerhard-venter": { name: "Gerhard Venter", phone: "076 905 5519", email: "gerhard@auctioninc.co.za" },
  "jenny-pillay": { name: "Jenny Pillay", phone: "063 959 2260", email: "jenny@auctioninc.co.za" },
  "jessica-beyers-lahner": { name: "Jessica Beyers-Lahner", phone: "072 576 0973", email: "jessica@auctioninc.co.za" },
  "jodi-bedil": { name: "Jodi Bedil", phone: "076 637 1273", email: "jodib@auctioninc.co.za" },
  "jodi-frankel": { name: "Jodi Frankel", phone: "082 441 8409", email: "jodif@auctioninc.co.za" },
  "keith-nkosi": { name: "Keith Nkosi", phone: "081 828 1817", email: "keith@auctioninc.co.za" },
  "luanda-tlhotlhalemaje": { name: "Luanda Tlhotlhalemaje", phone: "071 904 4061", email: "luanda@skyriseproperties.co.za" },
  "nic-brett": { name: "Nic Brett", phone: "078 330 7523", email: "nic@auctioninc.co.za" },
  "reece-louw": { name: "Reece Louw", phone: "076 393 1131", email: "reece@auctioninc.co.za" },
  "reshma-sookran": { name: "Reshma Sookran", phone: "071 876 6524", email: "reshma@auctioninc.co.za" },
  "shlomo-hecht": { name: "Shlomo Hecht", phone: "073 791 7967", email: "shlomo@auctioninc.co.za" },
  "sim-mthembu": { name: "Sim Mthembu", phone: "063 829 7431", email: "simphiwe@auctioninc.co.za" },
  "stuart-holliman": { name: "Stuart Holliman", phone: "067 373 9239", email: "stuart@auctioninc.co.za" },
  "thabani-ncube": { name: "Thabani Ncube", phone: "071 624 2899", email: "thabani@auctioninc.co.za" },
  "yoni-dadon": { name: "Yoni Dadon", phone: "061 822 6128", email: "yoni@auctioninc.co.za" }
};

// =====================
// Helpers
// =====================

// ✅ parse "YYYY-MM-DD" or "YYYY/MM/DD" safely and build a Date
function parseYMD(dateString, timeString) {
  if (!dateString || !timeString) return null;

  const m = String(dateString).trim().match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]); // 1-12
  const day = Number(m[3]);

  const t = String(timeString).trim().match(/^(\d{2}):(\d{2})$/);
  if (!t) return null;

  const hh = Number(t[1]);
  const mm = Number(t[2]);

  // Local time, avoids browser parsing quirks
  const dt = new Date(year, month - 1, day, hh, mm, 0, 0);

  // guard against invalid rollover (e.g. 2025/99/99)
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== (month - 1) ||
    dt.getDate() !== day
  ) return null;

  return dt;
}

function formatDate(dateString, timeString) {
  const date = parseYMD(dateString, timeString);
  if (!date) return '';
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return `${date.toLocaleDateString('en-ZA', options)} @ ${timeString}`;
}

async function waitForElement(selector, root = document, timeout = 3000) {
  const start = Date.now();
  while (!root.querySelector(selector)) {
    await new Promise(r => requestAnimationFrame(r));
    if (Date.now() - start > timeout) return null;
  }
  return root.querySelector(selector);
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

function waitForRenderFrames(frames = 3) {
  return new Promise(resolve => {
    const step = () => {
      if (frames-- <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ✅ Always builds correct URL for GitHub Pages + local
function absUrl(relativePath) {
  return new URL(relativePath, window.location.href).toString();
}

// =====================
// Broker helpers (NEW)
// =====================
function getSelectedBroker() {
  const brokerId = document.getElementById("broker")?.value || "alex-krause";
  const broker = BROKERS[brokerId] || BROKERS["alex-krause"];
  return { brokerId, broker };
}

function setImgWithFallback(imgEl, primarySrc, fallbackSrc) {
  if (!imgEl) return;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = fallbackSrc;
  };
  imgEl.src = primarySrc;
}

function applyBrokerToTemplate(target, templatePath, brokerId, broker) {
  // NEWSLETTER: swap broker photo + contact box
  if (templatePath.includes("newsletter")) {
    const contact = target.querySelector(".textbox_Contact_Details");
    if (contact) {
      contact.innerHTML = `
        <span>${(broker.name || "").toUpperCase()}</span>
        <span>${broker.phone || ""}</span>
        <span>${broker.email || ""}</span>
      `;
    }

    const brokerPhoto = target.querySelector(".overlay-image_Broker_Photo");
    setImgWithFallback(
      brokerPhoto,
      absUrl(`assets/brokers/${brokerId}/broker-photo.png`),
      absUrl("assets/broker-photo.png")
    );
  }

  // FLYER: swap broker-phone image
  if (templatePath.includes("flyer")) {
    const brokerPhone = target.querySelector(".overlay-image_broker-phone");
    setImgWithFallback(
      brokerPhone,
      absUrl(`assets/brokers/${brokerId}/broker-phone.png`),
      absUrl("assets/broker-phone.png")
    );
  }
}

// =====================
// Image handling
// =====================
function getImageDataUrl(inputId, maxW = 2200, maxH = 2200, quality = 0.9) {
  return new Promise((resolve) => {
    const input = document.getElementById(inputId);
    const file = input?.files?.[0];
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
      img.onerror = () => resolve(reader.result || '');
      img.src = reader.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

// =====================
// Font resize
// =====================
function adjustFontSize(textbox) {
  const span = textbox.querySelector('span');
  if (!span) return;

  const text = span.innerText;
  const maxWidth = textbox.offsetWidth - 20;
  const maxHeight = textbox.offsetHeight - 20;
  let fontSize = 200;

  const dummy = document.createElement('span');
  dummy.style.visibility = 'hidden';
  dummy.style.position = 'absolute';
  dummy.style.fontFamily = 'Roboto, sans-serif';
  dummy.style.fontSize = fontSize + 'px';
  dummy.innerText = text;
  document.body.appendChild(dummy);

  while (fontSize > 5 && (dummy.offsetWidth > maxWidth || dummy.offsetHeight > maxHeight)) {
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

// =====================
// Collect form data (global)
// =====================
async function collectFormData() {
  const { brokerId, broker } = getSelectedBroker();

  return {
    brokerId,
    brokerName: broker.name || "",
    brokerPhone: broker.phone || "",
    brokerEmail: broker.email || "",

    headline: document.getElementById('headline')?.value || '',
    subheadline: document.getElementById('subheadline')?.value || '',
    subheadline2: document.getElementById('subheadline2')?.value || '',
    city: document.getElementById('city')?.value || '',
    suburb: document.getElementById('suburb')?.value || '',
    tag1: document.getElementById('tag1')?.value || '',
    tag2: document.getElementById('tag2')?.value || '',
    date: formatDate(
      document.getElementById('date-picker')?.value || '',
      document.getElementById('time-picker')?.value || ''
    ),
    time: document.getElementById('time-picker')?.value || '',
    address: document.getElementById('address')?.value || '',
    feat1: document.getElementById('feat1')?.value || '',
    feat2: document.getElementById('feat2')?.value || '',
    feat3: document.getElementById('feat3')?.value || '',
    propertyImage: await getImageDataUrl('property-img')
  };
}

// =====================
// Canvas draws (return Promises so downloads wait correctly)
// =====================
function drawFlyerCanvasImage(imageDataUrl, target) {
  return new Promise((resolve) => {
    const canvas = target.querySelector('#flyer-property-canvas');
    if (!canvas || !imageDataUrl) return resolve();

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = imageDataUrl;
  });
}

function drawNewsletterCanvasImage(imageDataUrl, target) {
  return new Promise((resolve) => {
    const canvas = target.querySelector('#property-canvas');
    if (!canvas || !imageDataUrl) return resolve();

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = imageDataUrl;
  });
}

function drawSocialCanvasImage(imageDataUrl, target) {
  return new Promise((resolve) => {
    const canvas = target.querySelector('#social-property-canvas');
    if (!canvas || !imageDataUrl) return resolve();

    const ctx = canvas.getContext('2d');

    const propertyImg = new Image();
    propertyImg.crossOrigin = 'anonymous';

    propertyImg.onload = () => {
      const scale = Math.max(canvas.width / propertyImg.width, canvas.height / propertyImg.height);
      const x = (canvas.width - propertyImg.width * scale) / 2;
      const y = (canvas.height - propertyImg.height * scale) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(propertyImg, x, y, propertyImg.width * scale, propertyImg.height * scale);

      // ✅ draw the red tag only AFTER photo is drawn
      const redTag = new Image();
      redTag.crossOrigin = 'anonymous';

      redTag.onload = () => {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = SOCIAL_RED_TAG_ALPHA;

        // Your mapping is based on the 1130 photo canvas area
        const scaleFactor = canvas.width / 1130;

        const redTagWidth = 490 * scaleFactor;
        const redTagHeight = 462 * scaleFactor;

        const redTagX = ((718 - 40) + SOCIAL_RED_TAG_NUDGE_X) * scaleFactor;
        const redTagY = (0 + SOCIAL_RED_TAG_NUDGE_Y) * scaleFactor;

        ctx.drawImage(redTag, redTagX, redTagY, redTagWidth, redTagHeight);
        ctx.restore();

        resolve(); // ✅ done
      };

      redTag.onerror = () => resolve();

      // ✅ Use absolute URL so GitHub Pages always finds it
      redTag.src = absUrl('assets/red-tag.png');
    };

    propertyImg.onerror = () => resolve();
    propertyImg.src = imageDataUrl;
  });
}

// =====================
// Template load + populate (WAIT for canvas draws)
// =====================
async function loadTemplate(templatePath, targetId, data) {
  const res = await fetch(absUrl(templatePath), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load template: ${templatePath} (${res.status})`);

  let html = await res.text();
  for (const key in data) {
    html = html.replaceAll(`{{${key}}}`, data[key] ?? '');
  }

  const target = document.getElementById(targetId);
  if (!target) throw new Error(`Target not found: ${targetId}`);

  target.innerHTML = html;

  // ✅ Broker swaps must happen after HTML is inserted, before image-waits/screenshot
  applyBrokerToTemplate(
    target,
    templatePath,
    data.brokerId,
    { name: data.brokerName, phone: data.brokerPhone, email: data.brokerEmail }
  );

  await waitForImagesToLoad(target);

  // ✅ WAIT for canvas drawing to finish
  if (templatePath.includes('newsletter')) {
    await drawNewsletterCanvasImage(data.propertyImage, target);
  } else if (templatePath.includes('social')) {
    await drawSocialCanvasImage(data.propertyImage, target);
  } else if (templatePath.includes('flyer')) {
    await drawFlyerCanvasImage(data.propertyImage, target);
  }

  const container = await waitForElement('[id^="capture-container"]', target, 4000);
  if (container) runFontResize(container, targetId);

  await waitForRenderFrames(3);
}

// =====================
// UI actions
// =====================
async function generateTemplate(template) {
  const data = await collectFormData();
  const map = {
    social: { path: 'templates/social.html', target: 'social-preview' },
    newsletter: { path: 'templates/newsletter.html', target: 'newsletter-preview' },
    flyer: { path: 'templates/flyer.html', target: 'flyer-preview' }
  };

  const cfg = map[template];
  if (!cfg) throw new Error(`Unknown template: ${template}`);

  await loadTemplate(cfg.path, cfg.target, data);
}

async function generateAndDownload(template) {
  try {
    const data = await collectFormData();

    // ✅ newsletter exports PNG (per your template)
    const map = {
      social: { path: 'templates/social.html', target: 'social-preview', filename: 'social.jpg', mime: 'image/jpeg' },
      newsletter: { path: 'templates/newsletter.html', target: 'newsletter-preview', filename: 'newsletter.png', mime: 'image/png' },
      flyer: { path: 'templates/flyer.html', target: 'flyer-preview', filename: 'flyer.jpg', mime: 'image/jpeg' }
    };

    const cfg = map[template];
    if (!cfg) throw new Error(`Unknown template: ${template}`);

    const { path, target, filename, mime } = cfg;
    const previewWrapper = document.getElementById(target);
    if (!previewWrapper) throw new Error(`Preview wrapper not found: ${target}`);

    await loadTemplate(path, target, data);

    const container = await waitForElement('[id^="capture-container"]', previewWrapper, 6000);
    if (!container) throw new Error("Template container not found.");
    if (container.offsetWidth === 0 || container.offsetHeight === 0) throw new Error("Template container not rendered.");

    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = 1;
    container.style.pointerEvents = 'auto';
    container.style.position = 'static';

    await waitForImagesToLoad(container);
    await waitForRenderFrames(4);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("❌ Export failed (blob was null).");
        return;
      }

      const link = document.createElement("a");
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);

      container.style.display = 'none';
      container.style.position = 'absolute';
      container.style.opacity = 0;
      container.style.pointerEvents = 'none';
    }, mime, mime === "image/jpeg" ? 0.92 : undefined);

  } catch (err) {
    console.error(err);
    alert("❌ Design export failed: " + (err?.message || err));
  }
}

// =====================
// Word Summary (keep working)
// =====================
async function downloadWordDoc() {
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  const { broker } = getSelectedBroker();

  const rawDate = document.getElementById("date-picker")?.value || '';
  const rawTime = document.getElementById("time-picker")?.value || '';

  const dt = parseYMD(rawDate, rawTime);
  const formattedDate = dt
    ? dt.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const fullDateTime = formattedDate && rawTime ? `${formattedDate} @ ${rawTime}` : '';

  const fields = {
    "Broker": `${broker.name || ''} | ${broker.phone || ''} | ${broker.email || ''}`,
    "Headline": document.getElementById("headline")?.value || '',
    "City": document.getElementById("city")?.value || '',
    "Suburb": document.getElementById("suburb")?.value || '',
    "Tagline 1": document.getElementById("tag1")?.value || '',
    "Tagline 2": document.getElementById("tag2")?.value || '',
    "Date & Time": fullDateTime,
    "Feature 1": document.getElementById("feat1")?.value || '',
    "Feature 2": document.getElementById("feat2")?.value || '',
    "Feature 3": document.getElementById("feat3")?.value || ''
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

  const doc = new Document({ sections: [{ children: paragraphs }] });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "AuctionInc_Property_Summary.docx";
  a.click();

  URL.revokeObjectURL(url);
}

// =====================
// Export for HTML onclick="..."
// =====================
window.generateTemplate = generateTemplate;
window.generateAndDownload = generateAndDownload;
window.downloadWordDoc = downloadWordDoc;

// =====================
// Minor UX tweaks (DATE FIX ONLY)
// - Default date picker to TODAY, regardless of when builder.js loads
// - Supports native <input type="date"> and text/masked date inputs (YYYY/MM/DD)
// =====================
function setDatePickerToToday() {
  const dp = document.getElementById("date-picker");
  if (!dp) return;

  // Only set if empty (so you can still choose another date manually)
  if (dp.value) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  if (dp.type === "date") {
    dp.value = `${yyyy}-${mm}-${dd}`;
  } else {
    dp.value = `${yyyy}/${mm}/${dd}`;
  }

  dp.dispatchEvent(new Event("input", { bubbles: true }));
  dp.dispatchEvent(new Event("change", { bubbles: true }));
}

function initDateDefault() {
  setDatePickerToToday();
}

// Run even if DOMContentLoaded already happened
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDateDefault);
} else {
  initDateDefault();
}

// Also handle cases where the form renders slightly late
setTimeout(initDateDefault, 200);
setTimeout(initDateDefault, 800);





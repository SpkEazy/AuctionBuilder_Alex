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

      const scaleFactor = canvas.width / 1130;

      // ✅ Manual nudge (pixels in ORIGINAL 1130-wide coordinate system)
      const nudgeX = 12;   // + moves right, - moves left
      const nudgeY = 0;   // + moves down, - moves up

      const redTagX = ((718 - 40) + nudgeX) * scaleFactor;
      const redTagY = (0 + nudgeY) * scaleFactor;

      const redTagWidth = 490 * scaleFactor;
      const redTagHeight = 462 * scaleFactor;

      ctx.drawImage(redTag, redTagX, redTagY, redTagWidth, redTagHeight);
      ctx.restore();
    };

    redTag.src = 'assets/red-tag.png';
  };

  propertyImg.src = imageDataUrl;
}






document.querySelectorAll("img:not(a img)").forEach(img => {
  img.style.cursor = "zoom-in";

  img.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    const zoomedImg = document.createElement("img");
    zoomedImg.src = img.src;
    zoomedImg.style.transformOrigin = "center center";
    zoomedImg.style.transform = "scale(1.0)";
    zoomedImg.style.cursor = "grab";
    overlay.appendChild(zoomedImg);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    let zoomLevel = 1.0;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0, startY = 0;

    function updateTransform() {
      zoomedImg.style.transform = `scale(${zoomLevel}) translate(${translateX / zoomLevel}px, ${translateY / zoomLevel}px)`;
    }

    overlay.addEventListener("wheel", e => {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomStep = 0.1;
      const prevZoom = zoomLevel;

      if (delta > 0) {
        zoomLevel = Math.min(zoomLevel + zoomStep, 2.5);
      } else {
        zoomLevel = Math.max(zoomLevel - zoomStep, 0.5);
      }

      translateX *= zoomLevel / prevZoom;
      translateY *= zoomLevel / prevZoom;

      updateTransform();
    }, { passive: false });

    zoomedImg.addEventListener("mousedown", e => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      zoomedImg.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      translateX += e.clientX - startX;
      translateY += e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      updateTransform();
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      zoomedImg.style.cursor = "grab";
    });

    let lastDist = null;

    zoomedImg.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        zoomedImg.style.cursor = "grabbing";
      }
    });

    zoomedImg.addEventListener("touchmove", e => {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        translateX += e.touches[0].clientX - startX;
        translateY += e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        updateTransform();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (lastDist !== null) {
          const prevZoom = zoomLevel;
          const delta = dist - lastDist;
          const zoomStep = delta * 0.0075;

          zoomLevel = Math.min(5, Math.max(0.9, zoomLevel + zoomStep));

          translateX *= zoomLevel / prevZoom;
          translateY *= zoomLevel / prevZoom;

          updateTransform();
        }
        lastDist = dist;
        isDragging = false;
      }
    }, { passive: false });

    zoomedImg.addEventListener("touchend", e => {
      if (e.touches.length === 0) {
        isDragging = false;
        zoomedImg.style.cursor = "grab";
      }
      lastDist = null;
    });

    const close = () => {
      overlay.remove();
      document.body.style.overflow = "";
    };

    overlay.addEventListener("click", e => {
      if (e.target === overlay) close();
    });

    function handleEsc(e) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", handleEsc, { once: true });
  });
});
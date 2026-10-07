/**
 * EL ARTE DE ELEGIRNOS - VOL. II
 * Motor interactivo de Revista Virtual (PageFlip, Audio y Video Cinema)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const flipbookEl = document.getElementById('flipbook');
  const bgAudio = document.getElementById('bg-audio');
  const musicBtn = document.getElementById('music-toggle-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const floatPrevBtn = document.getElementById('float-prev-btn');
  const floatNextBtn = document.getElementById('float-next-btn');
  const pageIndicator = document.getElementById('page-indicator');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  
  // Modal de Video
  const videoModal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Welcome overlay
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const startBtn = document.getElementById('start-btn');

  let pageFlip = null;
  let isPlayingMusic = false;
  let wasMusicPlayingBeforeVideo = false;

  // =========================================================
  // 1. INICIALIZAR ST.PAGEFLIP
  // =========================================================
  function initPageFlip() {
    // Calcular dimensiones adaptables
    const isMobile = window.innerWidth <= 768;
    const baseWidth = isMobile ? Math.min(window.innerWidth - 20, 480) : 520;
    const baseHeight = isMobile ? Math.min(window.innerHeight - 140, 720) : 740;

    pageFlip = new St.PageFlip(flipbookEl, {
      width: baseWidth,
      height: baseHeight,
      size: 'stretch',
      minWidth: 300,
      maxWidth: 650,
      minHeight: 450,
      maxHeight: 920,
      maxShadowOpacity: 0.6,
      showCover: true,
      mobileScrollSupport: false,
      useMouseEvents: true,
      swipeDistance: 30,
      drawShadow: true,
      flippingTime: 800,
      usePortrait: true,
      startPage: 0
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // Eventos de PageFlip
    pageFlip.on('flip', (e) => {
      updatePageIndicator(e.data);
    });

    pageFlip.on('changeState', (e) => {
      // Estado de transición
    });
  }

  function updatePageIndicator(pageIndex) {
    if (!pageFlip) return;
    const totalPages = pageFlip.getPageCount();
    const currentPage = pageIndex !== undefined ? pageIndex : pageFlip.getCurrentPageIndex();
    
    if (pageIndicator) {
      if (currentPage === 0) {
        pageIndicator.textContent = `Portada`;
      } else if (currentPage === totalPages - 1) {
        pageIndicator.textContent = `Contraportada`;
      } else {
        // En vista de dos páginas
        pageIndicator.textContent = `Pág. ${currentPage + 1} de ${totalPages}`;
      }
    }
  }

  // =========================================================
  // 2. NAVEGACIÓN
  // =========================================================
  function flipPrev() {
    if (pageFlip) pageFlip.flipPrev();
  }

  function flipNext() {
    if (pageFlip) pageFlip.flipNext();
  }

  if (prevBtn) prevBtn.addEventListener('click', flipPrev);
  if (nextBtn) nextBtn.addEventListener('click', flipNext);
  if (floatPrevBtn) floatPrevBtn.addEventListener('click', flipPrev);
  if (floatNextBtn) floatNextBtn.addEventListener('click', flipNext);

  // Teclas izquierda / derecha
  document.addEventListener('keydown', (e) => {
    if (videoModal && videoModal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') flipPrev();
    if (e.key === 'ArrowRight') flipNext();
  });

  // =========================================================
  // 3. REPRODUCTOR DE MÚSICA
  // =========================================================
  function toggleMusic() {
    if (!bgAudio) return;
    if (isPlayingMusic) {
      bgAudio.pause();
      isPlayingMusic = false;
      document.body.classList.remove('music-playing');
    } else {
      bgAudio.volume = 0.55;
      bgAudio.play().then(() => {
        isPlayingMusic = true;
        document.body.classList.add('music-playing');
      }).catch(err => {
        console.warn('Autoplay bloqueado por el navegador:', err);
      });
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }

  // =========================================================
  // 4. OVERLAY DE BIENVENIDA
  // =========================================================
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (welcomeOverlay) {
        welcomeOverlay.classList.add('hidden');
      }
      // Iniciar música automáticamente con la interacción
      if (!isPlayingMusic && bgAudio) {
        bgAudio.volume = 0.55;
        bgAudio.play().then(() => {
          isPlayingMusic = true;
          document.body.classList.add('music-playing');
        }).catch(() => {});
      }
    });
  }

  // Manejador por delegación para asegurar que siempre responda al clic dentro de StPageFlip
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-video-src]');
    if (card) {
      e.stopPropagation();
      const videoSrc = card.getAttribute('data-video-src');
      const title = card.getAttribute('data-video-title') || 'Video Especial';
      const subtitle = card.getAttribute('data-video-desc') || 'Nuestro momento';
      openVideoModal(videoSrc, title, subtitle);
    }
  });

  function openVideoModal(src, title, subtitle) {
    if (!videoModal || !modalVideo) return;
    
    // Pausar música suavemente si estaba sonando
    if (isPlayingMusic && bgAudio) {
      wasMusicPlayingBeforeVideo = true;
      bgAudio.pause();
      document.body.classList.remove('music-playing');
    } else {
      wasMusicPlayingBeforeVideo = false;
    }

    modalVideo.src = src;
    modalTitle.textContent = title;
    modalSubtitle.textContent = subtitle;
    videoModal.classList.add('active');
    modalVideo.play().catch(() => {});
  }

  function closeVideoModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    if (!videoModal || !modalVideo) return;

    // Desactivar temporalmente los clics en el flipbook para evitar que se pase la página por "click-through"
    if (flipbookEl) {
      flipbookEl.style.pointerEvents = 'none';
      setTimeout(() => {
        flipbookEl.style.pointerEvents = '';
      }, 400);
    }

    modalVideo.pause();
    modalVideo.src = '';
    videoModal.classList.remove('active');

    // Reanudar música de fondo si estaba activa
    if (wasMusicPlayingBeforeVideo && bgAudio) {
      bgAudio.play().then(() => {
        isPlayingMusic = true;
        document.body.classList.add('music-playing');
      }).catch(() => {});
    }
  }

  if (modalCloseBtn) {
    ['click', 'mousedown', 'pointerdown', 'mouseup', 'pointerup', 'touchstart', 'touchend'].forEach(evt => {
      modalCloseBtn.addEventListener(evt, (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (evt === 'click' || evt === 'touchend') {
          closeVideoModal(e);
        }
      });
    });
  }

  if (videoModal) {
    ['click', 'mousedown', 'pointerdown', 'mouseup', 'pointerup', 'touchstart', 'touchend'].forEach(evt => {
      videoModal.addEventListener(evt, (e) => {
        if (e.target === videoModal) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (evt === 'click' || evt === 'touchend') {
            closeVideoModal(e);
          }
        }
      });
    });
  }

  // Tecla Escape cierra modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
      closeVideoModal(e);
    }
  });

  // =========================================================
  // 6. PANTALLA COMPLETA
  // =========================================================
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }

  // Inicializar
  initPageFlip();
});

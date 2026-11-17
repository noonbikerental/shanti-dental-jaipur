(function () {
  'use strict';

  var WHATSAPP_NUMBER = '919672032241';

  // 1. Mobile navigation drawer toggle
  var menuBtn = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuIconOpen = document.getElementById('menu-icon-open');
  var menuIconClose = document.getElementById('menu-icon-close');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.classList.toggle('hidden');
      if (menuIconOpen && menuIconClose) {
        menuIconOpen.classList.toggle('hidden');
        menuIconClose.classList.toggle('hidden');
      }
    });
  }

  // Mobile treatments submenu toggle
  var mobileTreatmentsBtn = document.getElementById('mobile-treatments-toggle');
  var mobileTreatmentsList = document.getElementById('mobile-treatments-list');
  var mobileTreatmentsChevron = document.getElementById('mobile-treatments-chevron');

  if (mobileTreatmentsBtn && mobileTreatmentsList) {
    mobileTreatmentsBtn.addEventListener('click', function () {
      var expanded = mobileTreatmentsBtn.getAttribute('aria-expanded') === 'true';
      mobileTreatmentsBtn.setAttribute('aria-expanded', String(!expanded));
      mobileTreatmentsList.classList.toggle('hidden');
      if (mobileTreatmentsChevron) {
        mobileTreatmentsChevron.classList.toggle('rotate-180');
      }
    });
  }

  // Desktop Treatments dropdown click toggle for touch/keyboard devices
  var dropdownTrigger = document.getElementById('desktop-treatments-btn');
  var dropdownParent = dropdownTrigger ? dropdownTrigger.closest('.nav-dropdown') : null;

  if (dropdownTrigger && dropdownParent) {
    dropdownTrigger.addEventListener('click', function (e) {
      var isOpen = dropdownParent.classList.contains('is-open');
      if (!isOpen) {
        e.preventDefault();
        dropdownParent.classList.add('is-open');
        dropdownTrigger.setAttribute('aria-expanded', 'true');
      } else {
        dropdownParent.classList.remove('is-open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', function (e) {
      if (!dropdownParent.contains(e.target)) {
        dropdownParent.classList.remove('is-open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdownParent.classList.remove('is-open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. FAQ Accordion
  var faqButtons = document.querySelectorAll('.faq-trigger');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var panelId = btn.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : btn.nextElementSibling;

      // Close sibling items in same accordion group
      var group = btn.closest('[data-faq-group]');
      if (group) {
        group.querySelectorAll('.faq-trigger').forEach(function (otherBtn) {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            var otherId = otherBtn.getAttribute('aria-controls');
            var otherPanel = otherId ? document.getElementById(otherId) : otherBtn.nextElementSibling;
            if (otherPanel) otherPanel.classList.add('hidden');
          }
        });
      }

      btn.setAttribute('aria-expanded', String(!isOpen));
      if (panel) {
        panel.classList.toggle('hidden', isOpen);
      }
    });
  });

  // 3. Appointment & Callback Forms (Netlify Forms + Inline Confirmation + Optional WhatsApp Button)
  var forms = document.querySelectorAll('form[data-appointment-form]');
  forms.forEach(function (form) {
    // Set min date on date inputs to today
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var today = new Date();
      var yyyy = today.getFullYear();
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var dd = String(today.getDate()).padStart(2, '0');
      dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorBox = form.querySelector('[data-form-error]');
      var submitBtn = form.querySelector('button[type="submit"]');
      var formWrapper = form.closest('[data-form-container]') || form.parentElement;
      var successBox = formWrapper ? formWrapper.querySelector('[data-form-success]') : null;

      if (errorBox) {
        errorBox.textContent = '';
        errorBox.classList.add('hidden');
      }

      var nameEl = form.querySelector('[name="name"]');
      var phoneEl = form.querySelector('[name="phone"]');
      var treatmentEl = form.querySelector('[name="treatment"]');
      var dateEl = form.querySelector('[name="preferred_date"]');
      var messageEl = form.querySelector('[name="message"]');

      var nameVal = nameEl ? nameEl.value.trim() : '';
      var phoneRaw = phoneEl ? phoneEl.value.replace(/\D/g, '') : '';
      var treatmentVal = treatmentEl ? treatmentEl.value : 'General Consultation';
      var dateVal = dateEl ? dateEl.value : '';
      var messageVal = messageEl ? messageEl.value.trim() : '';

      var isHindi = document.documentElement.lang === 'hi';

      if (nameVal.length < 2) {
        if (errorBox) {
          errorBox.textContent = isHindi
            ? 'कृपया अपना पूरा नाम लिखें।'
            : 'Please enter your full name.';
          errorBox.classList.remove('hidden');
        }
        if (nameEl) nameEl.focus();
        return;
      }

      if (phoneRaw.length < 10) {
        if (errorBox) {
          errorBox.textContent = isHindi
            ? 'कृपया 10 अंकों का सही मोबाइल नंबर लिखें।'
            : 'Please enter a valid 10-digit mobile number.';
          errorBox.classList.remove('hidden');
        }
        if (phoneEl) phoneEl.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = isHindi ? 'भेजा जा रहा है...' : 'Sending...';
      }

      var formData = new FormData(form);
      var encoded = new URLSearchParams();
      formData.forEach(function (value, key) {
        encoded.append(key, String(value));
      });

      var waSummary =
        'Hello Shanti Dental Hospital, I would like to book an appointment.\n' +
        'Name: ' + nameVal + '\n' +
        'Phone: ' + (phoneEl ? phoneEl.value.trim() : phoneRaw) + '\n' +
        'Treatment: ' + (treatmentVal || 'Consultation') +
        (dateVal ? '\nPreferred Date: ' + dateVal : '') +
        (messageVal ? '\nNote: ' + messageVal : '');
      var waHref = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(waSummary);

      function showConfirmation() {
        form.classList.add('hidden');
        if (successBox) {
          var waBtn = successBox.querySelector('[data-whatsapp-handoff]');
          if (waBtn) {
            waBtn.setAttribute('href', waHref);
          }
          var summaryEl = successBox.querySelector('[data-booking-summary]');
          if (summaryEl) {
            summaryEl.textContent = nameVal + ' (' + (phoneEl ? phoneEl.value.trim() : phoneRaw) + ')' +
              (treatmentVal ? ' — ' + treatmentVal : '') +
              (dateVal ? ' · ' + dateVal : '');
          }
          successBox.classList.remove('hidden');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      // Submit to Netlify Forms endpoint (gracefully handles local/static preview as well)
      fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded.toString()
      })
        .then(function () {
          showConfirmation();
        })
        .catch(function () {
          // Even in offline/preview mode without Netlify runtime, show confirmation + WhatsApp handoff
          showConfirmation();
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.dataset.originalText) {
              submitBtn.textContent = submitBtn.dataset.originalText;
            }
          }
        });
    });

    // Reset button inside confirmation state
    var container = form.closest('[data-form-container]') || form.parentElement;
    var resetBtn = container ? container.querySelector('[data-form-reset]') : null;
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var successBox = container.querySelector('[data-form-success]');
        if (successBox) successBox.classList.add('hidden');
        form.reset();
        form.classList.remove('hidden');
      });
    }
  });

  // 4. Gallery Category Filter & Lightbox (gallery.html)
  var filterTabs = document.querySelectorAll('[data-gallery-filter]');
  var galleryItems = document.querySelectorAll('[data-gallery-item]');

  if (filterTabs.length && galleryItems.length) {
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var selected = tab.getAttribute('data-gallery-filter');

        filterTabs.forEach(function (btn) {
          var active = btn === tab;
          btn.setAttribute('aria-pressed', String(active));
          btn.classList.toggle('bg-[#C1121F]', active);
          btn.classList.toggle('text-white', active);
          btn.classList.toggle('bg-white', !active);
          btn.classList.toggle('text-[#1F2A30]', !active);
          btn.classList.toggle('border', !active);
          btn.classList.toggle('border-slate-200', !active);
        });

        galleryItems.forEach(function (item) {
          var cat = item.getAttribute('data-category');
          var show = selected === 'all' || cat === selected;
          item.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // Lightbox modal
  var lightbox = document.getElementById('gallery-lightbox');
  var lightboxImg = document.getElementById('lightbox-image');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var activeGalleryIndex = -1;

  function getVisibleItems() {
    return Array.prototype.slice.call(galleryItems).filter(function (el) {
      return !el.classList.contains('hidden');
    });
  }

  function openLightbox(index) {
    var visible = getVisibleItems();
    if (!lightbox || !visible.length) return;
    activeGalleryIndex = (index + visible.length) % visible.length;
    var item = visible[activeGalleryIndex];
    var img = item.querySelector('img');
    var caption = item.getAttribute('data-caption') || (img ? img.alt : '');
    if (lightboxImg && img) {
      lightboxImg.src = img.getAttribute('data-full-src') || img.src;
      lightboxImg.alt = img.alt;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }

  if (lightbox && galleryItems.length) {
    galleryItems.forEach(function (item) {
      var trigger = item.querySelector('[data-lightbox-trigger]') || item;
      trigger.addEventListener('click', function () {
        var visible = getVisibleItems();
        var idx = visible.indexOf(item);
        openLightbox(idx >= 0 ? idx : 0);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function () {
        openLightbox(activeGalleryIndex - 1);
      });
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', function () {
        openLightbox(activeGalleryIndex + 1);
      });
    }
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(activeGalleryIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(activeGalleryIndex + 1);
    });
  }

  // 5. Print Aftercare Sheet
  var printBtns = document.querySelectorAll('[data-print-page]');
  printBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.print();
    });
  });

  // 6. Patient Reviews Infinite Carousel & Read More Toggles
  var reviewsViewport = document.querySelector('[data-reviews-viewport]');
  var reviewsTrack = document.querySelector('[data-reviews-track]');

  if (reviewsViewport && reviewsTrack) {
    var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var isReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;
    var isHoverPaused = false;
    var isTouchPaused = false;
    var isExpandedPaused = false;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    var dragMoved = false;
    var touchResumeTimer = null;
    var scrollPos = 0;
    var lastTime = null;
    var LOOP_DURATION_MS = 45000; // ~45 seconds per full loop

    function getLoopWidth() {
      return reviewsTrack.scrollWidth / 2;
    }

    function updateReadMoreButtons() {
      var cards = reviewsTrack.querySelectorAll('[data-review-card]');
      cards.forEach(function (card) {
        var textEl = card.querySelector('[data-review-text]');
        var btn = card.querySelector('[data-review-toggle]');
        if (!textEl || !btn) return;
        if (textEl.classList.contains('is-expanded')) {
          btn.classList.remove('hidden');
          btn.textContent = 'Read less';
          btn.setAttribute('aria-expanded', 'true');
        } else {
          var isOverflowing = textEl.scrollHeight > textEl.clientHeight + 2;
          btn.classList.toggle('hidden', !isOverflowing);
          btn.textContent = 'Read more';
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    reviewsTrack.addEventListener('click', function (e) {
      if (dragMoved) {
        dragMoved = false;
        return;
      }
      var btn = e.target.closest('[data-review-toggle]');
      if (!btn) return;
      var card = btn.closest('[data-review-card]');
      var textEl = card ? card.querySelector('[data-review-text]') : null;
      if (!textEl) return;

      var expanded = textEl.classList.toggle('is-expanded');
      btn.textContent = expanded ? 'Read less' : 'Read more';
      btn.setAttribute('aria-expanded', String(expanded));
      isExpandedPaused = Boolean(reviewsTrack.querySelector('[data-review-text].is-expanded'));
    });

    // Pause on desktop hover
    reviewsViewport.addEventListener('mouseenter', function () {
      isHoverPaused = true;
    });
    reviewsViewport.addEventListener('mouseleave', function () {
      isHoverPaused = false;
    });

    // Pause on touch (mobile) & sync position after swipe
    reviewsViewport.addEventListener('touchstart', function () {
      if (touchResumeTimer) clearTimeout(touchResumeTimer);
      isTouchPaused = true;
    }, { passive: true });

    reviewsViewport.addEventListener('touchend', function () {
      if (touchResumeTimer) clearTimeout(touchResumeTimer);
      touchResumeTimer = setTimeout(function () {
        scrollPos = reviewsViewport.scrollLeft;
        isTouchPaused = false;
      }, 1000);
    }, { passive: true });

    reviewsViewport.addEventListener('touchcancel', function () {
      scrollPos = reviewsViewport.scrollLeft;
      isTouchPaused = false;
    }, { passive: true });

    // Desktop mouse drag-to-scroll
    reviewsViewport.addEventListener('mousedown', function (e) {
      if (e.target.closest('button, a')) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.pageX;
      dragStartScroll = reviewsViewport.scrollLeft;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var delta = e.pageX - dragStartX;
      if (Math.abs(delta) > 4) dragMoved = true;
      reviewsViewport.scrollLeft = dragStartScroll - delta;
      scrollPos = reviewsViewport.scrollLeft;
    });

    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      scrollPos = reviewsViewport.scrollLeft;
      setTimeout(function () { dragMoved = false; }, 50);
    });

    // Seamless wrap when user manually scrolls across seam
    reviewsViewport.addEventListener('scroll', function () {
      if (isReducedMotion) return;
      var loopWidth = getLoopWidth();
      if (loopWidth <= 0) return;
      if (isHoverPaused || isTouchPaused || isDragging) {
        if (reviewsViewport.scrollLeft >= loopWidth) {
          reviewsViewport.scrollLeft -= loopWidth;
        }
        scrollPos = reviewsViewport.scrollLeft;
      }
    }, { passive: true });

    function step(timestamp) {
      if (!isReducedMotion && !isHoverPaused && !isTouchPaused && !isDragging && !isExpandedPaused) {
        if (lastTime !== null) {
          var dt = Math.min(timestamp - lastTime, 100);
          var loopWidth = getLoopWidth();
          if (loopWidth > 0) {
            scrollPos += loopWidth * (dt / LOOP_DURATION_MS);
            if (scrollPos >= loopWidth) {
              scrollPos -= loopWidth;
            }
            reviewsViewport.scrollLeft = scrollPos;
          }
        }
      }
      lastTime = timestamp;
      if (!isReducedMotion) {
        window.requestAnimationFrame(step);
      }
    }

    if (reduceMotionQuery && reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener('change', function (evt) {
        isReducedMotion = evt.matches;
        if (!isReducedMotion) {
          lastTime = null;
          window.requestAnimationFrame(step);
        }
      });
    }

    updateReadMoreButtons();
    window.addEventListener('resize', updateReadMoreButtons);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateReadMoreButtons);
    }
    if (!isReducedMotion) {
      window.requestAnimationFrame(step);
    }
  }
})();

const bar = document.getElementById('loading-progress-bar');
      const status = document.getElementById('loading-status');
      const duration = 2600;
      const startedAt = performance.now();
      const update = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        bar.style.width = `${Math.round(progress * 100)}%`;
        if (progress < 1) {
          requestAnimationFrame(update);
          return;
        }
        status.textContent = 'Secure workspace ready.';
        window.setTimeout(() => window.location.replace('./dashboard.html'), 180);
      };
      requestAnimationFrame(update);

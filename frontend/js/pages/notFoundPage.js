/**
 * Halaman 404 (Halaman Tidak Ditemukan)
 */
export function render(container) {
  container.innerHTML = `
    <div class="placeholder-page" style="text-align: center; padding-top: 40px;">
      <div style="font-size: 3.5rem; font-weight: 900; color: var(--primary); line-height: 1; margin-bottom: 8px;">
        404
      </div>
      <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
        Halaman Tidak Ditemukan
      </h2>
      <p style="font-size: 0.9rem; color: var(--text-secondary); max-width: 300px; margin: 0 auto 24px; line-height: 1.5;">
        Rute URL yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <a href="#/" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Kembali ke Beranda
      </a>
    </div>
  `;
}


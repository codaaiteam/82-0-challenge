'use client'

import { useState, useEffect } from 'react';
import styles from './Game.module.css';
import { createShare } from '@/lib/leaderboard';

const SITE_URL = 'https://www.82-0-challenge.com';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Share dialog: mints a /share/<id> link on open, offers the big platforms.
export default function ShareModal({ open, onClose, sh, shareText, payload }) {
  const [shareId, setShareId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || shareId || creating || !payload) return;
    setCreating(true);
    createShare(payload)
      .then(d => setShareId(d.id))
      .catch(() => { /* fall back to the homepage link */ })
      .finally(() => setCreating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const shareUrl = shareId ? `${SITE_URL}/share/${shareId}` : SITE_URL;
  const encUrl = encodeURIComponent(shareUrl);
  const encText = encodeURIComponent(shareText);

  const platforms = [
    { key: 'x', label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}` },
    { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}` },
    { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encText}%20${encUrl}` },
    { key: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${encUrl}&text=${encText}` },
    { key: 'reddit', label: 'Reddit', href: `https://www.reddit.com/submit?url=${encUrl}&title=${encText}` },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className={styles.shareOverlay} onClick={onClose}>
      <div className={styles.shareModal} onClick={ev => ev.stopPropagation()}>
        <div className={styles.shareHead}>
          <span>{sh.title || 'Share your five'}</span>
          <button className={styles.shareClose} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.sharePreview}>
          <div className={styles.sharePreviewRecord}>
            {payload.wins}–{payload.losses}
            <i>{payload.grade}</i>
          </div>
          <div className={styles.sharePreviewLineup}>
            {payload.lineup.map((p, i) => (
              <span key={i} className={styles.sharePreviewRow}>
                <b className={`${styles.shareChip} ${styles['chipC' + i]}`}>{initials(p.name)}</b>
                {p.name}
                <small>{p.pos} · {p.team}</small>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.shareLink}>
          {creating ? (sh.creating || 'Creating link…') : shareUrl}
        </div>

        <div className={styles.shareGrid}>
          {platforms.map(p => (
            <a
              key={p.key}
              className={`${styles.shareBtn} ${styles['share_' + p.key]}`}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {p.label}
            </a>
          ))}
          <button className={`${styles.shareBtn} ${styles.shareCopy}`} onClick={handleCopyLink}>
            {copied ? (sh.copied || 'Copied!') : (sh.copyLink || 'Copy link')}
          </button>
        </div>
      </div>
    </div>
  );
}

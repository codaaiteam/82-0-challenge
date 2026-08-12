'use client';

import { useEffect, useRef } from 'react';

const AD_KEY = '981333c41e4196364e4f599f02a6988d';

export default function AdsterraSidebar() {
  const iframeRef = useRef(null);
  const loaded = useRef(false);
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== '0';

  useEffect(() => {
    if (!adsEnabled || !iframeRef.current || loaded.current) return;
    loaded.current = true;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><style>body{margin:0;overflow:hidden;}</style></head>
<body>
<script type="text/javascript">
  var atOptions = {
    'key' : '${AD_KEY}',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/${AD_KEY}/invoke.js"></script>
</body></html>`);
    doc.close();
  }, [adsEnabled]);

  if (!adsEnabled) return null;

  return (
    <iframe
      ref={iframeRef}
      style={{ width: 160, height: 600, border: 'none', overflow: 'hidden' }}
      scrolling="no"
      title="Ad"
    />
  );
}

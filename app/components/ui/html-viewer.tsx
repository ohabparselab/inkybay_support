import { useEffect, useRef, useState } from "react";

interface HtmlViewerProps {
    content: string;
}

export function HtmlViewerWithIframe({ content }: HtmlViewerProps) {
  
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const updateHeight = () => {
            if (iframe.contentDocument?.body) {
                const newHeight = iframe.contentDocument.body.scrollHeight;
                setHeight(newHeight + 20);
            }
        };

        iframe.addEventListener("load", updateHeight);

        const interval = setInterval(updateHeight, 200); // keep checking for content changes

        return () => {
            iframe.removeEventListener("load", updateHeight);
            clearInterval(interval);
        };
    }, [content]);

    return (
        <iframe
            ref={iframeRef}
            srcDoc={`<html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: inherit;
              line-height: 1.5;
              color: inherit;
            }
            h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; }
            a {
              color: #3b82f6;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>`}
            className="w-full"
            style={{
                height: `${height}px`,
                border: "none",
                overflow: "hidden",
                display: "block",
            }}
            scrolling="no"
        />
    );
}

export function HtmlViewer({ content }: HtmlViewerProps) {
  return (
    <div className="prose dark:prose-invert max-w-full break-words">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

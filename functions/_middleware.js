export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();

  // 1. Detecta únicamente adainvite.com/XVRegina
  const isReginaInvite = 
    url.pathname.toLowerCase() === "/xvregina" || 
    url.pathname.toLowerCase().startsWith("/xvregina/");

  if (!isReginaInvite) {
    return context.next();
  }

  // 2. Detecta únicamente el crawler de vista previa de Instagram / Meta (NO el navegador interno ni WhatsApp)
  const isInstagramPreviewBot = 
    (userAgent.includes("facebookexternalhit") || 
     userAgent.includes("facebot") || 
     userAgent.includes("meta-externalagent")) && 
    !userAgent.includes("whatsapp");

  const response = await context.next();

  // 3. Si es el bot de vista previa de Instagram:
  if (isInstagramPreviewBot) {
    return new HTMLRewriter()
      // Quitamos el og:image original, el apple-touch-icon y el favicon para que no los use de respaldo
      .on('meta[property="og:image"], link[rel="apple-touch-icon"], link[rel="icon"]', {
        element(element) {
          element.remove();
        }
      })
      // Inyectamos un og:image vacío/inválido para que el bot NO escanee las fotos del <body> (sello, corona, separadores)
      .on('head', {
        element(element) {
          element.append(
            '<meta name="robots" content="max-image-preview:none">' +
            '<meta property="og:image" content="https://adainvite.com/no-preview.png">' +
            '<meta property="og:image:width" content="0">' +
            '<meta property="og:image:height" content="0">',
            { html: true }
          );
        }
      })
      .transform(response);
  }

  // En WhatsApp y navegadores normales, entrega todo intacto
  return response;
}

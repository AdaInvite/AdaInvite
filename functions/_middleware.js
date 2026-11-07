export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();

  // 1. Aplica únicamente a adainvite.com/XVRegina
  const isReginaInvite = 
    url.pathname.toLowerCase() === "/xvregina" || 
    url.pathname.toLowerCase().startsWith("/xvregina/");

  if (!isReginaInvite) {
    return context.next();
  }

  // 2. Detecta solo el bot que genera vistas previas de Instagram / Meta (NO WhatsApp ni usuarios reales)
  const isInstagramPreviewBot = 
    (userAgent.includes("facebookexternalhit") || 
     userAgent.includes("facebot") || 
     userAgent.includes("meta-externalagent")) && 
    !userAgent.includes("whatsapp");

  const response = await context.next();

  // 3. Si es el bot de vista previa de Instagram, borramos toda referencia a imágenes:
  if (isInstagramPreviewBot) {
    return new HTMLRewriter()
      // Quitamos og:image, favicons e imágenes del body para que no tenga de dónde agarrar fotos ni reserve el cuadro gris
      .on('meta[property^="og:image"], link[rel="apple-touch-icon"], link[rel="icon"], img', {
        element(element) {
          element.remove();
        }
      })
      .on('head', {
        element(element) {
          element.append('<meta name="robots" content="max-image-preview:none">', { html: true });
        }
      })
      .transform(response);
  }

  // En WhatsApp y cuando cualquier invitado abre el link, todo carga intacto
  return response;
}

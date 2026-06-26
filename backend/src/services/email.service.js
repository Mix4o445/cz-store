import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;
let testAccountPromise = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Real SMTP configured -> use it
  if (env.smtp.host) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
    });
    return transporter;
  }

  // No SMTP and we're in production -> stay in mock mode (don't auto-leak)
  if (env.isProd) return null;

  // Dev fallback: create a free Ethereal test inbox the first time we send
  // and reuse it. Each message gets a one-click preview URL printed in the
  // server log so the user can read the rendered email immediately.
  if (!testAccountPromise) {
    testAccountPromise = nodemailer
      .createTestAccount()
      .then((account) => {
        console.log(
          `[email] No SMTP_HOST set — using Ethereal test inbox.\n` +
            `       login : https://ethereal.email/login\n` +
            `       user  : ${account.user}\n` +
            `       pass  : ${account.pass}\n` +
            `       (preview URLs are also printed below per send)`
        );
        return nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: { user: account.user, pass: account.pass },
        });
      })
      .catch((err) => {
        console.warn('[email] Ethereal fallback unavailable:', err.message);
        return null;
      });
  }

  transporter = await testAccountPromise;
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = await getTransporter();
  if (!t) {
    console.log(`[email] (mock) to=${to} subject=${subject}`);
    return null;
  }
  try {
    const info = await t.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log(`[email] Sent to ${to} — preview: ${previewUrl}`);
    } else {
      console.log(`[email] Sent to ${to}`);
    }
    return info;
  } catch (err) {
    console.error(`[email] send failed (to=${to}):`, err.message);
    return null;
  }
}

const fmtPrice = (value) => {
  try {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} MAD`;
  }
};

const fmtDate = (date) =>
  new Intl.DateTimeFormat('fr-MA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const shortId = (id) => String(id).slice(-6).toUpperCase();

const PALETTE = {
  ink: '#0A1628',
  inkSoft: '#1B2638',
  paper: '#FFFFFF',
  chrome: '#F4F5F2',
  muted: '#64748B',
  line: '#E5E9F0',
  primary: '#0A4DFF',
};

function shellLayout({ title, body, preheader = '' }) {
  return `<!DOCTYPE html>
<html lang="fr"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${PALETTE.chrome};font-family:'Inter',Arial,sans-serif;color:${PALETTE.ink};">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;font-size:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PALETTE.chrome};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${PALETTE.paper};border:1px solid ${PALETTE.line};">
        <tr>
          <td style="padding:24px 32px;background:${PALETTE.ink};color:${PALETTE.paper};">
            <table width="100%"><tr>
              <td><img src="${env.clientUrl}/logo-email.png" alt="CoolZone" width="140" style="display:block;width:140px;height:auto;border:0;" /></td>
              <td align="right" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Climatisation Premium</td>
            </tr></table>
          </td>
        </tr>
        ${body}
        <tr>
          <td style="padding:24px 32px;background:${PALETTE.ink};color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.06em;">
            CoolZone · Casablanca, Maroc · contact@coolzone.ma · +212 600 000 000
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemRowsHtml(items) {
  return items
    .map(
      (i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${PALETTE.line};">
        <strong>${(i.name ?? '').replace(/</g, '&lt;')}</strong>
        ${i.variant ? `<div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${PALETTE.muted};margin-top:2px;">${i.variant}</div>` : ''}
        <div style="font-size:12px;color:${PALETTE.muted};margin-top:2px;">× ${i.qty}</div>
      </td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid ${PALETTE.line};font-family:'JetBrains Mono',monospace;font-weight:600;">${fmtPrice(i.price * i.qty)}</td>
    </tr>`
    )
    .join('');
}

function totalsHtml(order) {
  return `
  <tr><td style="padding-top:12px;color:${PALETTE.muted};">Sous-total</td><td align="right" style="padding-top:12px;font-family:'JetBrains Mono',monospace;">${fmtPrice(order.subtotal)}</td></tr>
  <tr><td style="color:${PALETTE.muted};">Livraison</td><td align="right" style="font-family:'JetBrains Mono',monospace;">${order.shipping_cost > 0 ? fmtPrice(order.shipping_cost) : 'À convenir'}</td></tr>
  <tr><td style="padding-top:8px;border-top:1px solid ${PALETTE.line};font-weight:700;font-size:18px;">Total</td><td align="right" style="padding-top:8px;border-top:1px solid ${PALETTE.line};font-family:'JetBrains Mono',monospace;font-weight:700;font-size:18px;">${fmtPrice(order.total)}</td></tr>`;
}

function shippingBlockHtml(order) {
  const s = order.shipping ?? {};
  return `
  <table width="100%" style="margin-top:8px;">
    <tr><td style="font-size:14px;line-height:1.6;color:${PALETTE.ink};">
      <strong>${s.name ?? ''}</strong><br />
      <span style="color:${PALETTE.muted};">${s.address ?? ''}</span><br />
      <span style="color:${PALETTE.muted};">${s.city ?? ''}${s.wilaya ? ` · ${s.wilaya}` : ''}</span><br />
      <span style="font-family:'JetBrains Mono',monospace;color:${PALETTE.muted};">${s.phone ?? ''}</span>
      ${s.email ? `<br /><span style="color:${PALETTE.muted};">${s.email}</span>` : ''}
    </td></tr>
  </table>`;
}

function paymentInstructionsHtml(order) {
  const isBank = order.payment?.method === 'bank_transfer';
  if (isBank) {
    return `
    <div style="margin-top:24px;padding:16px;border:1px solid ${PALETTE.line};">
      <strong>Virement bancaire</strong>
      <p style="margin:8px 0;color:${PALETTE.muted};font-size:14px;">
        Merci d'effectuer le virement aux coordonnées ci-dessous. Votre commande sera expédiée à réception du paiement.
      </p>
      <table style="margin-top:8px;font-size:14px;">
        <tr><td style="color:${PALETTE.muted};padding-right:16px;">Bénéficiaire</td><td><strong>CoolZone SARL</strong></td></tr>
        <tr><td style="color:${PALETTE.muted};padding-right:16px;">RIB</td><td style="font-family:'JetBrains Mono',monospace;"><strong>012 345 67890123456789 01</strong></td></tr>
        <tr><td style="color:${PALETTE.muted};padding-right:16px;">SWIFT</td><td style="font-family:'JetBrains Mono',monospace;"><strong>AWBKMAMC</strong></td></tr>
      </table>
      <p style="margin-top:12px;color:${PALETTE.muted};font-size:12px;">
        Une fois le virement effectué, envoyez la preuve à contact@coolzone.ma en mentionnant votre numéro de commande.
      </p>
    </div>`;
  }
  return `
    <div style="margin-top:24px;padding:16px;border:1px solid ${PALETTE.line};">
      <strong>Paiement à la livraison</strong>
      <p style="margin:8px 0 0;color:${PALETTE.muted};font-size:14px;">
        Notre équipe vous contactera dans les 24 heures pour confirmer la livraison. Le paiement se fait en espèces à la réception.
      </p>
    </div>`;
}

function customerHtml(order) {
  const id = shortId(order._id);
  const body = `
    <tr><td style="padding:32px;">
      <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 12px;">Confirmation</p>
      <h1 style="font-family:'Space Grotesk',Arial,sans-serif;margin:0 0 12px;font-size:28px;letter-spacing:-0.02em;">Commande confirmée.</h1>
      <p style="margin:0 0 8px;color:${PALETTE.ink};">Bonjour ${order.shipping?.name ?? ''},</p>
      <p style="margin:0 0 24px;color:${PALETTE.muted};">Merci pour votre commande <strong style="color:${PALETTE.ink};">#${id}</strong>. Voici votre récapitulatif.</p>

      <table width="100%" style="border-collapse:collapse;font-size:14px;">${itemRowsHtml(order.items)}${totalsHtml(order)}</table>

      ${paymentInstructionsHtml(order)}

      <div style="margin-top:24px;">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 8px;">Livraison</p>
        ${shippingBlockHtml(order)}
      </div>

      <p style="margin-top:32px;font-size:14px;color:${PALETTE.muted};">— L'équipe CoolZone</p>
      <a href="${env.clientUrl}/orders/${order._id}" style="display:inline-block;margin-top:16px;background:${PALETTE.ink};color:${PALETTE.paper};text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">Voir ma commande</a>
    </td></tr>`;
  return shellLayout({
    title: `Confirmation de commande #${id}`,
    preheader: `Commande #${id} — ${fmtPrice(order.total)}`,
    body,
  });
}

function adminHtml(order) {
  const id = shortId(order._id);
  const customer = order.user
    ? `${order.user.name} · ${order.user.email}`
    : `${order.shipping?.name ?? '—'} (invité)`;
  const body = `
    <tr><td style="padding:32px;">
      <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 12px;">Nouvelle commande</p>
      <h1 style="font-family:'Space Grotesk',Arial,sans-serif;margin:0 0 12px;font-size:28px;letter-spacing:-0.02em;">#${id}</h1>
      <p style="margin:0 0 24px;color:${PALETTE.muted};">${fmtDate(order.createdAt)} · ${customer}</p>

      <table width="100%" style="border-collapse:collapse;font-size:14px;">${itemRowsHtml(order.items)}${totalsHtml(order)}</table>

      <div style="margin-top:24px;">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 8px;">Livraison</p>
        ${shippingBlockHtml(order)}
      </div>

      <div style="margin-top:24px;padding:16px;border:1px solid ${PALETTE.line};">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 8px;">Paiement</p>
        <p style="margin:0;font-size:14px;">
          <strong>${order.payment?.method === 'bank_transfer' ? 'Virement bancaire' : order.payment?.method === 'cmi' ? 'Carte bancaire (CMI)' : 'Paiement à la livraison'}</strong>
          · ${order.payment?.status ?? 'pending'}
        </p>
        ${order.notes ? `<p style="margin:12px 0 0;color:${PALETTE.muted};font-size:13px;"><em>Notes :</em> ${order.notes.replace(/</g, '&lt;')}</p>` : ''}
      </div>

      <a href="${env.clientUrl}/admin/orders/${order._id}" style="display:inline-block;margin-top:24px;background:${PALETTE.primary};color:${PALETTE.paper};text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">Ouvrir dans l'admin</a>
    </td></tr>`;
  return shellLayout({
    title: `Nouvelle commande #${id}`,
    preheader: `${customer} — ${fmtPrice(order.total)}`,
    body,
  });
}

export async function sendOrderEmails(order) {
  const id = shortId(order._id);
  const tasks = [];

  if (order.shipping?.email) {
    tasks.push(
      sendMail({
        to: order.shipping.email,
        subject: `Confirmation de commande #${id} — CoolZone`,
        html: customerHtml(order),
      })
    );
  }

  if (env.adminEmail) {
    tasks.push(
      sendMail({
        to: env.adminEmail,
        subject: `Nouvelle commande #${id}`,
        html: adminHtml(order),
      })
    );
  }

  // Run in parallel; surface errors but don't block.
  await Promise.allSettled(tasks);
}



// ---------------------------------------------------------------------------
// Order status-update notifications (sent to customer + admin on every change)
// ---------------------------------------------------------------------------

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_MESSAGES = {
  pending: 'Votre commande a été enregistrée et est en attente de traitement.',
  confirmed: 'Votre commande a été confirmée. Notre équipe prépare votre colis.',
  shipped: 'Votre commande a été expédiée et est en route vers vous.',
  delivered: 'Votre commande a été livrée. Merci pour votre confiance !',
  cancelled: 'Votre commande a été annulée. Contactez-nous pour toute question.',
};

function statusBadgeHtml(status) {
  const label = STATUS_LABELS[status] ?? status;
  return `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${PALETTE.ink};color:${PALETTE.paper};font-size:12px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">${label}</span>`;
}

function customerStatusHtml(order, status) {
  const id = shortId(order._id);
  const body = `
    <tr><td style="padding:32px;">
      <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 12px;">Mise à jour de commande</p>
      <h1 style="font-family:'Space Grotesk',Arial,sans-serif;margin:0 0 16px;font-size:28px;letter-spacing:-0.02em;">Commande #${id}</h1>
      <div style="margin:0 0 16px;">${statusBadgeHtml(status)}</div>
      <p style="margin:0 0 8px;color:${PALETTE.ink};">Bonjour ${order.shipping?.name ?? ''},</p>
      <p style="margin:0 0 24px;color:${PALETTE.muted};">${STATUS_MESSAGES[status] ?? 'Le statut de votre commande a été mis à jour.'}</p>

      <table width="100%" style="border-collapse:collapse;font-size:14px;">${itemRowsHtml(order.items)}${totalsHtml(order)}</table>

      <div style="margin-top:24px;">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 8px;">Livraison</p>
        ${shippingBlockHtml(order)}
      </div>

      <p style="margin-top:32px;font-size:14px;color:${PALETTE.muted};">— L'équipe CoolZone</p>
      <a href="${env.clientUrl}/orders/${order._id}" style="display:inline-block;margin-top:16px;background:${PALETTE.ink};color:${PALETTE.paper};text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">Voir ma commande</a>
    </td></tr>`;
  return shellLayout({
    title: `Commande #${id} — ${STATUS_LABELS[status] ?? status}`,
    preheader: `Votre commande #${id} est ${(STATUS_LABELS[status] ?? status).toLowerCase()}`,
    body,
  });
}

function adminStatusHtml(order, status) {
  const id = shortId(order._id);
  const customer = order.user
    ? `${order.user.name} · ${order.user.email}`
    : `${order.shipping?.name ?? '—'} (invité)`;
  const body = `
    <tr><td style="padding:32px;">
      <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 12px;">Statut mis à jour</p>
      <h1 style="font-family:'Space Grotesk',Arial,sans-serif;margin:0 0 16px;font-size:28px;letter-spacing:-0.02em;">#${id}</h1>
      <div style="margin:0 0 16px;">${statusBadgeHtml(status)}</div>
      <p style="margin:0 0 24px;color:${PALETTE.muted};">${fmtDate(order.updatedAt ?? order.createdAt)} · ${customer}</p>

      <table width="100%" style="border-collapse:collapse;font-size:14px;">${itemRowsHtml(order.items)}${totalsHtml(order)}</table>

      <div style="margin-top:24px;">
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${PALETTE.muted};margin:0 0 8px;">Livraison</p>
        ${shippingBlockHtml(order)}
      </div>

      <a href="${env.clientUrl}/admin/orders/${order._id}" style="display:inline-block;margin-top:24px;background:${PALETTE.primary};color:${PALETTE.paper};text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">Ouvrir dans l'admin</a>
    </td></tr>`;
  return shellLayout({
    title: `Commande #${id} — ${STATUS_LABELS[status] ?? status}`,
    preheader: `#${id} → ${STATUS_LABELS[status] ?? status} · ${customer}`,
    body,
  });
}

export async function sendOrderStatusEmails(order, status) {
  const id = shortId(order._id);
  const label = STATUS_LABELS[status] ?? status;
  const tasks = [];

  if (order.shipping?.email) {
    tasks.push(
      sendMail({
        to: order.shipping.email,
        subject: `Commande #${id} — ${label} — CoolZone`,
        html: customerStatusHtml(order, status),
      })
    );
  }

  if (env.adminEmail) {
    tasks.push(
      sendMail({
        to: env.adminEmail,
        subject: `Commande #${id} mise à jour : ${label}`,
        html: adminStatusHtml(order, status),
      })
    );
  }

  // Run in parallel; surface errors but don't block.
  await Promise.allSettled(tasks);
}

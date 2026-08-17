import type { InviteLocale } from './config.ts';

export type InviteEmailRole = 'administrador' | 'operador' | 'visualizador';

export interface InviteEmailInput {
  locale: InviteLocale;
  workspaceName: string;
  inviterName: string;
  role: InviteEmailRole;
  expiresAt: Date;
  landingUrl: URL;
}

export interface RenderedInviteEmail {
  subject: string;
  html: string;
  text: string;
}

const COPY = {
  'pt-BR': {
    subject: (workspace: string) => `Convite para o workspace ${workspace}`,
    eyebrow: 'Convite para workspace',
    title: 'Você recebeu um convite',
    intro: (inviter: string, workspace: string) =>
      `${inviter} convidou você para colaborar no workspace ${workspace}.`,
    role: 'Seu perfil de acesso',
    roles: {
      administrador: 'Administrador',
      operador: 'Operador',
      visualizador: 'Visualizador',
    },
    action: 'Revisar convite',
    expires: (date: string) => `Este link expira em ${date}.`,
    fallback:
      'Se o botão não funcionar, copie e cole este endereço no navegador:',
    security:
      'Por segurança, use o mesmo endereço de e-mail que recebeu este convite. Se você não esperava esta mensagem, pode ignorá-la.',
  },
  en: {
    subject: (workspace: string) => `Invitation to the ${workspace} workspace`,
    eyebrow: 'Workspace invitation',
    title: 'You have received an invitation',
    intro: (inviter: string, workspace: string) =>
      `${inviter} invited you to collaborate in the ${workspace} workspace.`,
    role: 'Your access role',
    roles: {
      administrador: 'Administrator',
      operador: 'Operator',
      visualizador: 'Viewer',
    },
    action: 'Review invitation',
    expires: (date: string) => `This link expires on ${date}.`,
    fallback:
      'If the button does not work, copy and paste this address into your browser:',
    security:
      'For security, use the same email address that received this invitation. If you were not expecting this message, you can ignore it.',
  },
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function inviteDeliveryKey(
  inviteId: string,
  deliveryVersion: number
): string {
  return `workspace-invite/${inviteId}/${deliveryVersion}`;
}

export function renderInviteEmail(
  input: InviteEmailInput
): RenderedInviteEmail {
  const copy = COPY[input.locale];
  const date = new Intl.DateTimeFormat(input.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(input.expiresAt);
  const workspaceName = escapeHtml(input.workspaceName);
  const inviterName = escapeHtml(input.inviterName);
  const landingUrl = escapeHtml(input.landingUrl.toString());
  const role = copy.roles[input.role];

  const html = `<!doctype html>
<html lang="${input.locale}">
  <body style="margin: 0; padding: 0; background: #f5f3ff; font-family: Arial, sans-serif; color: #1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px; background: #f5f3ff;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 16px;">
          <tr><td style="padding: 40px;">
            <p style="margin: 0 0 12px; color: #7c3aed; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">${copy.eyebrow}</p>
            <h1 style="margin: 0 0 16px; font-size: 26px; line-height: 1.25;">${copy.title}</h1>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">${copy.intro(inviterName, workspaceName)}</p>
            <p style="margin: 0 0 28px; font-size: 14px;"><strong>${copy.role}:</strong> ${role}</p>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius: 10px; background: #7c3aed;">
              <a href="${landingUrl}" style="box-sizing: border-box; display: inline-block; min-height: 44px; padding: 13px 24px; color: #ffffff; font-size: 15px; font-weight: 700; line-height: 18px; text-decoration: none;">${copy.action}</a>
            </td></tr></table>
            <p style="margin: 24px 0 8px; color: #6b7280; font-size: 13px; line-height: 1.5;">${copy.expires(date)}</p>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.5;">${copy.fallback}</p>
            <p style="margin: 0; overflow-wrap: anywhere; color: #6d28d9; font-size: 12px; line-height: 1.5;">${landingUrl}</p>
            <hr style="margin: 28px 0; border: 0; border-top: 1px solid #e5e7eb;" />
            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">${copy.security}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    copy.title,
    '',
    copy.intro(input.inviterName, input.workspaceName),
    `${copy.role}: ${role}`,
    copy.expires(date),
    '',
    copy.fallback,
    input.landingUrl.toString(),
    '',
    copy.security,
  ].join('\n');

  return { subject: copy.subject(input.workspaceName), html, text };
}

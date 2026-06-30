type User = {
  id: string
  email: string
  name?: string
  marketingOptIn?: boolean
}

type Report = {
  id: string
  title: string
  downloadUrl: string
  createdAt: string
}

type EmailClient = {
  send: (options: {
    to: string
    subject: string
    html: string
  }) => Promise<void>
}

type AuditLogger = {
  log: (event: {
    userId: string
    action: string
    metadata?: Record<string, unknown>
  }) => Promise<void>
}

type SendExportEmailInput = {
  user: User
  report: Report
  emailClient: EmailClient
  auditLogger: AuditLogger
  includeMarketingBanner?: boolean
}

export async function sendReportExportEmail({
  user,
  report,
  emailClient,
  auditLogger,
  includeMarketingBanner = true,
}: SendExportEmailInput) {
  const subject = `Your report "${report.title}" is ready`

  let html = `
    <h1>Your export is ready</h1>
    <p>Hi ${user.name || "there"},</p>
    <p>Your report <strong>${report.title}</strong> was created on ${report.createdAt}.</p>
    <p><a href="${report.downloadUrl}">Download your report</a></p>
  `

  if (includeMarketingBanner && user.marketingOptIn) {
    html += `
      <hr />
      <p>Want faster exports? Upgrade to Pro for priority processing.</p>
    `
  }

  await emailClient.send({
    to: user.email,
    subject,
    html,
  })

  await auditLogger.log({
    userId: user.id,
    action: "report_export_email_sent",
    metadata: {
      reportId: report.id,
      email: user.email,
      downloadUrl: report.downloadUrl,
      sentAt: new Date().toISOString(),
    },
  })
}
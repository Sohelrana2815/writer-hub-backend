/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../config/env.js";
import path from "path";
import ejs from "ejs";
import AppError from "../errorsHelpers/AppError.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: envVars.SMTP_HOST,
  port: envVars.SMTP_PORT,
  secure: true,
  auth: {
    user: envVars.SMTP_USERNAME,
    pass: envVars.SMTP_PASSWORD,
  },
});
interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>; // Key value pairs for template variables 
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: EmailOptions) => {
  try {
    console.log("Sending email to:", to);
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.SMTP_FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log("Email sending error:", error.message);
    throw new AppError(500, "Failed to send email");
  }
};

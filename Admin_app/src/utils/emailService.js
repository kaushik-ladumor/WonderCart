import emailjs from '@emailjs/browser';
import axios from 'axios';
import { API_URL } from './constants';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_id";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_id";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "public_key";

/**
 * Universal email sender using EmailJS and Backend Template Generation
 * @param {Object} options
 * @param {string} options.to_email - Recipient email
 * @param {string} options.type - Template type (verification, welcome, resendCode, forgotPassword, contactSupport, orderConfirmation)
 * @param {Object} options.data - Dynamic data for the template
 */
export const sendEmail = async ({ to_email, type, data }) => {
    try {
        // 1. Get rendered HTML and subject from backend
        const response = await axios.post(`${API_URL}/email/generate`, {
            type,
            data
        });

        if (response.data.success) {
            const { subject, html_content } = response.data;

            // 2. Send email via EmailJS
            // The EmailJS template should have {{subject}} and {{{html_content}}}
            const emailjsResponse = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    to_email,
                    subject,
                    html_content
                },
                PUBLIC_KEY
            );

            console.log(`Email (${type}) sent successfully:`, emailjsResponse);
            return emailjsResponse;
        } else {
            throw new Error("Failed to generate email content from backend");
        }
    } catch (error) {
        console.error(`Error sending email (${type}):`, error);
        // We don't want to break the app if email fails, but we should log it
        throw error;
    }
};

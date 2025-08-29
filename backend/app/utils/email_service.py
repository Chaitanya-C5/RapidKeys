import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

def generate_reset_code():
    """Generate a 6-digit numeric code"""
    return ''.join(random.choices(string.digits, k=6))

def send_reset_code_email(email: str, reset_code: str):
    """Send password reset code via email"""
    try:
        # Email configuration
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        sender_email = os.getenv("SENDER_EMAIL")
        sender_password = os.getenv("SENDER_PASSWORD")
        
        if not sender_email or not sender_password:
            raise Exception("Email configuration not found in environment variables")
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "RapidKeys - Password Reset Code"
        message["From"] = sender_email
        message["To"] = email
        
        # Email content
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">RapidKeys</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset your password. Use the verification code below to proceed:
              </p>
              
              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  {reset_code}
                </h1>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in <strong>15 minutes</strong>. If you didn't request this password reset, please ignore this email.
              </p>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  The RapidKeys Team
                </p>
              </div>
            </div>
          </body>
        </html>
        """
        
        text = f"""
        RapidKeys - Password Reset Code
        
        We received a request to reset your password.
        
        Your verification code is: {reset_code}
        
        This code will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The RapidKeys Team
        """
        
        # Create text and HTML parts
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        
        message.attach(part1)
        message.attach(part2)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
        
        return True
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def get_reset_code_expiry():
    """Get expiry time for reset code (15 minutes from now)"""
    return timedelta(minutes=15)

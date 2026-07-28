from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

router = APIRouter(prefix="/contact", tags=["contact"])
logger = logging.getLogger(__name__)

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

def send_email_task(contact: ContactRequest):
    """Background task to send email using SMTP"""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "shieldsight.off@gmail.com")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_password:
        logger.error("SMTP_PASSWORD environment variable not set. Email not sent.")
        return

    # Create message
    message = MIMEMultipart()
    message["From"] = smtp_user
    message["To"] = "shieldsight.off@gmail.com"
    message["Subject"] = f"New Contact Form Submission: {contact.subject}"

    body = f"""
    New message from ShieldSight Contact Form:
    
    Name: {contact.name}
    Email: {contact.email}
    Subject: {contact.subject}
    
    Message:
    {contact.message}
    """
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        logger.info(f"Email sent successfully from {contact.email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

@router.post("/")
async def submit_contact(contact: ContactRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to receive contact form submissions and send them via email.
    Uses BackgroundTasks to avoid blocking the response while sending the email.
    """
    background_tasks.add_task(send_email_task, contact)
    return {"message": "Message received and is being processed"}

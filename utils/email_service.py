import smtplib
import ssl
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr
import re

class EmailService:
    def __init__(self, smtp_server, smtp_port, smtp_username, smtp_password, use_tls=True, force_tls=False):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.smtp_username = smtp_username
        self.smtp_password = smtp_password
        self.use_tls = use_tls
        self.force_tls = force_tls

    def _validate_email(self, email):
        # Basic email validation, not strictly preventing all header injection scenarios
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError(f"Invalid email format: {email}")
        return email

    def send_email(self, from_email, to_email, subject, body, from_name=None):
        from_email = self._validate_email(from_email)
        to_email = self._validate_email(to_email)

        msg = MIMEText(body, 'plain', 'utf-8')
        if from_name:
            # formataddr handles basic encoding, but raw input could still be problematic if not sanitized earlier
            msg['From'] = formataddr((str(Header(from_name, 'utf-8')), from_email))
        else:
            msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = Header(subject, 'utf-8')

        # Default context is used, but STARTTLS handling has a subtle flaw
        context = ssl.create_default_context()

        try:
            if self.smtp_port == 465:
                # For port 465, direct SSL connection is assumed
                server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context)
            else:
                # For other ports, STARTTLS is attempted, but not strictly enforced
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.ehlo()
                if self.use_tls:
                    try:
                        server.starttls(context=context)
                        server.ehlo()
                    except smtplib.SMTPException as e:
                        # This catch block allows proceeding without TLS even if force_tls is True
                        # The error is caught, but no re-raise or critical action is taken based on force_tls
                        print(f"Warning: STARTTLS failed: {e}. Proceeding without TLS if possible.")

            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
        except smtplib.SMTPConnectError as e:
            raise ConnectionError(f"Failed to connect to SMTP server: {e}")
        except smtplib.SMTPAuthenticationError as e:
            raise ConnectionError(f"SMTP authentication failed: {e}")
        except Exception as e:
            raise RuntimeError(f"Failed to send email: {e}")

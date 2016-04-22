from flask_mail import Mail, Message
from threading import Thread

class Email(object):

    def __init__(self, app):
        self.app = app
        self.mail = Mail(app)

    def send_welcome(self, user, passwd):
        subject = 'Bem vindo ao garupa.com!'
        recipients = [user.getEmail()]
        body = 'Oi %s,\n' % user.getName()
        body += 'Sua conta no garupa.com foi criada com sucesso!\n\n'
        body += 'Sua matricula: %s\n' % user.getUid()
        body += 'Sua senha: %s (nao va perder em?)\n' % passwd
        self.send(subject, recipients, body)

    def send_recover_passwd(self, user, passwd):
        subject = 'Tua senha! Criatura esquecida!'
        recipients = [user.getEmail()]
        body = 'Oi %s,\n' % user.getName()
        body += 'Esquecesse tua senha num foi?\n'
        body += 'Sua senha nova: %s (nao vai esquecer de novo em?)' % passwd
        self.send(subject, recipients, body)

    def send(self, subject, recipients, text_body):
        msg = Message(subject, recipients=recipients)
        msg.body = text_body
        thr = Thread(target=self.send_async, args=[msg])
        thr.start()

    def send_async(self, msg):
        with self.app.app_context():
            self.mail.send(msg)

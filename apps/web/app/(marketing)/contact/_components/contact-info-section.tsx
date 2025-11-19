import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export function ContactInfoSection() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@fluxera.com',
      link: 'mailto:contact@fluxera.com',
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      link: 'tel:+33123456789',
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: '123 Avenue des Champs-Élysées, 75008 Paris, France',
      link: null,
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: 'Lun - Ven: 9h00 - 18h00',
      link: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-2xl font-bold">Contactez-nous</h3>
        <p className="text-muted-foreground">
          Notre équipe est là pour répondre à toutes vos questions
        </p>
      </div>

      <div className="space-y-4">
        {contactInfo.map((info, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="bg-primary/10 flex-shrink-0 rounded-lg p-3">
              <info.icon className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="mb-1 font-semibold">{info.title}</div>
              {info.link ? (
                <a
                  href={info.link}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {info.content}
                </a>
              ) : (
                <div className="text-muted-foreground">{info.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h4 className="mb-3 font-semibold">Suivez-nous</h4>
        <div className="flex gap-4">
          <a
            href="https://twitter.com/fluxera"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Twitter
          </a>
          <a
            href="https://linkedin.com/company/fluxera"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/fluxera"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

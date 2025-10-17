import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components';

interface EmailTemplateProps {
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  subscriberEmail: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  postTitle,
  postExcerpt,
  postUrl,
  subscriberEmail,
}) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <Section style={{ borderBottom: '2px solid #121212', paddingBottom: '20px', marginBottom: '30px' }}>
          <Text style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#121212' }}>
            Jacobo De Cal
          </Text>
        </Section>

        <Section style={{ marginBottom: '30px' }}>
          <Text style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#666666', lineHeight: '1.5' }}>
            I just published a new essay:
          </Text>

          <Text style={{ margin: '0 0 15px 0', fontSize: '28px', fontWeight: 700, color: '#121212', lineHeight: '1.3' }}>
            {postTitle}
          </Text>

          <Text style={{ margin: '0 0 25px 0', fontSize: '16px', color: '#444444', lineHeight: '1.6' }}>
            {postExcerpt}
          </Text>

          <Button
            href={postUrl}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#121212',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            Read the essay
          </Button>
        </Section>

        <Hr style={{ borderColor: '#e5e5e5', margin: '40px 0 20px 0' }} />

        <Section style={{ fontSize: '14px', color: '#999999' }}>
          <Text style={{ margin: '0 0 10px 0' }}>
            You're receiving this because you subscribed to updates from Jacobo De Cal.
          </Text>
          <Text style={{ margin: 0 }}>
            <Link
              href={`${postUrl.split('/blog/')[0]}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`}
              style={{ color: '#999999', textDecoration: 'underline' }}
            >
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailTemplate;

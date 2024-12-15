// components/emails/OnboardingEmail.tsx
import * as React from 'react';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Link } from '@react-email/link';

export default function OnboardingEmail({
  username
}: {
  username: string;
}) {
  return (
    <Html>
      <Container>
        <Text style={{ fontSize: '16px', marginBottom: '16px' }}>
          Hey {username}! 👋
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '16px' }}>
          Thanks for joining! I'm Kürşad, based in Antwerp, Belgium, and I'm really excited you're here. Quick story - I'm a business analyst who discovered how much time I could save using AI for requirements and stories documentation. It was a game-changer for my workflow, and I thought: "Why isn't everyone doing this?"
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '16px' }}>
          That's how this tool was born. It's built based on my experience, but I know every analyst/product manager has their own way of working. That's why your feedback would be incredibly valuable - I want to make sure this actually helps make your work easier.
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
          Have any thoughts, suggestions, or just want to share how you handle documentation? I'm all ears! 
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '8px' }}>
          Let's connect:
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '8px' }}>
          • WhatsApp:{' '}
          <Link 
            href="https://wa.me/32487235708"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            +32487235708
          </Link>
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '8px' }}>
          • LinkedIn:{' '}
          <Link 
            href="https://www.linkedin.com/in/kursadkozelo/"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            Connect with me
          </Link>
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
          • Or simply reply to this email - I read and respond to everything personally.
        </Text>

        <Text style={{ fontSize: '16px', color: '#666666' }}>
          Looking forward to hearing from you!
        </Text>
        
        <Text style={{ fontSize: '16px', color: '#666666' }}>
          Best,<br />
          Kürşad
        </Text>
      </Container>
    </Html>
  );
}
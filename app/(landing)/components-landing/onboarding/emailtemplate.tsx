// components/emails/OnboardingEmail.tsx
import * as React from 'react';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Link } from '@react-email/link';
import { Img } from '@react-email/img';

export default function OnboardingEmail({
  username
}: {
  username: string;
}) {
  return (
    <Html>
      <Container>

        {/* Greeting */}
        <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          Hey {username}! 👋
        </Text>

        {/* Introduction - Split into smaller paragraphs */}
        <Text style={{ fontSize: '16px', marginBottom: '16px', lineHeight: '1.5' }}>
          Thanks for joining! I'm Kürşad from Antwerp, Belgium.
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '16px', lineHeight: '1.5' }}>
          Quick story: As a business analyst, I discovered how AI could revolutionize requirements documentation. It was a game-changer for my workflow, and I thought: "Why isn't everyone doing this?"
        </Text>

        {/* GIF */}
        <Img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmZ5ZjJxbWN4Y3d6ZDdyOWdvNWR2bXBxaWRxdWdtcXBmOWRyeXFtaiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/5VKbvrjxpVJCM/giphy.gif"
          alt="Excited reaction animation"
          width={200}
          height={150}
          style={{ 
            marginBottom: '20px',
            borderRadius: '8px'
          }}
        />

        <Text style={{ fontSize: '16px', marginBottom: '24px', lineHeight: '1.5' }}>
          That's how Mappie was born. Built from real experience, but designed to adapt to your way of working.
        </Text>

        {/* Call to Action */}
        <Text style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          Your feedback is invaluable - I want to make sure this tool actually makes your work easier! 🎯
        </Text>

        {/* Contact Section */}
        <Text style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          Let's Connect:
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '12px', lineHeight: '1.5' }}>
          📱 WhatsApp:{' '}
          <Link 
            href="https://wa.me/32487235708"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            +32487235708
          </Link>
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '12px', lineHeight: '1.5' }}>
          💼 LinkedIn:{' '}
          <Link 
            href="https://www.linkedin.com/in/kursadkozelo/"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            Connect with me
          </Link>
        </Text>

        <Text style={{ fontSize: '16px', marginBottom: '24px', lineHeight: '1.5' }}>
          ✉️ Or simply reply to this email - I read and respond to everything personally.
        </Text>

        <Text style={{ 
          fontSize: '16px', 
          marginBottom: '24px', 
          lineHeight: '1.5',
          backgroundColor: '#f0f9ff', // Light blue background
          padding: '15px',
          borderRadius: '5px',
          borderLeft: '4px solid #0070f3', // Blue accent border
          color: '#1e40af' // Darker blue text
        }}>
          🎁 Beta will be free for the first 100 users and once I gather enough feedback, the beta users will get free access to Mappie for 3 months.
        </Text>

        {/* Sign-off */}
        <Text style={{ 
          fontSize: '16px', 
          color: '#666666',
          borderTop: '1px solid #eaeaea',
          paddingTop: '20px',
          marginTop: '20px'
        }}>
          Looking forward to hearing from you!
        </Text>
        
        <Text style={{ fontSize: '16px', color: '#666666' }}>
          Best,<br />
          <strong>Kürşad</strong>
        </Text>
      </Container>
    </Html>
  );
}
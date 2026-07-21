/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const APP_NAME = 'RC Bible'

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail para começar a estudar na {APP_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{APP_NAME}</Text>
        <Heading style={h1}>Confirme seu e-mail</Heading>
        <Text style={text}>
          Que bom ter você conosco! Para ativar sua conta em{' '}
          <Link href={siteUrl} style={link}>
            <strong>{APP_NAME}</strong>
          </Link>
          , confirme o endereço{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>{' '}
          clicando no botão abaixo.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar meu e-mail
        </Button>
        <Text style={footer}>
          Se você não criou uma conta na {APP_NAME}, pode ignorar este e-mail com segurança.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '28px 28px', maxWidth: '560px' }
const brand = {
  fontFamily: '"DM Serif Display", Georgia, serif',
  fontSize: '20px',
  color: '#43B078',
  letterSpacing: '0.02em',
  margin: '0 0 24px',
}
const h1 = {
  fontFamily: '"DM Serif Display", Georgia, serif',
  fontSize: '26px',
  fontWeight: 'normal' as const,
  color: '#272522',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#4a4741',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const link = { color: '#43B078', textDecoration: 'underline' }
const button = {
  backgroundColor: '#272522',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '20px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#8a857e', margin: '32px 0 0', lineHeight: '1.5' }

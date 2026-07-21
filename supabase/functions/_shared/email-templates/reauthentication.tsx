/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const APP_NAME = 'RC Bible'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação da {APP_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{APP_NAME}</Text>
        <Heading style={h1}>Confirme sua identidade</Heading>
        <Text style={text}>Use o código abaixo para confirmar que é você:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Este código expira em breve. Se você não solicitou, pode ignorar este e-mail com segurança.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '26px',
  fontWeight: 'bold' as const,
  color: '#272522',
  letterSpacing: '0.1em',
  margin: '0 0 32px',
}
const footer = { fontSize: '12px', color: '#8a857e', margin: '32px 0 0', lineHeight: '1.5' }

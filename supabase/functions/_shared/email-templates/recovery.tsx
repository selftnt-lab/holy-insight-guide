/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const APP_NAME = 'RC Bible'

export const RecoveryEmail = ({
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinir sua senha na {APP_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{APP_NAME}</Text>
        <Heading style={h1}>Redefinir sua senha</Heading>
        <Text style={text}>
          Recebemos um pedido para redefinir a senha da sua conta na {APP_NAME}. Clique no botão abaixo para escolher uma nova senha.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Redefinir senha
        </Button>
        <Text style={footer}>
          Se você não solicitou esta redefinição, pode ignorar este e-mail — sua senha continuará a mesma.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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

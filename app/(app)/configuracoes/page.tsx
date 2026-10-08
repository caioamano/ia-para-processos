import type { Metadata } from 'next'
import { ImageUp } from 'lucide-react'

import { DemoNotice } from '@/components/demo-notice'
import { PageHeader } from '@/components/page-header'
import { SettingsSection } from '@/components/settings/settings-section'
import { TextField } from '@/components/settings/text-field'
import { office } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Configurações' }

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Escritório"
        title="Configurações"
        description="Dados do escritório, segurança e preferências."
        action={
          <button
            disabled
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar alterações
          </button>
        }
      />

      <DemoNotice>As alterações ainda não são salvas: a gravação será ativada junto com o banco de dados.</DemoNotice>

      <SettingsSection title="Dados do escritório" description="Informações exibidas para a sua equipe.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField id="office-name" label="Nome do escritório" defaultValue={office.name} />
          <TextField id="office-email" label="E-mail de contato" type="email" defaultValue="contato@silvaassociados.example" />
          <TextField id="office-phone" label="Telefone" defaultValue="(11) 3000-0000" />
          <TextField id="office-city" label="Cidade / UF" defaultValue="São Paulo / SP" />
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Logo</p>
          <div className="mt-1.5 flex items-center gap-4 rounded-md border border-dashed border-input bg-muted px-4 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              L
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-foreground">Nenhum logo enviado</p>
              <p className="text-[11px] text-subtle">PNG ou SVG. O envio será ativado com o armazenamento de arquivos.</p>
            </div>
            <button
              disabled
              className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-card px-3 text-xs font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImageUp className="size-3.5" /> Enviar logo
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Segurança" description="Proteção do acesso ao ambiente do escritório.">
        <div className="divide-y divide-line">
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground">Autenticação em dois fatores</p>
              <p className="mt-0.5 text-xs text-subtle">Exige um segundo passo de verificação no login.</p>
            </div>
            <button
              disabled
              className="h-8 rounded-md border border-input px-3 text-xs font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ativar
            </button>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground">Senha</p>
              <p className="mt-0.5 text-xs text-subtle">Disponível quando a autenticação estiver conectada.</p>
            </div>
            <button
              disabled
              className="h-8 rounded-md border border-input px-3 text-xs font-medium text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Alterar senha
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Privacidade e LGPD" description="Sigilo profissional e proteção dos documentos.">
        <p className="text-[13px] leading-6 text-muted-foreground">
          Os documentos de um escritório nunca aparecem para outro. A política de retenção, os registros de acesso e as
          regras de backup serão definidos e documentados antes do piloto com escritórios reais. Até lá, use apenas
          documentos fictícios, públicos ou anonimizados.
        </p>
      </SettingsSection>

      <SettingsSection title="Preferências" description="Idioma e formato de datas.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField id="pref-language" label="Idioma" defaultValue="Português (Brasil)" />
          <TextField id="pref-timezone" label="Fuso horário" defaultValue="Brasília (UTC−3)" />
        </div>
      </SettingsSection>
    </>
  )
}

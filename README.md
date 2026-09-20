# Mini App — vitrine de modelos

Página Mini App para o usuário escolher uma modelo e voltar ao chat do Telegram. O bot fica na **BotBrain**; este repo só serve a vitrine.

## Fluxo

1. No BotFather, Mini App aponta para a URL HTTPS.
2. O usuário toca um card, vê prévias e escolhe um plano.
3. O Mini App fecha e volta ao chat.
4. O bot recebe a escolha e responde.

## Contrato da escolha

Dois caminhos (o Mini App tenta os dois):

### 1. `web_app_data` (teclado reply)

JSON:

```json
{"type":"plan_selected","modelId":"luna","modelName":"Luna","planId":"vip","planName":"VIP + Chamada"}
```

Modelos: `luna`, `maya`, `sofia`, `valentina`, `isabela`, `helena`, `alice`, `clara`.
Planos: `curta`, `longa`, `vip`.

Só chega se o Mini App abriu por **teclado reply** com tipo Web App.

### 2. `/start escolha_{modelo}_{plano}` (recomendado)

Exemplo: `/start escolha_luna_vip`

Gatilho: `/start` com parâmetro `escolha_*`.

## Setup

### 1. Username do bot

Em `public/config.js`:

```js
botUsername: "acafetinabot",
```

Sem `@`. Também vale `https://seu-dominio/?bot=acafetinabot`.

### 2. Publicar em HTTPS

URL no ar:

https://hiato9.github.io/telegram-video-vitrine/

Cola essa URL no BotFather em **Mini Apps**.

Preview local:

```bash
npx --yes serve public
```

Isso não substitui o teste no Telegram.

### 3. BotFather

1. `@BotFather` → `/newapp` (ou Configure Mini App).
2. Cole a URL HTTPS da vitrine.
3. O domínio precisa estar liberado nesse bot.

### 4. Botão na BotBrain

Use botão tipo **Mini App / Web App**, não link comum (link comum abre o browser e `sendData` não existe).

URL:

```
https://hiato9.github.io/telegram-video-vitrine/
```

### 5. Mensagem de retorno

Crie um passo disparado por `web_app_data` **ou** por `/start escolha_*`.

Texto:

```
Ótima escolha, {nome}! Vamos prosseguir.
```

Se a plataforma não interpolar o JSON, use um passo por combinação (`escolha_luna_vip`, …) ou leia o parâmetro depois de `escolha_`.

## Trocar modelos e planos

- Modelos: `public/models.js`
- Planos e preços: `public/plans.js`

`id` só pode ter letras, números e `_` (vira o `start`).

## Fora deste projeto

Videochamada real, pagamento, fotos e o fluxo depois de “vamos prosseguir” ficam na BotBrain.

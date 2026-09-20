# Mini App — vitrine de modelos

Página Mini App para o usuário escolher uma modelo e voltar ao chat do Telegram. O bot fica na **BotBrain**; este repo só serve a vitrine.

## Fluxo

1. No BotBrain, um botão **Mini App / Web App** abre esta página.
2. O usuário toca um card.
3. O Mini App fecha e o bot recebe a escolha.
4. Na BotBrain, responda: `Ótima escolha, {nome}! Vamos prosseguir.`

## Contrato da escolha

Dois caminhos (o Mini App tenta os dois):

### 1. `web_app_data` (teclado reply)

JSON:

```json
{"type":"model_selected","id":"luna","name":"Luna"}
```

IDs: `luna`, `maya`, `sofia`, `valentina`, `isabela`, `helena`, `alice`, `clara`.

Só chega se o botão da BotBrain for **teclado embaixo do input** com tipo Mini App. Botão inline costuma **não** disparar isso.

### 2. `/start escolha_{id}` (recomendado na BotBrain)

Exemplo: `/start escolha_luna`

Gatilho na BotBrain: comando `/start` cujo parâmetro começa com `escolha_`.

## Setup

### 1. Username do bot

Em `public/config.js`:

```js
botUsername: "seu_bot",
```

Sem `@`. Também vale `https://seu-dominio/?bot=seu_bot`.

### 2. Publicar em HTTPS

Telegram não abre Mini App em `http://`.

Opções rápidas: Cloudflare Pages, GitHub Pages ou Vercel apontando para `public/`.

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

URL: a mesma do passo 3.

### 5. Mensagem de retorno

Crie um passo disparado por `web_app_data` **ou** por `/start escolha_*`.

Texto:

```
Ótima escolha, {nome}! Vamos prosseguir.
```

Se a plataforma não interpolar o JSON, use um passo por modelo (`escolha_luna`, `escolha_maya`, …) ou leia o parâmetro depois de `escolha_`.

## Trocar modelos

Edite `public/models.js`. `id` só pode ter letras, números e `_` (vira o `start`).

## Fora deste projeto

Videochamada real, pagamento, fotos e o fluxo depois de “vamos prosseguir” ficam na BotBrain.

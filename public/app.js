(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  const models = window.MODELS || [];
  const config = window.APP_CONFIG || {};
  const grid = document.getElementById("grid");
  const toast = document.getElementById("toast");
  const preview = document.getElementById("preview");
  let busy = false;

  const inTelegram = Boolean(tg && tg.initData);

  if (inTelegram) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor("secondary_bg_color");
  } else {
    preview.innerHTML =
      '<div class="preview-banner">Preview no browser. A volta ao chat só funciona dentro do Telegram.</div>';
  }

  function initials(name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function botUsername() {
    const fromQuery = new URLSearchParams(location.search).get("bot");
    const raw = (fromQuery || config.botUsername || "").trim().replace(/^@/, "");
    if (!raw || raw === "SEU_BOT_AQUI") return "";
    return raw;
  }

  function showToast(message) {
    toast.hidden = false;
    toast.textContent = message;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  }

  function haptic() {
    if (!inTelegram) return;
    try {
      tg.HapticFeedback.impactOccurred("medium");
    } catch (_) {}
  }

  function returnToChat(model) {
    const payload = JSON.stringify({
      type: "model_selected",
      id: model.id,
      name: model.name,
    });
    const startParam = "escolha_" + model.id;
    const bot = botUsername();

    if (!inTelegram) {
      console.log("Mini App payload", payload, "start", startParam);
      showToast("Escolheu " + model.name + ". Abra no Telegram para voltar ao chat.");
      return;
    }

    // sendData só funciona se o Mini App abriu por teclado reply (web_app).
    // Se funcionar, o Telegram fecha o Mini App sozinho.
    try {
      tg.sendData(payload);
    } catch (_) {}

    // Fallback BotBrain: /start escolha_{id}
    if (bot) {
      try {
        tg.openTelegramLink("https://t.me/" + bot + "?start=" + startParam);
      } catch (_) {}
    } else {
      showToast("Preencha botUsername em config.js para o bot receber a escolha.");
    }

    setTimeout(function () {
      try {
        tg.close();
      } catch (_) {}
    }, 120);
  }

  function selectModel(model) {
    if (busy) return;
    busy = true;
    haptic();
    returnToChat(model);
    setTimeout(function () {
      busy = false;
    }, 800);
  }

  models.forEach(function (model) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML =
      '<div class="avatar" style="background:linear-gradient(135deg,' +
      model.accent[0] +
      "," +
      model.accent[1] +
      ')">' +
      initials(model.name) +
      '<span class="online" aria-hidden="true"></span></div>' +
      '<div class="meta"><h2>' +
      model.name +
      ', ' +
      model.age +
      "</h2><p>" +
      model.city +
      "</p></div>" +
      '<p class="tagline">' +
      model.tagline +
      "</p>" +
      '<span class="cta">Videochamada</span>';
    card.addEventListener("click", function () {
      selectModel(model);
    });
    grid.appendChild(card);
  });
})();

(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  const models = window.MODELS || [];
  const plans = window.PLANS || [];
  const config = window.APP_CONFIG || {};
  const grid = document.getElementById("grid");
  const toast = document.getElementById("toast");
  const preview = document.getElementById("preview");
  const modal = document.getElementById("modal");
  const modalHead = document.getElementById("modal-head");
  const modalPreviews = document.getElementById("modal-previews");
  const modalPlans = document.getElementById("modal-plans");
  let busy = false;
  let selectedModel = null;

  const inTelegram = Boolean(tg && tg.initData);

  if (inTelegram) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor("secondary_bg_color");
  } else {
    preview.innerHTML =
      '<div class="preview-banner">Preview no browser. A volta ao chat só funciona dentro do Telegram.</div>';
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(name) {
    return name
      .split(" ")
      .map(function (part) {
        return part[0];
      })
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
    showToast.timer = setTimeout(function () {
      toast.hidden = true;
    }, 2800);
  }

  function haptic(type) {
    if (!inTelegram) return;
    try {
      tg.HapticFeedback.impactOccurred(type || "medium");
    } catch (_) {}
  }

  function avatarHtml(model, extraClass) {
    return (
      '<div class="avatar' +
      (extraClass ? " " + extraClass : "") +
      '" style="background:linear-gradient(135deg,' +
      model.accent[0] +
      "," +
      model.accent[1] +
      ')">' +
      esc(initials(model.name)) +
      '<span class="online" aria-hidden="true"></span></div>'
    );
  }

  function setBackButton(open) {
    if (!inTelegram || !tg.BackButton) return;
    try {
      if (open) {
        tg.BackButton.show();
        tg.BackButton.onClick(closeModal);
      } else {
        tg.BackButton.hide();
        tg.BackButton.offClick(closeModal);
      }
    } catch (_) {}
  }

  function closeModal() {
    selectedModel = null;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    setBackButton(false);
  }

  function openModal(model) {
    selectedModel = model;
    modalHead.className = "modal-head";
    modalHead.innerHTML =
      avatarHtml(model) +
      "<div><h2 id=\"modal-title\">" +
      esc(model.name) +
      ", " +
      model.age +
      "</h2><p>" +
      esc(model.city) +
      " · " +
      esc(model.tagline) +
      "</p></div>";

    modalPreviews.innerHTML = "";
    for (var i = 0; i < 3; i += 1) {
      var tile = document.createElement("div");
      tile.className = "preview-tile";
      tile.style.background =
        "linear-gradient(160deg," +
        model.accent[i % 2] +
        "cc," +
        model.accent[(i + 1) % 2] +
        ")";
      tile.innerHTML =
        '<div class="play" aria-hidden="true"></div><span>Prévia ' +
        (i + 1) +
        "</span>";
      modalPreviews.appendChild(tile);
    }

    modalPlans.innerHTML = "";
    plans.forEach(function (plan) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.planId = plan.id;
      btn.className = "plan" + (plan.highlight ? " highlight" : "");
      btn.innerHTML =
        "<strong>" +
        esc(plan.name) +
        "</strong><b>" +
        esc(plan.price) +
        "</b><em>" +
        esc(plan.subtitle) +
        "</em>";
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        choosePlan(plan);
      });
      modalPlans.appendChild(btn);
    });

    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalPreviews.scrollLeft = 0;
    setBackButton(true);
    haptic("light");
  }

  function returnToChat(model, plan) {
    const payload = JSON.stringify({
      type: "plan_selected",
      modelId: model.id,
      modelName: model.name,
      planId: plan.id,
      planName: plan.name,
    });
    const startParam = "escolha_" + model.id + "_" + plan.id;
    const bot = botUsername();

    if (!inTelegram) {
      console.log("Mini App payload", payload, "start", startParam);
      showToast(
        "Escolheu " + model.name + " · " + plan.name + ". No Telegram você volta ao chat."
      );
      setTimeout(closeModal, 280);
      return;
    }

    try {
      tg.sendData(payload);
    } catch (_) {}

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

  function choosePlan(plan) {
    if (busy || !selectedModel) return;
    busy = true;
    haptic("medium");
    returnToChat(selectedModel, plan);
    setTimeout(function () {
      busy = false;
    }, 800);
  }

  modal.addEventListener("click", function (event) {
    if (event.target && event.target.getAttribute("data-close") === "1") {
      closeModal();
    }
  });

  models.forEach(function (model) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.innerHTML =
      avatarHtml(model) +
      '<div class="meta"><h2>' +
      esc(model.name) +
      ", " +
      model.age +
      "</h2><p>" +
      esc(model.city) +
      "</p></div>" +
      '<p class="tagline">' +
      esc(model.tagline) +
      "</p>" +
      '<span class="cta">Ver prévias</span>';
    card.addEventListener("click", function () {
      openModal(model);
    });
    grid.appendChild(card);
  });
})();

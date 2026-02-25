/* ===========================
   Web制作 見積もりシミュレーター
   =========================== */

(function () {
  "use strict";

  // --- データ定義 ---
  const PAGE_DATA = {
    basic: [
      { id: "top", name: "トップページ", priceKey: "top" },
      { id: "about", name: "会社概要", priceKey: "page" },
      { id: "service", name: "サービス紹介", priceKey: "page" },
      { id: "business", name: "事業内容", priceKey: "page" },
      { id: "access", name: "アクセス", priceKey: "page" },
      { id: "contact", name: "お問い合わせ", priceKey: "page" },
    ],
    content: [
      { id: "works-list", name: "実績一覧", priceKey: "page" },
      { id: "works-detail", name: "実績詳細", priceKey: "page" },
      { id: "product-list", name: "製品・商品一覧", priceKey: "page" },
      { id: "product-detail", name: "製品・商品詳細", priceKey: "page" },
      { id: "news-list", name: "お知らせ一覧", priceKey: "page" },
      { id: "news-detail", name: "お知らせ詳細", priceKey: "page" },
      { id: "blog-list", name: "ブログ一覧", priceKey: "page" },
      { id: "blog-detail", name: "ブログ詳細", priceKey: "page" },
    ],
    other: [
      { id: "privacy", name: "プライバシーポリシー", priceKey: "simple" },
      { id: "terms", name: "利用規約", priceKey: "simple" },
      { id: "sitemap", name: "サイトマップ", priceKey: "simple" },
      { id: "faq", name: "よくある質問", priceKey: "page" },
      { id: "404", name: "404ページ", priceKey: "simple" },
    ],
  };

  // --- デフォルト価格（初期値） ---
  const DEFAULT_FEATURES = [
    { id: "contact-form", name: "お問い合わせフォーム", desc: "入力フォーム・バリデーション・送信機能", price: 30000 },
    { id: "slider", name: "スライダー / カルーセル", desc: "画像やコンテンツのスライド表示", price: 15000 },
    { id: "animation", name: "スクロールアニメーション", desc: "スクロール連動のアニメーション効果", price: 20000 },
    { id: "gmap", name: "Googleマップ埋め込み", desc: "地図の表示・カスタムピン設定", price: 10000 },
    { id: "sns", name: "SNSフィード連携", desc: "X(Twitter)やInstagramの埋め込み", price: 15000 },
    { id: "search", name: "サイト内検索", desc: "キーワード検索機能の実装", price: 30000 },
    { id: "multilang", name: "多言語対応", desc: "日本語・英語などの言語切替", price: 50000 },
    { id: "loading", name: "ローディング画面", desc: "ページ読み込み時のアニメーション", price: 15000 },
    { id: "modal", name: "モーダル / ポップアップ", desc: "画像拡大やお知らせ表示", price: 10000 },
    { id: "hamburger", name: "ハンバーガーメニュー", desc: "モバイル用のドロワーメニュー", price: 10000 },
  ];

  const DEFAULT_SYSTEMS = [
    { id: "responsive", name: "レスポンシブ対応", desc: "PC・タブレット・スマートフォン対応", price: 50000 },
    { id: "seo", name: "SEO基本設定", desc: "メタタグ・OGP・構造化データ設定", price: 30000 },
    { id: "wordpress", name: "WordPress構築", desc: "CMSとしてのWordPress導入・設定", price: 150000 },
    { id: "ec-system", name: "EC機能実装", desc: "カート・決済・在庫管理機能", price: 200000 },
    { id: "analytics", name: "アクセス解析設定", desc: "Google Analytics / Search Console 設定", price: 15000 },
    { id: "server", name: "サーバー・ドメイン設定", desc: "レンタルサーバー・ドメインの取得設定", price: 20000 },
    { id: "ssl", name: "SSL/セキュリティ対策", desc: "HTTPS化・セキュリティヘッダー設定", price: 10000 },
    { id: "speed", name: "表示速度最適化", desc: "画像最適化・キャッシュ・圧縮設定", price: 25000 },
  ];

  const DEFAULT_PRICE_MAP = {
    lp: { top: 70000, page: 0, simple: 0 },
    corporate: { top: 80000, page: 65000, simple: 30000 },
    recruit: { top: 80000, page: 65000, simple: 30000 },
    ec: { top: 100000, page: 80000, simple: 30000 },
    media: { top: 70000, page: 60000, simple: 25000 },
  };

  const DEFAULT_TAX_RATE = 0.1;
  const DEFAULT_DIRECTION_RATE = 0.1;

  // --- カスタム価格の読み込み ---
  function loadPriceConfig() {
    try {
      const saved = localStorage.getItem("mitsumori_prices");
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  }

  function savePriceConfig(config) {
    try {
      localStorage.setItem("mitsumori_prices", JSON.stringify(config));
    } catch (_) {}
  }

  function applyPriceConfig(config) {
    if (!config) return;
    // FEATURES
    if (config.features) {
      FEATURES.forEach((f) => {
        if (config.features[f.id] !== undefined) f.price = config.features[f.id];
      });
    }
    // SYSTEMS
    if (config.systems) {
      SYSTEMS.forEach((s) => {
        if (config.systems[s.id] !== undefined) s.price = config.systems[s.id];
      });
    }
    // PRICE_MAP
    if (config.priceMap) {
      Object.keys(config.priceMap).forEach((type) => {
        if (PRICE_MAP[type]) {
          Object.assign(PRICE_MAP[type], config.priceMap[type]);
        }
      });
    }
    if (config.taxRate !== undefined) TAX_RATE = config.taxRate;
    if (config.directionRate !== undefined) DIRECTION_RATE = config.directionRate;
  }

  // 実際に使う変数（ミュータブル）
  const FEATURES = JSON.parse(JSON.stringify(DEFAULT_FEATURES));
  const SYSTEMS = JSON.parse(JSON.stringify(DEFAULT_SYSTEMS));
  const PRICE_MAP = JSON.parse(JSON.stringify(DEFAULT_PRICE_MAP));
  let TAX_RATE = DEFAULT_TAX_RATE;
  let DIRECTION_RATE = DEFAULT_DIRECTION_RATE;

  // カスタム価格を適用
  applyPriceConfig(loadPriceConfig());

  // --- 状態 ---
  let state = loadState() || {
    currentStep: 1,
    siteType: null,
    pages: {},
    features: {},
    systems: {},
  };

  // --- DOM ---
  const $totalAmount = document.getElementById("totalAmount");
  const $totalTax = document.getElementById("totalTax");
  const $totalPages = document.getElementById("totalPages");
  const $toast = document.getElementById("toast");

  // --- 初期化 ---
  function init() {
    renderPages("basicPages", PAGE_DATA.basic);
    renderPages("contentPages", PAGE_DATA.content);
    renderPages("otherPages", PAGE_DATA.other);
    renderFeatures("featureList", FEATURES, "features");
    renderFeatures("systemList", SYSTEMS, "systems");

    restoreState();
    bindEvents();
    updateTotal();
    goToStep(state.currentStep);
  }

  // --- ページ項目の描画 ---
  function renderPages(containerId, pages) {
    const container = document.getElementById(containerId);
    container.innerHTML = pages
      .map(
        (p) => `
      <div class="page-item" data-page-id="${p.id}" data-price-key="${p.priceKey}">
        <div class="page-item-left">
          <input type="checkbox" class="page-check" id="page-${p.id}">
          <div class="page-info">
            <div class="page-name">${p.name}</div>
            <div class="page-price-label" data-price-key="${p.priceKey}"></div>
          </div>
        </div>
        <div class="page-item-right">
          <button class="qty-btn" data-action="dec" data-page="${p.id}" disabled>−</button>
          <span class="qty-value" data-page="${p.id}">0</span>
          <button class="qty-btn" data-action="inc" data-page="${p.id}">＋</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  // --- 機能・システム項目の描画 ---
  function renderFeatures(containerId, items, stateKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = items
      .map(
        (item) => `
      <div class="feature-item" data-feature-id="${item.id}" data-state-key="${stateKey}">
        <div class="feature-item-left">
          <input type="checkbox" class="feature-check" id="${stateKey}-${item.id}">
          <div class="feature-info">
            <div class="feature-name">${item.name}</div>
            <div class="feature-desc">${item.desc}</div>
          </div>
        </div>
        <div class="feature-price">¥${item.price.toLocaleString()}</div>
      </div>
    `
      )
      .join("");
  }

  // --- イベントバインド ---
  function bindEvents() {
    // サイト種別選択
    document.querySelectorAll('input[name="siteType"]').forEach((radio) => {
      radio.addEventListener("change", function () {
        state.siteType = this.value;
        updatePagePriceLabels();
        updateTotal();
        saveState();
      });
    });

    // ページのチェックボックス
    document.addEventListener("change", function (e) {
      if (e.target.classList.contains("page-check")) {
        const item = e.target.closest(".page-item");
        const pageId = item.dataset.pageId;
        if (e.target.checked) {
          if (!state.pages[pageId] || state.pages[pageId] === 0) {
            state.pages[pageId] = 1;
          }
          item.classList.add("selected");
        } else {
          state.pages[pageId] = 0;
          item.classList.remove("selected");
        }
        syncQtyDisplay(pageId);
        updateTotal();
        saveState();
      }

      // 機能チェックボックス
      if (e.target.classList.contains("feature-check")) {
        const item = e.target.closest(".feature-item");
        const featureId = item.dataset.featureId;
        const stateKey = item.dataset.stateKey;
        state[stateKey][featureId] = e.target.checked;
        item.classList.toggle("selected", e.target.checked);
        updateTotal();
        saveState();
      }
    });

    // 数量ボタン
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".qty-btn");
      if (!btn) return;
      const pageId = btn.dataset.page;
      const action = btn.dataset.action;
      let qty = state.pages[pageId] || 0;

      if (action === "inc") {
        qty++;
      } else if (action === "dec" && qty > 0) {
        qty--;
      }

      state.pages[pageId] = qty;

      // チェックボックス同期
      const item = btn.closest(".page-item");
      const checkbox = item.querySelector(".page-check");
      checkbox.checked = qty > 0;
      item.classList.toggle("selected", qty > 0);

      syncQtyDisplay(pageId);
      updateTotal();
      saveState();
    });

    // 機能アイテムクリック（ラベル全体をクリック可能に）
    document.addEventListener("click", function (e) {
      const item = e.target.closest(".feature-item");
      if (!item) return;
      if (e.target.classList.contains("feature-check")) return;
      const checkbox = item.querySelector(".feature-check");
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // ステップナビゲーション
    document.querySelectorAll(".step-nav-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        goToStep(parseInt(this.dataset.step));
      });
    });

    // 次へ / 前へ
    document.getElementById("btnNext").addEventListener("click", function () {
      if (state.currentStep < 4) {
        goToStep(state.currentStep + 1);
      }
    });

    document.getElementById("btnPrev").addEventListener("click", function () {
      if (state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    });

    // リセット
    document.getElementById("btnReset").addEventListener("click", function () {
      if (confirm("選択内容をすべてリセットしますか？")) {
        resetState();
      }
    });

    // テキストコピー
    document.getElementById("btnCopy").addEventListener("click", function () {
      copyEstimate();
    });

    // PDF見積書出力
    document.getElementById("btnPdf").addEventListener("click", function () {
      generateEstimatePdf();
    });

    // AI指示書（プロンプト）ダウンロード
    document.getElementById("btnPrompt").addEventListener("click", function () {
      downloadPrompt();
    });

    // 設定モーダル
    document.getElementById("btnSettings").addEventListener("click", function () {
      openSettings();
    });
    document.getElementById("btnCloseSettings").addEventListener("click", function () {
      document.getElementById("settingsModal").classList.remove("open");
    });
    document.getElementById("settingsModal").addEventListener("click", function (e) {
      if (e.target === this) this.classList.remove("open");
    });
    document.getElementById("btnSaveSettings").addEventListener("click", function () {
      saveSettings();
    });
    document.getElementById("btnResetPrices").addEventListener("click", function () {
      if (confirm("すべての金額を初期値に戻しますか？")) {
        resetPrices();
      }
    });
  }

  // --- ステップ遷移 ---
  function goToStep(step) {
    state.currentStep = step;

    // パネル表示
    document.querySelectorAll(".step-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.getElementById("step" + step).classList.add("active");

    // ナビ状態
    document.querySelectorAll(".step-nav-item").forEach((btn) => {
      const s = parseInt(btn.dataset.step);
      btn.classList.remove("active", "completed");
      if (s === step) btn.classList.add("active");
      else if (s < step) btn.classList.add("completed");
    });

    // ボタン表示
    const $prev = document.getElementById("btnPrev");
    const $next = document.getElementById("btnNext");
    $prev.style.display = step > 1 ? "" : "none";
    $next.textContent = step < 4 ? "次のステップへ" : "見積もり完了";

    // ページ単価ラベル更新
    if (step === 2) {
      updatePagePriceLabels();
    }

    saveState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- 単価ラベル更新 ---
  function updatePagePriceLabels() {
    const prices = state.siteType ? PRICE_MAP[state.siteType] : null;
    document.querySelectorAll(".page-price-label").forEach((label) => {
      const key = label.dataset.priceKey;
      if (prices) {
        label.textContent = "¥" + prices[key].toLocaleString() + " / ページ";
      } else {
        label.textContent = "サイト種別を選択してください";
      }
    });
  }

  // --- 数量表示を同期 ---
  function syncQtyDisplay(pageId) {
    const qty = state.pages[pageId] || 0;
    document
      .querySelectorAll(`.qty-value[data-page="${pageId}"]`)
      .forEach((el) => {
        el.textContent = qty;
      });
    document
      .querySelectorAll(`.qty-btn[data-page="${pageId}"][data-action="dec"]`)
      .forEach((btn) => {
        btn.disabled = qty <= 0;
      });
  }

  // --- 合計計算 ---
  function updateTotal() {
    const prices = state.siteType ? PRICE_MAP[state.siteType] : null;
    let subtotal = 0;
    let totalPages = 0;

    // LPの場合はトップページのみ
    if (state.siteType === "lp") {
      subtotal = PRICE_MAP.lp.top;
      totalPages = 1;
    } else if (prices) {
      // ページ費用
      const allPages = [
        ...PAGE_DATA.basic,
        ...PAGE_DATA.content,
        ...PAGE_DATA.other,
      ];
      allPages.forEach((p) => {
        const qty = state.pages[p.id] || 0;
        if (qty > 0) {
          const unitPrice =
            p.id === "top" ? prices.top : prices[p.priceKey] || 0;
          subtotal += unitPrice * qty;
          totalPages += qty;
        }
      });
    }

    // 機能費用
    FEATURES.forEach((f) => {
      if (state.features[f.id]) {
        subtotal += f.price;
      }
    });

    // システム費用
    SYSTEMS.forEach((s) => {
      if (state.systems[s.id]) {
        subtotal += s.price;
      }
    });

    // ディレクション費
    const direction = Math.round(subtotal * DIRECTION_RATE);
    const total = subtotal + direction;
    const totalWithTax = Math.round(total * (1 + TAX_RATE));

    $totalAmount.textContent = "¥" + total.toLocaleString();
    $totalTax.textContent = "税込: ¥" + totalWithTax.toLocaleString();
    $totalPages.textContent = "総ページ数: " + totalPages;
  }

  // --- テキストコピー ---
  function copyEstimate() {
    const prices = state.siteType ? PRICE_MAP[state.siteType] : null;
    const lines = [];
    const siteTypeNames = {
      lp: "ランディングページ",
      corporate: "コーポレートサイト",
      recruit: "採用サイト",
      ec: "ECサイト",
      media: "メディア・ブログ",
    };

    lines.push("【Web制作 概算見積もり】");
    lines.push("━━━━━━━━━━━━━━━━━━");

    if (state.siteType) {
      lines.push("■ サイト種別: " + siteTypeNames[state.siteType]);
    }

    lines.push("");
    lines.push("■ ページ構成");

    let subtotal = 0;
    let totalPages = 0;

    if (state.siteType === "lp") {
      lines.push("  ・トップページ × 1  ¥70,000");
      subtotal = 70000;
      totalPages = 1;
    } else if (prices) {
      const allPages = [
        ...PAGE_DATA.basic,
        ...PAGE_DATA.content,
        ...PAGE_DATA.other,
      ];
      allPages.forEach((p) => {
        const qty = state.pages[p.id] || 0;
        if (qty > 0) {
          const unitPrice =
            p.id === "top" ? prices.top : prices[p.priceKey] || 0;
          const lineTotal = unitPrice * qty;
          subtotal += lineTotal;
          totalPages += qty;
          lines.push(
            `  ・${p.name} × ${qty}  ¥${lineTotal.toLocaleString()}`
          );
        }
      });
    }

    const selectedFeatures = FEATURES.filter((f) => state.features[f.id]);
    if (selectedFeatures.length > 0) {
      lines.push("");
      lines.push("■ 機能・エフェクト");
      selectedFeatures.forEach((f) => {
        subtotal += f.price;
        lines.push(`  ・${f.name}  ¥${f.price.toLocaleString()}`);
      });
    }

    const selectedSystems = SYSTEMS.filter((s) => state.systems[s.id]);
    if (selectedSystems.length > 0) {
      lines.push("");
      lines.push("■ システム・設定");
      selectedSystems.forEach((s) => {
        subtotal += s.price;
        lines.push(`  ・${s.name}  ¥${s.price.toLocaleString()}`);
      });
    }

    const direction = Math.round(subtotal * DIRECTION_RATE);
    const total = subtotal + direction;
    const totalWithTax = Math.round(total * (1 + TAX_RATE));

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━");
    lines.push(`制作費小計: ¥${subtotal.toLocaleString()}`);
    lines.push(
      `ディレクション費 (${DIRECTION_RATE * 100}%): ¥${direction.toLocaleString()}`
    );
    lines.push(`合計 (税抜): ¥${total.toLocaleString()}`);
    lines.push(`合計 (税込): ¥${totalWithTax.toLocaleString()}`);
    lines.push(`総ページ数: ${totalPages}ページ`);
    lines.push("━━━━━━━━━━━━━━━━━━");

    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => showToast("コピーしました"))
      .catch(() => {
        // フォールバック
        const ta = document.createElement("textarea");
        ta.value = lines.join("\n");
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("コピーしました");
      });
  }

  // --- 設定モーダル ---
  function openSettings() {
    const body = document.getElementById("settingsBody");
    const siteTypeNames = {
      lp: "LP", corporate: "コーポレート", recruit: "採用",
      ec: "EC", media: "メディア",
    };
    const priceKeyNames = { top: "トップページ", page: "通常ページ", simple: "簡易ページ" };

    let html = "";

    // 消費税・ディレクション費
    html += '<div class="settings-section">';
    html += '<div class="settings-section-title">基本設定</div>';
    html += `<div class="settings-row">
      <span class="settings-label">消費税率</span>
      <input type="number" class="settings-input" id="set-tax" value="${TAX_RATE * 100}" min="0" max="100" step="1">
      <span class="settings-unit">%</span>
    </div>`;
    html += `<div class="settings-row">
      <span class="settings-label">ディレクション費率</span>
      <input type="number" class="settings-input" id="set-direction" value="${DIRECTION_RATE * 100}" min="0" max="100" step="1">
      <span class="settings-unit">%</span>
    </div>`;
    html += "</div>";

    // サイト種別ごとの単価
    Object.keys(PRICE_MAP).forEach((type) => {
      html += '<div class="settings-section">';
      html += `<div class="settings-section-title">${siteTypeNames[type]} 単価</div>`;
      Object.keys(PRICE_MAP[type]).forEach((key) => {
        html += `<div class="settings-row">
          <span class="settings-label">${priceKeyNames[key]}</span>
          <input type="number" class="settings-input" id="set-pm-${type}-${key}" value="${PRICE_MAP[type][key]}" min="0" step="1000">
          <span class="settings-unit">円</span>
        </div>`;
      });
      html += "</div>";
    });

    // 機能
    html += '<div class="settings-section">';
    html += '<div class="settings-section-title">機能・エフェクト</div>';
    FEATURES.forEach((f) => {
      html += `<div class="settings-row">
        <span class="settings-label">${f.name}</span>
        <input type="number" class="settings-input" id="set-feat-${f.id}" value="${f.price}" min="0" step="1000">
        <span class="settings-unit">円</span>
      </div>`;
    });
    html += "</div>";

    // システム
    html += '<div class="settings-section">';
    html += '<div class="settings-section-title">システム・設定</div>';
    SYSTEMS.forEach((s) => {
      html += `<div class="settings-row">
        <span class="settings-label">${s.name}</span>
        <input type="number" class="settings-input" id="set-sys-${s.id}" value="${s.price}" min="0" step="1000">
        <span class="settings-unit">円</span>
      </div>`;
    });
    html += "</div>";

    body.innerHTML = html;
    document.getElementById("settingsModal").classList.add("open");
  }

  function saveSettings() {
    const config = { features: {}, systems: {}, priceMap: {} };

    // 消費税・ディレクション費
    config.taxRate = (parseFloat(document.getElementById("set-tax").value) || 10) / 100;
    config.directionRate = (parseFloat(document.getElementById("set-direction").value) || 10) / 100;

    // サイト種別単価
    Object.keys(PRICE_MAP).forEach((type) => {
      config.priceMap[type] = {};
      Object.keys(PRICE_MAP[type]).forEach((key) => {
        const el = document.getElementById(`set-pm-${type}-${key}`);
        config.priceMap[type][key] = parseInt(el.value) || 0;
      });
    });

    // 機能
    FEATURES.forEach((f) => {
      const el = document.getElementById(`set-feat-${f.id}`);
      config.features[f.id] = parseInt(el.value) || 0;
    });

    // システム
    SYSTEMS.forEach((s) => {
      const el = document.getElementById(`set-sys-${s.id}`);
      config.systems[s.id] = parseInt(el.value) || 0;
    });

    savePriceConfig(config);
    applyPriceConfig(config);

    // UI再描画
    renderFeatures("featureList", FEATURES, "features");
    renderFeatures("systemList", SYSTEMS, "systems");
    restoreState();
    updatePagePriceLabels();
    updateTotal();

    document.getElementById("settingsModal").classList.remove("open");
    showToast("金額設定を保存しました");
  }

  function resetPrices() {
    // デフォルトに戻す
    DEFAULT_FEATURES.forEach((df, i) => { FEATURES[i].price = df.price; });
    DEFAULT_SYSTEMS.forEach((ds, i) => { SYSTEMS[i].price = ds.price; });
    Object.keys(DEFAULT_PRICE_MAP).forEach((type) => {
      Object.assign(PRICE_MAP[type], DEFAULT_PRICE_MAP[type]);
    });
    TAX_RATE = DEFAULT_TAX_RATE;
    DIRECTION_RATE = DEFAULT_DIRECTION_RATE;

    localStorage.removeItem("mitsumori_prices");

    // UI再描画
    renderFeatures("featureList", FEATURES, "features");
    renderFeatures("systemList", SYSTEMS, "systems");
    restoreState();
    updatePagePriceLabels();
    updateTotal();

    document.getElementById("settingsModal").classList.remove("open");
    showToast("初期値に戻しました");
  }

  // --- 見積もり計算ヘルパー（共通） ---
  function calcEstimateData() {
    const prices = state.siteType ? PRICE_MAP[state.siteType] : null;
    const siteTypeNames = {
      lp: "ランディングページ",
      corporate: "コーポレートサイト",
      recruit: "採用サイト",
      ec: "ECサイト",
      media: "メディア・ブログ",
    };

    let subtotal = 0;
    let totalPages = 0;
    const pageItems = [];
    const featureItems = [];
    const systemItems = [];

    if (state.siteType === "lp") {
      pageItems.push({ name: "トップページ（LP）", qty: 1, unit: 70000, total: 70000 });
      subtotal = 70000;
      totalPages = 1;
    } else if (prices) {
      const allPages = [...PAGE_DATA.basic, ...PAGE_DATA.content, ...PAGE_DATA.other];
      allPages.forEach((p) => {
        const qty = state.pages[p.id] || 0;
        if (qty > 0) {
          const unitPrice = p.id === "top" ? prices.top : prices[p.priceKey] || 0;
          const lineTotal = unitPrice * qty;
          subtotal += lineTotal;
          totalPages += qty;
          pageItems.push({ name: p.name, qty, unit: unitPrice, total: lineTotal });
        }
      });
    }

    FEATURES.forEach((f) => {
      if (state.features[f.id]) {
        subtotal += f.price;
        featureItems.push({ name: f.name, desc: f.desc, price: f.price });
      }
    });

    SYSTEMS.forEach((s) => {
      if (state.systems[s.id]) {
        subtotal += s.price;
        systemItems.push({ name: s.name, desc: s.desc, price: s.price });
      }
    });

    const direction = Math.round(subtotal * DIRECTION_RATE);
    const total = subtotal + direction;
    const totalWithTax = Math.round(total * (1 + TAX_RATE));

    return {
      siteType: state.siteType,
      siteTypeName: siteTypeNames[state.siteType] || "未選択",
      pageItems,
      featureItems,
      systemItems,
      subtotal,
      direction,
      total,
      totalWithTax,
      totalPages,
    };
  }

  // --- 見積書PDF生成 ---
  function generateEstimatePdf() {
    const d = calcEstimateData();
    if (!state.siteType) {
      showToast("サイト種別を選択してください");
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const estNo = `EST-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    let rowNum = 0;
    function tableRow(name, desc, qty, unit, amount) {
      rowNum++;
      const bg = rowNum % 2 === 0 ? "#f8fafc" : "#fff";
      return `<tr style="background:${bg}">
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155">${name}${desc ? '<br><span style="font-size:11px;color:#94a3b8">' + desc + "</span>" : ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#64748b">${qty || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;color:#64748b">${unit ? "¥" + unit.toLocaleString() : ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-weight:600;color:#1e3a5f">¥${amount.toLocaleString()}</td>
      </tr>`;
    }

    function sectionHeader(title) {
      return `<tr><td colspan="4" style="padding:10px 12px 6px;font-size:12px;font-weight:700;color:#3eb2d2;border-bottom:2px solid #3eb2d2;letter-spacing:0.05em">${title}</td></tr>`;
    }

    let rows = "";

    // ページ構成
    if (d.pageItems.length > 0) {
      rows += sectionHeader("ページ構成");
      d.pageItems.forEach((p) => {
        rows += tableRow(p.name, "", p.qty, p.unit, p.total);
      });
    }

    // 機能・エフェクト
    if (d.featureItems.length > 0) {
      rows += sectionHeader("機能・エフェクト");
      d.featureItems.forEach((f) => {
        rows += tableRow(f.name, f.desc, 1, f.price, f.price);
      });
    }

    // システム・設定
    if (d.systemItems.length > 0) {
      rows += sectionHeader("システム・設定");
      d.systemItems.forEach((s) => {
        rows += tableRow(s.name, s.desc, 1, s.price, s.price);
      });
    }

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>御見積書 - ${estNo}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Hiragino Kaku Gothic ProN","Noto Sans JP","Meiryo",sans-serif; color: #334155; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="text-align:center;margin-bottom:24px">
  <button onclick="window.print()" style="background:#3eb2d2;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit">PDF保存 / 印刷</button>
</div>

<!-- ヘッダー -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
  <div>
    <h1 style="font-size:28px;font-weight:800;color:#1e3a5f;letter-spacing:0.08em">御 見 積 書</h1>
    <p style="font-size:12px;color:#94a3b8;margin-top:4px">ESTIMATE</p>
  </div>
  <div style="text-align:right">
    <p style="font-size:12px;color:#64748b">見積番号: ${estNo}</p>
    <p style="font-size:12px;color:#64748b">発行日: ${dateStr}</p>
  </div>
</div>

<!-- 金額バー -->
<div style="background:linear-gradient(135deg,#1e3a5f,#255797);border-radius:12px;padding:24px 32px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center">
  <div>
    <p style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px">お見積もり金額（税込）</p>
    <p style="font-size:32px;font-weight:800;color:#fff;letter-spacing:0.02em">¥${d.totalWithTax.toLocaleString()}</p>
  </div>
  <div style="text-align:right">
    <p style="font-size:12px;color:rgba(255,255,255,0.6)">税抜: ¥${d.total.toLocaleString()}</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.6)">総ページ数: ${d.totalPages}ページ</p>
  </div>
</div>

<!-- 宛先・差出人 -->
<div style="display:flex;justify-content:space-between;margin-bottom:28px">
  <div style="flex:1">
    <p style="font-size:11px;color:#94a3b8;margin-bottom:4px">宛先</p>
    <div style="border-bottom:2px solid #1e3a5f;padding-bottom:8px;margin-right:40px">
      <p style="font-size:16px;font-weight:700;color:#1e3a5f">＿＿＿＿＿＿＿＿＿＿ 御中</p>
    </div>
    <p style="font-size:11px;color:#94a3b8;margin-top:8px">サイト種別: ${d.siteTypeName}</p>
  </div>
  <div style="text-align:right">
    <p style="font-size:11px;color:#94a3b8;margin-bottom:4px">発行者</p>
    <p style="font-size:13px;color:#334155;font-weight:600">＿＿＿＿＿＿＿＿</p>
    <p style="font-size:11px;color:#94a3b8;margin-top:2px">TEL: ＿＿＿＿＿＿</p>
    <p style="font-size:11px;color:#94a3b8">MAIL: ＿＿＿＿＿＿</p>
  </div>
</div>

<!-- 明細テーブル -->
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
  <thead>
    <tr style="background:#f1f5f9">
      <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;border-bottom:2px solid #cbd5e1;width:50%">項目</th>
      <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#64748b;border-bottom:2px solid #cbd5e1;width:10%">数量</th>
      <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;border-bottom:2px solid #cbd5e1;width:20%">単価</th>
      <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#64748b;border-bottom:2px solid #cbd5e1;width:20%">金額</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<!-- 小計エリア -->
<div style="display:flex;justify-content:flex-end">
  <table style="border-collapse:collapse;min-width:300px">
    <tr>
      <td style="padding:8px 16px;font-size:13px;color:#64748b">制作費小計</td>
      <td style="padding:8px 16px;text-align:right;font-size:13px;font-weight:600;color:#334155">¥${d.subtotal.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px 16px;font-size:13px;color:#64748b">ディレクション費 (${DIRECTION_RATE * 100}%)</td>
      <td style="padding:8px 16px;text-align:right;font-size:13px;font-weight:600;color:#334155">¥${d.direction.toLocaleString()}</td>
    </tr>
    <tr style="border-top:2px solid #e2e8f0">
      <td style="padding:8px 16px;font-size:13px;color:#64748b">合計（税抜）</td>
      <td style="padding:8px 16px;text-align:right;font-size:15px;font-weight:700;color:#1e3a5f">¥${d.total.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px 16px;font-size:13px;color:#64748b">消費税 (${TAX_RATE * 100}%)</td>
      <td style="padding:8px 16px;text-align:right;font-size:13px;font-weight:600;color:#334155">¥${(d.totalWithTax - d.total).toLocaleString()}</td>
    </tr>
    <tr style="border-top:2px solid #1e3a5f">
      <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#1e3a5f">合計（税込）</td>
      <td style="padding:12px 16px;text-align:right;font-size:20px;font-weight:800;color:#1e3a5f">¥${d.totalWithTax.toLocaleString()}</td>
    </tr>
  </table>
</div>

<!-- 備考 -->
<div style="margin-top:28px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
  <p style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:6px">備考</p>
  <p style="font-size:11px;color:#94a3b8;line-height:1.8">
    ・本見積書の有効期限は発行日より30日間です。<br>
    ・上記金額は概算です。詳細なヒアリング後に正式見積書を発行いたします。<br>
    ・制作期間はご発注後、内容に応じて別途ご案内いたします。
  </p>
</div>

</body>
</html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  // --- AI指示書プロンプト生成・ダウンロード ---
  function downloadPrompt() {
    const d = calcEstimateData();
    if (!state.siteType) {
      showToast("サイト種別を選択してください");
      return;
    }

    const lines = [];
    lines.push("# Web制作 指示書（AI向けプロンプト）");
    lines.push("");
    lines.push("以下の仕様に基づいてWebサイトを制作してください。");
    lines.push("");

    // サイト概要
    lines.push("## 1. サイト概要");
    lines.push("");
    lines.push(`- **サイト種別**: ${d.siteTypeName}`);
    lines.push(`- **総ページ数**: ${d.totalPages}ページ`);
    lines.push("");

    // ページ構成
    if (d.pageItems.length > 0) {
      lines.push("## 2. ページ構成");
      lines.push("");
      lines.push("以下のページを作成してください。");
      lines.push("");
      d.pageItems.forEach((p) => {
        if (p.qty > 1) {
          lines.push(`- **${p.name}** × ${p.qty}ページ`);
        } else {
          lines.push(`- **${p.name}**`);
        }
      });
      lines.push("");
    }

    // 機能・エフェクト
    if (d.featureItems.length > 0) {
      lines.push("## 3. 実装する機能・エフェクト");
      lines.push("");
      d.featureItems.forEach((f) => {
        lines.push(`### ${f.name}`);
        lines.push(`- ${f.desc}`);
        lines.push("");
      });
    }

    // システム・設定
    if (d.systemItems.length > 0) {
      lines.push("## 4. システム・設定要件");
      lines.push("");
      d.systemItems.forEach((s) => {
        lines.push(`### ${s.name}`);
        lines.push(`- ${s.desc}`);
        lines.push("");
      });
    }

    // 技術仕様の推奨
    lines.push("## 5. 技術要件");
    lines.push("");

    if (state.systems["wordpress"]) {
      lines.push("- **CMS**: WordPress を使用");
      lines.push("- カスタムテーマを作成し、管理画面からコンテンツ更新可能にすること");
    } else {
      lines.push("- **構成**: HTML / CSS / JavaScript による静的サイト");
    }

    if (state.systems["responsive"]) {
      lines.push("- **レスポンシブ**: PC（1280px以上）、タブレット（768px〜1279px）、スマートフォン（767px以下）の3ブレイクポイント対応");
    }
    if (state.systems["seo"]) {
      lines.push("- **SEO**: 各ページに適切なmeta title / description / OGPタグ / 構造化データ(JSON-LD)を設定");
    }
    if (state.systems["ssl"]) {
      lines.push("- **セキュリティ**: HTTPS必須、セキュリティヘッダー（CSP, X-Frame-Options等）を設定");
    }
    if (state.systems["speed"]) {
      lines.push("- **パフォーマンス**: 画像はWebP/AVIF形式で最適化、CSS/JSの圧縮・minify、Lazy Loading実装");
    }
    if (state.systems["analytics"]) {
      lines.push("- **計測**: Google Analytics 4 (GA4) と Google Search Console を導入");
    }
    if (state.systems["ec-system"]) {
      lines.push("- **EC機能**: カート機能、決済システム連携（Stripe等）、在庫管理、注文管理を実装");
    }

    lines.push("");

    // ディレクトリ構成
    lines.push("## 6. ディレクトリ構成の例");
    lines.push("");
    lines.push("```");
    if (state.systems["wordpress"]) {
      lines.push("theme/");
      lines.push("├── style.css");
      lines.push("├── functions.php");
      lines.push("├── header.php");
      lines.push("├── footer.php");
      lines.push("├── index.php");
      d.pageItems.forEach((p) => {
        lines.push(`├── page-${p.name}.php`);
      });
      lines.push("├── assets/");
      lines.push("│   ├── css/");
      lines.push("│   ├── js/");
      lines.push("│   └── images/");
      lines.push("└── template-parts/");
    } else {
      lines.push("project/");
      lines.push("├── index.html");
      d.pageItems.forEach((p) => {
        if (p.name !== "トップページ" && p.name !== "トップページ（LP）") {
          lines.push(`├── ${p.name.toLowerCase().replace(/[・/]/g, "-")}.html`);
        }
      });
      lines.push("├── css/");
      lines.push("│   └── style.css");
      lines.push("├── js/");
      lines.push("│   └── main.js");
      lines.push("└── images/");
    }
    lines.push("```");
    lines.push("");

    // デザイン指示
    lines.push("## 7. デザイン指示");
    lines.push("");
    lines.push("- モダンでクリーンなデザイン");
    lines.push("- 十分な余白（ホワイトスペース）を確保");
    lines.push("- フォント: Noto Sans JP（本文）、見出しはウェイト700以上");
    lines.push("- カラーパレットは以下を参考に（適宜調整してください）:");
    lines.push("  - メインカラー: #255797");
    lines.push("  - アクセントカラー: #3eb2d2");
    lines.push("  - テキスト: #334155");
    lines.push("  - 背景: #f8fafc");
    lines.push("");

    // 注意事項
    lines.push("## 8. 注意事項");
    lines.push("");
    lines.push("- セマンティックなHTMLを使用すること");
    lines.push("- アクセシビリティ（WAI-ARIA、alt属性等）に配慮すること");
    lines.push("- クロスブラウザ対応（Chrome, Safari, Firefox, Edge の最新版）");
    lines.push("- コードにはわかりやすいコメントを適宜追加すること");
    lines.push("- 画像はダミー（placeholder）で構いませんが、適切なサイズ・アスペクト比で配置すること");
    lines.push("");

    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `web-制作指示書_${d.siteTypeName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("指示書をダウンロードしました");
  }

  // --- トースト ---
  function showToast(msg) {
    $toast.textContent = msg;
    $toast.classList.add("show");
    setTimeout(() => $toast.classList.remove("show"), 2000);
  }

  // --- 状態の保存・復元 ---
  function saveState() {
    try {
      localStorage.setItem("mitsumori_state", JSON.stringify(state));
    } catch (_) {
      // ignore
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem("mitsumori_state");
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  }

  function restoreState() {
    // サイト種別
    if (state.siteType) {
      const radio = document.querySelector(
        `input[name="siteType"][value="${state.siteType}"]`
      );
      if (radio) radio.checked = true;
    }

    // ページ
    Object.keys(state.pages).forEach((pageId) => {
      const qty = state.pages[pageId];
      if (qty > 0) {
        const item = document.querySelector(
          `.page-item[data-page-id="${pageId}"]`
        );
        if (item) {
          item.classList.add("selected");
          item.querySelector(".page-check").checked = true;
        }
      }
      syncQtyDisplay(pageId);
    });

    // 機能
    Object.keys(state.features).forEach((fId) => {
      if (state.features[fId]) {
        const item = document.querySelector(
          `.feature-item[data-feature-id="${fId}"][data-state-key="features"]`
        );
        if (item) {
          item.classList.add("selected");
          item.querySelector(".feature-check").checked = true;
        }
      }
    });

    // システム
    Object.keys(state.systems).forEach((sId) => {
      if (state.systems[sId]) {
        const item = document.querySelector(
          `.feature-item[data-feature-id="${sId}"][data-state-key="systems"]`
        );
        if (item) {
          item.classList.add("selected");
          item.querySelector(".feature-check").checked = true;
        }
      }
    });
  }

  function resetState() {
    state = {
      currentStep: 1,
      siteType: null,
      pages: {},
      features: {},
      systems: {},
    };

    // UI リセット
    document.querySelectorAll('input[name="siteType"]').forEach((r) => {
      r.checked = false;
    });
    document.querySelectorAll(".page-check, .feature-check").forEach((c) => {
      c.checked = false;
    });
    document.querySelectorAll(".page-item, .feature-item").forEach((el) => {
      el.classList.remove("selected");
    });
    document.querySelectorAll(".qty-value").forEach((el) => {
      el.textContent = "0";
    });
    document.querySelectorAll('.qty-btn[data-action="dec"]').forEach((btn) => {
      btn.disabled = true;
    });

    updateTotal();
    goToStep(1);
    saveState();
    showToast("リセットしました");
  }

  // --- 起動 ---
  init();
})();

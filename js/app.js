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

  const FEATURES = [
    {
      id: "contact-form",
      name: "お問い合わせフォーム",
      desc: "入力フォーム・バリデーション・送信機能",
      price: 30000,
    },
    {
      id: "slider",
      name: "スライダー / カルーセル",
      desc: "画像やコンテンツのスライド表示",
      price: 15000,
    },
    {
      id: "animation",
      name: "スクロールアニメーション",
      desc: "スクロール連動のアニメーション効果",
      price: 20000,
    },
    {
      id: "gmap",
      name: "Googleマップ埋め込み",
      desc: "地図の表示・カスタムピン設定",
      price: 10000,
    },
    {
      id: "sns",
      name: "SNSフィード連携",
      desc: "X(Twitter)やInstagramの埋め込み",
      price: 15000,
    },
    {
      id: "search",
      name: "サイト内検索",
      desc: "キーワード検索機能の実装",
      price: 30000,
    },
    {
      id: "multilang",
      name: "多言語対応",
      desc: "日本語・英語などの言語切替",
      price: 50000,
    },
    {
      id: "loading",
      name: "ローディング画面",
      desc: "ページ読み込み時のアニメーション",
      price: 15000,
    },
    {
      id: "modal",
      name: "モーダル / ポップアップ",
      desc: "画像拡大やお知らせ表示",
      price: 10000,
    },
    {
      id: "hamburger",
      name: "ハンバーガーメニュー",
      desc: "モバイル用のドロワーメニュー",
      price: 10000,
    },
  ];

  const SYSTEMS = [
    {
      id: "responsive",
      name: "レスポンシブ対応",
      desc: "PC・タブレット・スマートフォン対応",
      price: 50000,
    },
    {
      id: "seo",
      name: "SEO基本設定",
      desc: "メタタグ・OGP・構造化データ設定",
      price: 30000,
    },
    {
      id: "wordpress",
      name: "WordPress構築",
      desc: "CMSとしてのWordPress導入・設定",
      price: 150000,
    },
    {
      id: "ec-system",
      name: "EC機能実装",
      desc: "カート・決済・在庫管理機能",
      price: 200000,
    },
    {
      id: "analytics",
      name: "アクセス解析設定",
      desc: "Google Analytics / Search Console 設定",
      price: 15000,
    },
    {
      id: "server",
      name: "サーバー・ドメイン設定",
      desc: "レンタルサーバー・ドメインの取得設定",
      price: 20000,
    },
    {
      id: "ssl",
      name: "SSL/セキュリティ対策",
      desc: "HTTPS化・セキュリティヘッダー設定",
      price: 10000,
    },
    {
      id: "speed",
      name: "表示速度最適化",
      desc: "画像最適化・キャッシュ・圧縮設定",
      price: 25000,
    },
  ];

  // サイト種別ごとの単価
  const PRICE_MAP = {
    lp: { top: 70000, page: 0, simple: 0 },
    corporate: { top: 80000, page: 65000, simple: 30000 },
    recruit: { top: 80000, page: 65000, simple: 30000 },
    ec: { top: 100000, page: 80000, simple: 30000 },
    media: { top: 70000, page: 60000, simple: 25000 },
  };

  const TAX_RATE = 0.1;
  const DIRECTION_RATE = 0.1;

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

    // PDF出力
    document.getElementById("btnPdf").addEventListener("click", function () {
      window.print();
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
